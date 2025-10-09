import prisma from "../utils/prismaClient.js";
import { getSpotifyAxios, handleAxiosError } from "../utils/axiosInstances.js";
import type { Playlist, PlaylistTrack, Track, User } from "../generated/prisma/client.js";
import * as Spotify from "../utils/types/spotifyTypes.js";
import type { Axios, AxiosInstance } from "axios";
import { getUserPlaylists } from "./playlistsController.js";
import { deleteUnsyncedPlaylists, unsyncPlaylist } from "./deleteData.js";
import pLimit from "p-limit";
import { SPOTIFY_CONCURRENCY_LIMIT } from "../utils/envLoader.js";
import type { BundledSpotifyPlaylistTracks } from "../utils/types/helperTypes.js";
import { partition } from "../utils/arrayUtils.js";
import type { PlaylistSyncCounts } from "spotifair";

export async function createAndSyncUser(accessToken: string, refreshToken: string) {
    const user = await upsertUser(accessToken, refreshToken);
    const spotifyAxios = getSpotifyAxios(accessToken);
    try {
        await syncSpotifyData(user, spotifyAxios);
        return user;
    } catch (err) {
        console.error(err);
        throw new Error("Error creating and syncing user");
    }
}

// Upsert a User and their Spotify Playlists in db
// Does not get or sync track, album, artist, or PlaylistTrack data
export async function upsertUserAndPlaylists(accessToken: string, refreshToken: string) {
    const user = await upsertUser(accessToken, refreshToken);
    await upsertPlaylistsWithoutData(user);
    return user;
}

// Upsert a User in the db
// Does not sync any additional data
async function upsertUser(accessToken: string, refreshToken: string) {
    const spotifyAxios = getSpotifyAxios(accessToken);
    const spotifyUserRes = await spotifyAxios.get('/me').catch(handleAxiosError);
    if (!spotifyUserRes) {
        throw new Error("Unable to find spotify user");
    }
    const spotifyUser: Spotify.User = spotifyUserRes.data;

    try {
        const user = await prisma.user.upsert({
            where: {
                spotifyUri: spotifyUser.uri,
            },
            update: {
                imageUrl: selectProperImage(spotifyUser.images),
                accessToken: accessToken,
                refreshToken: refreshToken,
                displayName: spotifyUser.display_name,
                ...(spotifyUser.country ? { country: spotifyUser.country } : {}), // Update country if it exists on spotifyUser
            },
            create: {
                spotifyUri: spotifyUser.uri,
                spotifyId: spotifyUser.id,
                imageUrl: selectProperImage(spotifyUser.images),
                accessToken: accessToken,
                refreshToken: refreshToken,
                displayName: spotifyUser.display_name,
                country: spotifyUser.country ? spotifyUser.country : null,
            },
        });

        return user;
    } catch (err) {
        console.error(err);
        throw new Error("Error upserting user");
    }
}

// Upsert all playlists belonging to a User in the db, delete all playlists no longer from Spotify
// Does not sync any necessary data (tracks, album, artists, PlaylistTracks) into db
async function upsertPlaylistsWithoutData(user: User) {
    try {
        const spotifyAxios = getSpotifyAxios(user.accessToken);
        // Spotify playlists
        const spotifySimplifiedPlaylists = await getSpotifyUserPlaylists(user, spotifyAxios);
        // DB playlists
        const userPlaylists = await getUserPlaylists(user.id);
        // Categorize them by overlap (or lack of it)
        const { toDelete, toUpdate, toInsert } = categorizePlaylists(spotifySimplifiedPlaylists, userPlaylists);

        // Delete playlists that the Spotify user no longer has
        if (toDelete.length > 0) {
            // No await because these playlists are effectively irrelevant to other calls
            const numDeleted = await deleteUnsyncedPlaylists(toDelete);
            console.log(`Deleted ${numDeleted} playlists`);
        }

        // Tracking array
        const upsertedPlaylists: Playlist[] = [];
        // Upsert new Spotify playlists (toInsert) and playlists where snapshot_id has changed (toUpdate)
        const toUpsert = toInsert.concat(toUpdate);
        for (const playlist of toUpsert) {
            // Upsert playlist into database
            console.log(`Upserting ${playlist.name}`);
            const upsertedPlaylist = await prisma.playlist.upsert({
                where: {
                    spotifyUri: playlist.uri
                },
                update: {
                    name: playlist.name,
                    coverUrl: selectProperImage(playlist.images),
                    spotifySnapshotId: playlist.snapshot_id,
                    syncCompleted: true,
                },
                create: {
                    spotifyUri: playlist.uri,
                    spotifyId: playlist.id,
                    spotifySnapshotId: playlist.snapshot_id,
                    syncCompleted: true,
                    name: playlist.name,
                    coverUrl: selectProperImage(playlist.images),
                    owner: {
                        connect: { id: user.id },
                    }
                },
            }).catch(err => console.error(`Failed to upsert playlist ${playlist.name}`, err));
            if (upsertedPlaylist) {
                // If successful upsertion, push to tracking array
                upsertedPlaylists.push(upsertedPlaylist);
            }
        }

        console.log("Playlists upserted");
        return upsertedPlaylists;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert playlsits");
    }
}

