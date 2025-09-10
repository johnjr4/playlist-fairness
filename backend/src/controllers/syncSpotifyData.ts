import prisma from "../utils/prismaClient.js";
import { getSpotifyAxios, handleAxiosError } from "../utils/axiosInstances.js";
import type { Playlist, PlaylistTrack, Track, User } from "../generated/prisma/client.js";
import type * as Spotify from "../utils/spotifyTypes.js";
import type { AxiosInstance } from "axios";
import { getUserPlaylists } from "./getFromDb.js";
import { deletePlaylists } from "./deleteData.js";
import pLimit from "p-limit";
import { SPOTIFY_CONCURRENCY_LIMIT } from "../utils/envLoader.js";
import type { BundledSpotifyPlaylistTracks } from "../utils/helperTypes.js";

export async function createAndSyncUser(accessToken: string, refreshToken: string) {
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
            update: {}, // Using upsert as idempotent insert
            create: {
                spotifyUri: spotifyUser.uri,
                spotifyId: spotifyUser.id,
                imageUrl: selectProperImage(spotifyUser.images),
                accessToken: accessToken,
                refreshToken: refreshToken,
                displayName: spotifyUser.display_name,
            },
        });

        await syncSpotifyData(user, spotifyAxios);
        return user;
    } catch (err) {
        console.error(err);
        throw new Error("Error creating and syncing user");
    }
}

