import type { PlaylistSyncRes } from "spotifair";
import type { Playlist, User } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";
import { disableAndDeletePlaylistSync, enableAndSyncPlaylist } from "./syncSpotifyData.js";

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
    try {
        const playlists = await prisma.playlist.findMany({
            where: {
                ownerId: userId,
            }
        });
        return playlists;
    } catch (err) {
        console.error("Error fetching playlists from db", err);
        return [];
    }
}

export async function getPlaylist(playlistId: number, ownerId: string | null = null) {
    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
                ...(ownerId ? { ownerId: ownerId } : {}), // Include ownerId if non-null
            },
        });
        return playlist;
    } catch (err) {
        console.error(`Failed to get playlists ${playlistId}`, err);
        return null;
    }
}

export async function getPlaylistWithTracks(playlistId: number, ownerId: string | null = null) {
    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
                ...(ownerId ? { ownerId: ownerId } : {}), // Include ownerId if non-null
            },
            include: {
                tracks: {
                    select: {
                        playlistPosition: true,
                        currentlyOnPlaylist: true,
                        addedToPlaylistTime: true,
                        trackingStartTime: true,
                        trackingStopTime: true,
                        track: {
                            select: {
                                id: true,
                                spotifyUri: true,
                                name: true,
                                album: true,
                                artist: true,
                            }
                        },
                    },
                    orderBy: {
                        playlistPosition: "asc",
                    }
                }
            },
        });
        return playlist;
    } catch (err) {
        console.error(`Failed to get playlists ${playlistId}`, err);
        return null;
    }
}

export async function getPlaylistHist(playlistId: number, ownerId: string | null = null) {
    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
                ...(ownerId ? { ownerId: ownerId } : {}), // Include ownerId if non-null
            },

            include: {
                tracks: {
                    select: {
                        playlistPosition: true,
                        currentlyOnPlaylist: true,
                        addedToPlaylistTime: true,
                        trackingStartTime: true,
                        trackingStopTime: true,
                        track: {
                            select: {
                                id: true,
                                spotifyUri: true,
                                name: true,
                                album: true,
                                artist: true,
                            }
                        },
                        listeningEvents: {
                            select: {
                                playedAt: true,
                            }
                        },
                    },
                    orderBy: {
                        playlistPosition: "asc",
                    }
                }
            }
        });
        return playlist;
    } catch (err) {
        console.error(`Failed to get playlists ${playlistId}`, err);
        return null;
    }
}

// If enabled === true:
//      Sets syncEnabled to true on playlist
//      Put required Tracks, Albums, and Artists into db
//      Put PlaylistTracks into db
//      Returns numbers created
// If enabled === false:
//      Sets syncEnabled to false on playlist
//      Deletes PlaylistTracks from playlist
//      Deletes ListeningEvents from those PlaylistTracks
//      Deletes Tracks, Albums, and Artists that are no longer needed in db
//      Returns numbers deleted
export async function setPlaylistSync(playlistId: number, user: User, enabled: boolean): Promise<PlaylistSyncRes> {
    try {
        const playlist = await getPlaylist(playlistId, user.id);
        if (!playlist) {
            throw new Error("Unable to fetch playlist");
        }
        if (enabled) {
            const counts = await enableAndSyncPlaylist(playlist, user);
            return { enabled: true, counts };
        }
        const counts = await disableAndDeletePlaylistSync(playlist);
        return { enabled: false, counts };
    } catch (err) {
        console.error(`Failed to set sync for playlist ${playlistId}:`, err);
        return { enabled: enabled, counts: { numPlaylistTracks: 0, numTracks: 0, numAlbums: 0, numArtists: 0 } };
    }
}