// Gets Spotify data needed for user (playlists, tracks, albums, artists), inserts/updates data in database
export async function syncSpotifyData(user: User, spotifyAxios: AxiosInstance) {
    try {
        const upsertedPlaylists = await upsertPlaylistsWithoutData(user);
        const toSync = upsertedPlaylists.filter(p => p.syncEnabled === true);
        await upsertSpotifyDataFromPlaylists(toSync, spotifyAxios);
        console.log("Spotify data synced");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to sync spotify data");
    }
}

// Returns an array of all the non-collaborate playlists a user owns from Spotify API
async function getSpotifyUserPlaylists(user: User, spotifyAxios: AxiosInstance) {
    // const spotifyAxios = getSpotifyAxios(user.accessToken);
    let playlists: Array<Spotify.SimplifiedPlaylistObject> = [];

    try {
        let morePlaylists = true;
        let offset = 0;
        const maxLimit = 50;
        while (morePlaylists) {
            const res = await spotifyAxios.get(`/me/playlists?offset=${offset}&limit=${maxLimit}`);
            const data = res.data;
            if (data.total > 0) {
                playlists = playlists.concat(data.items);
                offset += maxLimit;
            }
            morePlaylists = data.next != null;
        }
        console.log("Spotify playlists obtained");
        return playlists.filter(playlist => !playlist.collaborative && playlist.owner.uri == user.spotifyUri);
    } catch (err) {
        console.error(err);
        throw new Error("Error fetching Spotify playlists");
    }
}

async function getSpotifyPlaylistTracks(playlist: Playlist, spotifyAxios: AxiosInstance): Promise<BundledSpotifyPlaylistTracks> {
    let tracks: Array<Spotify.PlaylistTrackObject> = [];
    try {
        console.log(`Loading tracks obtained for playlist ${playlist.name}`);
        let moreTracks = true;
        let offset = 0;
        const maxLimit = 100;
        while (moreTracks) {
            const res = await spotifyAxios.get(`/playlists/${playlist.spotifyId}/tracks?offset=${offset}&limit=${maxLimit}`);
            const data = res.data;
            if (data.total > 0) {
                tracks = tracks.concat(data.items);
                moreTracks = data.next != null;
                offset += maxLimit;
            } else {
                moreTracks = false;
            }
        }
        const nonPodcastTracks = tracks.filter((playlistTrack) => playlistTrack.track && playlistTrack.track.type == "track");
        console.log(`\tSpotify tracks obtained for playlist ${playlist.name}`);
        return { playlist: playlist, spotifyPlaylistTracks: nonPodcastTracks };
    } catch (err) {
        console.error(err);
        throw new Error("Error fetching Spotify playlist tracks");
    }
}

function selectProperImage(images: Spotify.ImageObject[] | null): string | null {
    if (images !== null && images.length > 0) {
        if (images.length > 1) {
            return images[1]!.url;
        }
        return images[0]!.url;
    }
    return null;
}

function selectFirstArtist(artists: Spotify.SimplifiedArtistObject[]): Spotify.SimplifiedArtistObject {
    if (!artists || artists.length < 1) {
        throw new Error("No artists in array");
    }
    return artists[0]!;
}