// Gets Spotify user data, inserts/updates user data in database
export async function syncSpotifyData(user: User, spotifyAxios: AxiosInstance) {
    try {
        const spotifySimplifiedPlaylists = await getSpotifyUserPlaylists(user, spotifyAxios);
        const userPlaylists = await getUserPlaylists(user.id);
        const { toDelete, toUpdate, toInsert } = categorizePlaylists(spotifySimplifiedPlaylists, userPlaylists);
        // Delete playlists that the Spotify user no longer has
        if (toDelete.length > 0) {
            // No await because these playlists are effectively irrelevant to other calls
            deletePlaylists(toDelete);
        }
        // Upsert new Spotify playlists (toInsert) and playlists where snapshot_id has changed (toUpdate)
        const toUpsert = toInsert.concat(toUpdate);
        await upsertSpotifyDataFromPlaylists(user, toUpsert, spotifyAxios);
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
                morePlaylists = data.next != null;
                offset += maxLimit;
            } else {
                morePlaylists = false;
            }
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

function categorizePlaylists(spotifyPlaylists: Spotify.SimplifiedPlaylistObject[], dbPlaylists: Playlist[]) {
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
            toDelete.push(dbPlaylist.id);
        } else {
            const spotifyPlaylist = spotifyMap.get(spotifyId)!; // Assertion because we checked if spotifyMap has it
            if (spotifyPlaylist.snapshot_id !== dbPlaylist.spotifySnapshotId) {
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

// Inserts all non-existing playlists, tracks from those playlists, and albums and artists from those tracks into my database
async function upsertSpotifyDataFromPlaylists(user: User, playlists: Array<Spotify.SimplifiedPlaylistObject>, spotifyAxios: AxiosInstance) {
    try {
        // Array to track upserted playlists so we know which ones to handle Tracks of
        const upsertedPlaylists: Playlist[] = [];
        for (const playlist of playlists) {
            // Upsert playlist into database
            const upsertedPlaylist = await prisma.playlist.upsert({
                where: {
                    spotifyUri: playlist.uri
                },
                update: {
                    name: playlist.name,
                    coverUrl: selectProperImage(playlist.images),
                    spotifySnapshotId: playlist.snapshot_id,
                },
                create: {
                    spotifyUri: playlist.uri,
                    spotifyId: playlist.id,
                    spotifySnapshotId: playlist.snapshot_id,
                    name: playlist.name,
                    coverUrl: selectProperImage(playlist.images),
                    owner: {
                        connect: { id: user.id },
                    }
                },
            }).catch(err => console.error(`Failed to upsert playlist ${playlist.name}`, err));
            if (upsertedPlaylist) {
                // If successful upsertion, push
                upsertedPlaylists.push(upsertedPlaylist);
            }
        }
        // Get all Spotify PlaylistTracks with limited concurrency
        const limit = pLimit(SPOTIFY_CONCURRENCY_LIMIT);
        const tracksByPlaylistPromises = upsertedPlaylists.map(
            playlist => limit(() => getSpotifyPlaylistTracks(playlist, spotifyAxios))
        );
        const trackResults = await Promise.allSettled(tracksByPlaylistPromises);
        // Then filter out the failed Promises
        const successfulTrackResults = trackResults.filter(res => res.status === 'fulfilled');
        // Then transform to get the BundledPlaylist
        const tracksByPlaylist = successfulTrackResults.map(res => res.value);

        // Upsert the relevant track data on per-playlist basis
        for (const { playlist, spotifyPlaylistTracks } of tracksByPlaylist) {
            const { tracks, trackMetadata } = await upsertSpotifyDataFromTracks(spotifyPlaylistTracks);
            const dbPlaylistTracks = await upsertPlaylistTracks(playlist, tracks, trackMetadata);
        }

        console.log("Spotify playlist data upserted");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert playlist data to database");
    }
}

// Inserts all tracks from playlist and albums and artist from those tracks into my database
async function upsertSpotifyDataFromTracks(spotifyPlaylistTracks: Spotify.PlaylistTrackObject[]) {
    try {
        let tracks: Track[] = [];
        let trackMetadata: Spotify.PlaylistTrackMetadata[] = [];
        for (const playlistTrack of spotifyPlaylistTracks) {
            const spotifyTrack: Spotify.TrackObject = playlistTrack.track as Spotify.TrackObject; // Can do this because we filtered out episode tracks

            // First upsert artists
            const firstArtist = selectFirstArtist(spotifyTrack.artists);
            await upsertSpotifyDataFromArtist(firstArtist);
            // Then upsert albums
            await upsertSpotifyDataFromAlbum(spotifyTrack.album);
            // Then upsert track
            const upsertedTrack = await prisma.track.upsert({
                where: {
                    spotifyUri: spotifyTrack.uri,
                },
                update: {},
                create: {
                    spotifyUri: spotifyTrack.uri,
                    name: spotifyTrack.name,
                    artist: {
                        connect: { spotifyUri: firstArtist.uri },
                    },
                    album: {
                        connect: { spotifyUri: spotifyTrack.album.uri },
                    },
                },
            });
            tracks.push(upsertedTrack);
            trackMetadata.push({ added_at: playlistTrack.added_at, added_by: playlistTrack.added_by, is_local: playlistTrack.is_local });
        }
        console.log("Successfully upserted tracks data");
        return { tracks: tracks, trackMetadata: trackMetadata };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert track data");
    }
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

async function upsertPlaylistTracks(playlist: Playlist, tracks: Track[], trackMetadata: Spotify.PlaylistTrackMetadata[]) {
    try {
        let playlistTracks: PlaylistTrack[] = [];
        // TODO: This doesn't deal with tracks removed from playlist! I need to get both full lists and correlate them (see playlist upsert)
        if (tracks.length != trackMetadata.length) {
            if (tracks.length > trackMetadata.length) {
                throw new Error("Metadata misaligned: More tracks than metadata entries");
            } else {
                throw new Error("Metadata misaligned: More metadata entries than tracks");
            }
        };
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]!;
            const trackMetadatum = trackMetadata[i]!;

            const upsertedPlaylistTrack = await prisma.playlistTrack.upsert({
                where: {
                    playlistId_trackId: {
                        playlistId: playlist.id,
                        trackId: track.id,
                    }
                },
                update: {
                    playlistPosition: i,
                },
                create: {
                    playlistId: playlist.id,
                    trackId: track.id,
                    playlistPosition: i,
                    addedToPlaylistTime: trackMetadatum.added_at
                },
            });
            playlistTracks.push(upsertedPlaylistTrack);
        }
        return playlistTracks;
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to upsert playlist tracks for ${playlist.name}`)
    }
}