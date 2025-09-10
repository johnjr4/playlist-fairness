import prisma from "../utils/prismaClient.js";
import { getSpotifyAxios, handleAxiosError } from "../utils/axiosInstances.js";
import type { Playlist, User } from "../generated/prisma/client.js";
import type * as Spotify from "../utils/spotifyTypes.js";
import type { Axios, AxiosInstance } from "axios";

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
        const simplifiedPlaylists = await getSpotifyUserPlaylists(user, spotifyAxios);
        await upsertSpotifyDataFromPlaylists(user, simplifiedPlaylists, spotifyAxios);
        console.log("Spotify data synced");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to sync spotify data");
    }
}

// Returns an array of all the playlists a user has saved from Spotify API
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
        return playlists;
    } catch (err) {
        console.error(err);
        throw new Error("Error fetching Spotify playlists");
    }
}

async function getSpotifyPlaylistTracks(playlist: Playlist, spotifyAxios: AxiosInstance) {
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
        return nonPodcastTracks;
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

// Inserts all non-existing playlists, tracks from those playlists, and albums and artists from those tracks into my database
async function upsertSpotifyDataFromPlaylists(user: User, playlists: Array<Spotify.SimplifiedPlaylistObject>, spotifyAxios: AxiosInstance) {
    try {
        for (const playlist of playlists) {
            if (!playlist.collaborative && playlist.owner.uri == user.spotifyUri) {
                // This playlist belongs to this user, insert it
                // TODO: This strategy doesn't take care of playlist versioning with snapshot ids, nor deleted playlists. Redo it!
                // Suggested flow:
                //  Get all current db playlists for this user
                //  Match with spotify playlists 1 by 1
                //      Any in db that aren't in spotify delete
                //      Any in both that match snapshot, leave
                //      Any in both that don't match snapshot, update
                //      Any in spotify only, insert
                let existingPlaylist = await prisma.playlist.findUnique({
                    where: {
                        spotifyUri: playlist.uri,
                    }
                });
                if (!existingPlaylist) {
                    // Playlist not found, insert into database
                    // Upsert not create to protect against race condition in high-concurrency (totally unnecessary)
                    const insertedPlaylist = await prisma.playlist.upsert({
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
                    });
                    const tracks = await getSpotifyPlaylistTracks(insertedPlaylist, spotifyAxios);
                    await upsertSpotifyDataFromTracks(tracks);
                }
            }
        }
        console.log("Spotify playlist data upserted");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upsert playlist data to database");
    }
}

// Inserts all tracks from playlist and albums and artist from those tracks into my database
async function upsertSpotifyDataFromTracks(playlistTracks: Spotify.PlaylistTrackObject[]) {
    try {
        for (const playlistTrack of playlistTracks) {
            const track: Spotify.TrackObject = playlistTrack.track as Spotify.TrackObject; // Can do this because we filtered out episode tracks

            // First upsert artists
            const firstArtist = selectFirstArtist(track.artists);
            await upsertSpotifyDataFromArtist(firstArtist);
            // Then upsert albums
            await upsertSpotifyDataFromAlbum(track.album);
            // Then upsert track
            const upsertedTrack = await prisma.track.upsert({
                where: {
                    spotifyUri: track.uri,
                },
                update: {},
                create: {
                    spotifyUri: track.uri,
                    name: track.name,
                    artist: {
                        connect: { spotifyUri: firstArtist.uri },
                    },
                    album: {
                        connect: { spotifyUri: track.album.uri },
                    },
                },
            })
        }
        console.log("Successfully upserted tracks data");
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