function categorizePlaylists(spotifyPlaylists: (Spotify.SimplifiedPlaylistObject)[], dbPlaylists: Playlist[]) {
    // Create spotifyId->playlist maps
    const dbMap = new Map(dbPlaylists.map(p => [p.spotifyId, p]));
    const spotifyMap = new Map(spotifyPlaylists.map(p => [p.id, p]));

    // Create playlist categories
    const toDelete = [];
    const toUpdate = [];
    const toInsert = [];

    // Sort into categories
    for (const [spotifyId, dbPlaylist] of dbMap.entries()) {
        if (!spotifyMap.has(spotifyId)) {
            // Case 1: Playlist exists in DB but not Spotify -> Delete from db
            if (!dbPlaylist.syncEnabled) {
                // Limit to only unsynced playlists because one time Spotify fed me fewer playlists than I had and it deleted them all
                toDelete.push(dbPlaylist.id);
            }
        } else {
            const spotifyPlaylist = spotifyMap.get(spotifyId)!; // Assertion because we checked if spotifyMap has it
            if (spotifyPlaylist.snapshot_id !== dbPlaylist.spotifySnapshotId || !dbPlaylist.syncCompleted) {
                // Case 3: snapshot_id changed -> Update in db
                toUpdate.push(spotifyPlaylist);
            }
            // Case 2: snapshot_id same -> Leave it alone
        }
    }

    for (const [spotifyId, spotifyPlaylist] of spotifyMap.entries()) {
        if (!dbMap.has(spotifyId)) {
            toInsert.push(spotifyPlaylist);
        }
    }

    return { toDelete: toDelete, toUpdate: toUpdate, toInsert: toInsert };
}

export async function enableAndSyncPlaylist(playlist: Playlist, user: User): Promise<PlaylistSyncCounts> {
    if (user.id !== playlist.ownerId) {
        throw new Error("Attempted to enable and sync playlist belonging to wrong user");
    }

    try {
        const enabledPlaylist = await prisma.playlist.update({
            where: {
                id: playlist.id,
            },
            data: {
                syncEnabled: true,
            }
        });
        const spotifyAxios = getSpotifyAxios(user.accessToken);
        return await upsertSpotifyDataFromPlaylist(enabledPlaylist, spotifyAxios);
    } catch (err) {
        console.error(err);
        throw new Error("Failed to enable and sync playlist");
    }
}

export async function disableAndDeletePlaylistSync(playlist: Playlist): Promise<PlaylistSyncCounts> {
    try {
        const disabledPlaylist = await prisma.playlist.update({
            where: {
                id: playlist.id,
            },
            data: {
                syncEnabled: false,
            }
        });
        const { numPlaylistTracks, numTracks, numAlbums, numArtists } = await unsyncPlaylist(playlist.id);
        return { numPlaylistTracks, numTracks, numAlbums, numArtists };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to disable playlist sync");
    }
}

async function upsertSpotifyDataFromPlaylist(playlist: Playlist, spotifyAxios: AxiosInstance): Promise<PlaylistSyncCounts> {
    await markPlaylistSynced(playlist, false);
    const playlistSyncCounts = await getAndUpsertPlaylistTracks(playlist, spotifyAxios);
    await markPlaylistSynced(playlist, true);
    return playlistSyncCounts;
}

// Inserts all tracks, albums, artists and PlaylistTracks from these playlists into my database
async function upsertSpotifyDataFromPlaylists(upsertedPlaylists: Array<Playlist>, spotifyAxios: AxiosInstance) {
    try {
        // Get all Spotify.PlaylistTracks and upsert Tracks and PlaylistTracks with limited concurrency
        const limit = pLimit(SPOTIFY_CONCURRENCY_LIMIT);
        const getAndUpsertTasks = upsertedPlaylists.map(
            playlist => limit(async () => {
                upsertSpotifyDataFromPlaylist(playlist, spotifyAxios);
            })
        );
        const trackResults = await Promise.allSettled(getAndUpsertTasks);
        console.log("Spotify playlist data upserted");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert playlist data to database");
    }
}

async function markPlaylistSynced(playlist: Playlist, isSynced: boolean) {
    try {
        await prisma.playlist.update({
            where: {
                id: playlist.id,
            },
            data: {
                syncCompleted: isSynced,
            },
        })
    } catch (err) {
        console.error(`Failed to mark ${playlist.name} synced:`, err);
        throw err;
    }
}

async function getAndUpsertPlaylistTracks(playlist: Playlist, spotifyAxios: AxiosInstance): Promise<PlaylistSyncCounts> {
    const bundledSpotifyPlaylistTracks = await getSpotifyPlaylistTracks(playlist, spotifyAxios);
    const { numTracks, numAlbums, numArtists } = await upsertSpotifyDataFromTracks(bundledSpotifyPlaylistTracks.spotifyPlaylistTracks);
    console.log(`tracks: ${numTracks}, albums: ${numAlbums}, artists: ${numArtists} for playlist: ${playlist.name}`);
    const dbPlaylistTracks = await upsertPlaylistTracks(bundledSpotifyPlaylistTracks);
    return { numPlaylistTracks: dbPlaylistTracks.length, numTracks, numAlbums, numArtists };

}

// Inserts all tracks from playlist and albums and artist from those tracks into my database
async function upsertSpotifyDataFromTracks(spotifyPlaylistTracks: Spotify.PlaylistTrackObject[], batchSize = 50) {
    try {

        let tracks: Track[] = [];
        let numAlbums = 0;
        let numArtists = 0;

        for (let i = 0; i < spotifyPlaylistTracks.length; i += batchSize) {
            const playlistTrackBatch = spotifyPlaylistTracks.slice(i, i + batchSize);

            if (playlistTrackBatch.length <= 0) break;

            // Can do this because we filtered out episode tracks
            const spotifyTrackBatch = playlistTrackBatch.map(spotPlaylistTrack => spotPlaylistTrack.track as Spotify.TrackObject);

            // Upsert artist batch first
            const necessaryArtists = spotifyTrackBatch.map(spotifyTrack => selectFirstArtist(spotifyTrack.artists));
            numArtists += await upsertSpotifyDataFromArtists(necessaryArtists);
            // Find necessary artists in db
            const necessaryArtistsDb = await prisma.artist.findMany({
                where: {
                    spotifyUri: {
                        in: necessaryArtists.map(artist => artist.uri),
                    },
                },
            });
            // Create helper map
            const uriToArtistId = new Map(necessaryArtistsDb.map(a => [a.spotifyUri, a.id]));

            // Then upsert album batch
            const necessaryAlbums = spotifyTrackBatch.map(spotifyTrack => spotifyTrack.album);
            const { numArtists: newArtists, numAlbums: newAlbums } = await upsertSpotifyDataFromAlbums(necessaryAlbums);
            numArtists += newArtists;
            numAlbums += newAlbums;
            // Find necessary albums in db
            const necessaryAlbumsInDb = await prisma.album.findMany({
                where: {
                    spotifyUri: {
                        in: necessaryAlbums.map(album => album.uri),
                    },
                },
            });
            // Create helper map
            const uriToAlbumId = new Map(necessaryAlbumsInDb.map(a => [a.spotifyUri, a.id]));

            // Probably redundant error handling to make sure that the proper albums and artists actually exist
            const spotifyTracksWithNecessaryData = spotifyTrackBatch.filter(t => uriToArtistId.has(selectFirstArtist(t.artists).uri) && uriToAlbumId.has(t.album.uri));
            if (spotifyTracksWithNecessaryData.length < spotifyTrackBatch.length) {
                console.warn(`${spotifyTrackBatch.length - spotifyTracksWithNecessaryData.length} tracks skipped when inserting due to insufficient related data`);
            }

            // Find tracks already there
            const tracksInDb = await prisma.track.findMany({
                where: {
                    spotifyUri: {
                        in: spotifyTracksWithNecessaryData.map(t => t.uri),
                    }
                },
                include: {
                    album: {
                        select: {
                            name: true,
                        }
                    },
                    artist: {
                        select: {
                            name: true,
                        }
                    }
                }
            });
            const urisInDb = new Map(tracksInDb.map(t => [t.spotifyUri, t]));

            // toUpdate == all tracks from spotifyTracksWithNecessaryData that already exist in db
            // toInsert == all tracks from spotifyTracksWithNecessaryData that aren't in the db
            const [alreadyInDb, toInsert] = partition(spotifyTracksWithNecessaryData, st => urisInDb.has(st.uri));

            // Select only the tracks which have a difference somewhere
            const toUpdate = alreadyInDb.filter(t => {
                const dbTrack = urisInDb.get(t.uri)!; // non-null because of partition() call
                return dbTrack.name !== t.name || dbTrack.album.name !== t.album.name || dbTrack.artist.name !== selectFirstArtist(t.artists).name || dbTrack.durationMs !== t.duration_ms;
            });

            const metadataMap: Map<string, Spotify.PlaylistTrackMetadata> = new Map(
                playlistTrackBatch.map(pt => [
                    pt.track.uri,
                    {
                        added_by: pt.added_by,
                        added_at: pt.added_at,
                        is_local: pt.is_local
                    }
                ])
            );
            let insertedTracks: Track[] = [];
            let updatedTracks: Track[] = [];

            // Update track batch
            if (toUpdate.length > 0) {
                console.log(`Updating ${toUpdate.length} tracks`)
                updatedTracks = await Promise.all(
                    toUpdate.map(spotifyTrack =>
                        prisma.track.update({
                            where: { spotifyUri: spotifyTrack.uri },
                            data: {
                                name: spotifyTrack.name,
                                // Can assert non-null because we checked for related data above
                                artistId: uriToArtistId.get(selectFirstArtist(spotifyTrack.artists).uri)!,
                                albumId: uriToAlbumId.get(spotifyTrack.album.uri)!,
                                durationMs: spotifyTrack.duration_ms,

                            },
                        })
                    )
                );
            }

            // Then insert track batch
            if (toInsert.length > 0) {
                insertedTracks = await prisma.track.createManyAndReturn({
                    data: spotifyTracksWithNecessaryData.map(spotifyTrack => {
                        return {
                            spotifyUri: spotifyTrack.uri,
                            name: spotifyTrack.name,
                            // Can assert non-null because we checked for related data above
                            artistId: uriToArtistId.get(selectFirstArtist(spotifyTrack.artists).uri)!,
                            albumId: uriToAlbumId.get(spotifyTrack.album.uri)!,
                            durationMs: spotifyTrack.duration_ms,
                        };
                    }),
                    skipDuplicates: true,
                });
            }

            tracks = tracks.concat(updatedTracks);
            tracks = tracks.concat(insertedTracks);
        }

        console.log("Successfully upserted tracks data");
        return { numTracks: tracks.length, numAlbums, numArtists };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert track data");
    }
}

function concatTracksAndMetadata(
    newTracks: Track[],
    metadataMap: Map<string, Spotify.PlaylistTrackMetadata>,
    runningTracks: Track[],
    runningTrackMetadata: Spotify.PlaylistTrackMetadata[]
): { runningTracks: Track[], runningTrackMetadata: Spotify.PlaylistTrackMetadata[] } {
    if (newTracks.length > 0) {
        const updatedRunningTracks = runningTracks.concat(newTracks);
        const updatedRunningTrackMetadata = runningTrackMetadata.concat(newTracks.map(t => {
            const pt = metadataMap.get(t.spotifyUri)!; // Can assert because insertedTracks is subset of playlistTrackBatch
            return {
                added_at: pt.added_at,
                added_by: pt.added_by,
                is_local: pt.is_local,
            }
        }));
        return { runningTracks: updatedRunningTracks, runningTrackMetadata: updatedRunningTrackMetadata };
    }
    return { runningTracks, runningTrackMetadata };
}

// Inserts or updates artist in my database
async function upsertSpotifyDataFromArtist(artist: Spotify.SimplifiedArtistObject) {
    try {
        const upsertedArtist = await prisma.artist.upsert({
            where: {
                spotifyUri: artist.uri,
            },
            update: { name: artist.name },
            create: {
                spotifyUri: artist.uri,
                name: artist.name,
            },
        });
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert artist data for ${artist.name}`);
    }
}

// Inserts or updates multiple artists in my database
async function upsertSpotifyDataFromArtists(spotifyArtists: Spotify.SimplifiedArtistObject[]) {
    try {
        const artistsInDb = await prisma.artist.findMany({
            where: {
                spotifyUri: {
                    in: spotifyArtists.map(artist => artist.uri),
                },
            },
        });
        // Find artists not in DB
        const spotifyUrisInDb = artistsInDb.map(foundArtist => foundArtist.spotifyUri);
        const urisInDbSet = new Set(spotifyUrisInDb);
        const artistsNotInDb = spotifyArtists.filter(artist => !urisInDbSet.has(artist.uri));
        const urisNotInDbSet = new Set(artistsNotInDb.map(artist => artist.uri));
        const numArtists = urisNotInDbSet.size;
        // TODO: I'm doing this instead of a batch payload because I got deadlock on this method once and have no idea how to fix it
        for (const spotifyArtist of spotifyArtists) {
            await upsertSpotifyDataFromArtist(spotifyArtist);
        }

        // // Find artists in DB that differ
        // // const spotifyArtistMap = new Map(spotifyArtists.map(artist => [artist.uri, artist]));
        // // const artistsDiffInDb = artistsInDb.filter(artist => spotifyArtistMap.has(artist.spotifyUri) && artist.name !== spotifyArtistMap.get(artist.spotifyUri)!.name);

        // if (artistsNotInDb.length > 0) {
        //     // Add artists not in db
        //     const newArtists = await prisma.artist.createMany({
        //         data: artistsNotInDb.map(artist => {
        //             return {
        //                 spotifyUri: artist.uri,
        //                 name: artist.name,
        //             }
        //         }),
        //         skipDuplicates: true,
        //     })
        // }

        // // if (artistsDiffInDb.length > 0) {
        // //     // Update artists with new names
        // //     const renamedArtists = await prisma.artist.updateMany({
        // //         where: {
        // //             spotifyUri: {
        // //                 in: artistsDiffInDb.map(artist => artist.spotifyUri),
        // //             },
        // //         },
        // //         data: artistsDiffInDb.map(artist => {
        // //             // TODO: this is incorrect. It needs to be the new spotify name
        // //             return { name: artist.name };
        // //         }),
        // //     })
        // // }
        return numArtists
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert multiple artists data`);
    }
}

// Inserts or updates album in my database. Artist must exist!
// TODO: Add non-existent artist error handling!
async function upsertSpotifyDataFromAlbum(album: Spotify.AlbumObject) {
    try {
        const firstArtist = selectFirstArtist(album.artists);

        // TODO: This is not a real solution. This will double-query a ton of artists
        await upsertSpotifyDataFromArtist(firstArtist);

        const upsertedAlbum = await prisma.album.upsert({
            where: {
                spotifyUri: album.uri,
            },
            update: {
                name: album.name,
                coverUrl: selectProperImage(album.images),
            },
            create: {
                spotifyUri: album.uri,
                name: album.name,
                coverUrl: selectProperImage(album.images),
                artist: {
                    connect: { spotifyUri: firstArtist.uri }
                }
            }
        })
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert album data for ${album.name} (did you remember to create the artist first?)`);
    }
}

// Inserts or updates multiple albums in my database
async function upsertSpotifyDataFromAlbums(spotifyAlbums: Spotify.AlbumObject[]) {
    let numAlbums = 0;
    let numArtists = 0;
    try {
        // First handle inserting artists
        const necessaryArtists = spotifyAlbums.map(album => selectFirstArtist(album.artists));
        numArtists += await upsertSpotifyDataFromArtists(necessaryArtists);

        // Find albums already in DB
        const albumsInDb = await prisma.album.findMany({
            where: {
                spotifyUri: {
                    in: spotifyAlbums.map(album => album.uri),
                },
            },
        });
        // Discern albums not in DB
        const spotifyUrisInDb = albumsInDb.map(foundAlbum => foundAlbum.spotifyUri);
        const albumsInDbSet = new Set(spotifyUrisInDb);
        const albumsNotInDb = spotifyAlbums.filter(album => !albumsInDbSet.has(album.uri));

        // Discern albums in DB that differ
        // const spotifyAlbumsMap = new Map(spotifyAlbums.map(album => [album.uri, album]));
        // const albumsDiffInDb = albumsInDb.filter(album => spotifyAlbumsMap.has(album.spotifyUri) && album.name !== spotifyAlbumsMap.get(album.spotifyUri)!.name);


        if (albumsNotInDb.length > 0) {
            // Find necessary artists in db
            const necessaryArtistsDb = await prisma.artist.findMany({
                where: {
                    spotifyUri: {
                        in: necessaryArtists.map(artist => artist.uri),
                    },
                },
            });
            // Create helper map
            const uriToArtistId = new Map(necessaryArtistsDb.map(a => [a.spotifyUri, a.id]));

            // Add albums not in db
            const newAlbums = await prisma.album.createManyAndReturn({
                data: albumsNotInDb.map(album => {
                    return {
                        spotifyUri: album.uri,
                        name: album.name,
                        coverUrl: selectProperImage(album.images),
                        // Can assert non-null below because albumsNotInDb is subset of spotifyAlbums
                        artistId: uriToArtistId.get(selectFirstArtist(album.artists).uri)!,
                    }
                }),
                select: {
                    id: true,
                    spotifyUri: true,
                },
                skipDuplicates: true,
            });
            numAlbums += newAlbums.length;
        }

        // if (albumsDiffInDb.length > 0) {
        //     // Update albums with new names
        //     const renamedAlbums = await prisma.artist.updateMany({
        //         where: {
        //             spotifyUri: {
        //                 in: albumsDiffInDb.map(album => album.spotifyUri),
        //             },
        //         },
        //         // TODO: This is incorrect. It needs to be the new Spotify data
        //         data: albumsDiffInDb.map(album => {
        //             return { 
        //                 name: album.name
        //                 coverUrl: selectProperImage(album.images), 
        //             };
        //         }),
        //     })
        // }
        return { numAlbums, numArtists }
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert multiple artists data`);
    }
}


async function upsertPlaylistTracks(bundledSpotifyPlaylistTracks: BundledSpotifyPlaylistTracks) {
    const playlist = bundledSpotifyPlaylistTracks.playlist;
    try {
        let playlistTracks: PlaylistTrack[] = [];

        const spotifyPlaylistTracklist = bundledSpotifyPlaylistTracks.spotifyPlaylistTracks;
        const spotifyPlaylistTracklistUris = spotifyPlaylistTracklist.map(track => track.track.uri);

        const existingTracks = await prisma.track.findMany({
            where: {
                spotifyUri: {
                    in: spotifyPlaylistTracklistUris,
                }
            }
        });

        const existingPlaylistTracks = await prisma.playlistTrack.findMany({
            where: {
                playlistId: playlist.id,
            },
            include: {
                track: {
                    select: {
                        id: true,
                        spotifyUri: true,
                    }
                }
            }
        })

        const existingTrackUris = new Map(existingTracks.map(t => [t.spotifyUri, t.id]));
        // I'm simply going to skip playlist tracks that don't have their necessary tracks in the database
        // TODO: insert the tracks here?
        const spotifyTracklistWithNecessaryTracks = spotifyPlaylistTracklist.filter(t => existingTrackUris.has(t.track.uri));

        let i = 0;
        for (i = 0; i < spotifyTracklistWithNecessaryTracks.length; i++) {
            const spotifyPlaylistTrack = spotifyTracklistWithNecessaryTracks[i]!; // non-null assertion because it's a for loop
            const trackId = existingTrackUris.get(spotifyPlaylistTrack.track.uri)!; // non-null assertion because we filtered above
            const upsertedPlaylistTrack = await prisma.playlistTrack.upsert({
                where: {
                    playlistId_trackId: {
                        playlistId: playlist.id,
                        trackId: trackId,
                    }
                },
                update: {
                    playlistPosition: i,
                },
                create: {
                    playlistId: playlist.id,
                    trackId: trackId,
                    playlistPosition: i,
                    addedToPlaylistTime: spotifyPlaylistTrack.added_at,
                },
            });
            playlistTracks.push(upsertedPlaylistTrack);
        }

        // Tracks that are in db but not spotify should be marked (but not removed)
        const spotifyUrisSet = new Set(spotifyPlaylistTracklistUris);
        const toMarkRemoved = existingPlaylistTracks.filter(t => !spotifyUrisSet.has(t.track.spotifyUri));
        for (let j = 0; j < toMarkRemoved.length; j++) {
            const trackToMarkRemoved = toMarkRemoved[j]!; // non-null assertion because it's a for loop
            const removedPlaylistTrack = await prisma.playlistTrack.update({
                where: {
                    playlistId_trackId: {
                        playlistId: playlist.id,
                        trackId: trackToMarkRemoved.track.id,
                    }
                },
                data: {
                    playlistPosition: i,
                    currentlyOnPlaylist: false,
                    trackingStopTime: new Date(),
                },
            });
            playlistTracks.push(removedPlaylistTrack);
            i++;
        }
        return playlistTracks;
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert playlist tracks for ${playlist.name}`)
    }
}