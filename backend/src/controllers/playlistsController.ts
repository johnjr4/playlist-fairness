import type { PlaylistSyncRes } from "spotifair";
import type { Playlist, User } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";
import { disableAndDeletePlaylistSync, enableAndSyncPlaylist } from "./syncSpotifyData.js";
import { queryTopPlaylist } from "../generated/prisma/sql.js";
import type * as Public from 'spotifair';
import { playlistFullArgs, playlistHistArgs, playlistTrackHistArgs, type PlaylistHist } from "../utils/types/includeTypes.js";
import { getPlaylistTrackCount } from "./playlistTrackController.js";

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

export async function getPlaylistCount(userId: string, requireSync: boolean = false) {
    try {
        const playlistCount = await prisma.playlist.count({
            where: {
                ownerId: userId,
                ...(requireSync ? { syncEnabled: true } : {}), // Include syncEnabled if requireSync
            }
        });
        return playlistCount;
    } catch (err) {
        console.error("Error getting playlist count", err);
        return 0;
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
            ...playlistFullArgs,
        });
        return playlist;
    } catch (err) {
        console.error(`Failed to get playlists ${playlistId}`, err);
        return null;
    }
}

export async function getPlaylistHist(playlistId: number, ownerId: string | null = null): Promise<PlaylistHist | null> {
    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
                ...(ownerId ? { ownerId: ownerId } : {}), // Include ownerId if non-null
            },
            ...playlistHistArgs,
        });
        return playlist;
    } catch (err) {
        console.error(`Failed to get playlists ${playlistId}`, err);
        return null;
    }
}

export async function getTotalMs(playlistId: number, requireOnPlaylist = true) {
    try {
        const totalMs = await prisma.track.aggregate({
            where: {
                playlistTracks: {
                    some: {
                        playlistId: playlistId,
                        ...(requireOnPlaylist ? { currentlyOnPlaylist: true } : {}),
                    }
                }
            },
            _sum: {
                durationMs: true,
            }
        });
        return totalMs._sum.durationMs;
    } catch (err) {
        console.error(`Failed to get totalMs for ${playlistId}`, err);
        return null;
    }

}

export async function getPlaylistWithStats(playlistId: number, ownerId: string): Promise<Public.PlaylistWithStats | null> {
    try {
        const playlist = await getPlaylist(playlistId, ownerId);
        if (!playlist) {
            // Playlist doesn't exist in database
            throw new Error('No playlists found');
        }

        // By this point we are sure playlist exists
        const numPlaylistTracks = await getPlaylistTrackCount(playlistId, ownerId);
        const totalMs = await getTotalMs(playlistId);
        console.log(`numPlaylistTracks: ${numPlaylistTracks}, totalMs: ${totalMs}`);

        return {
            ...playlist,
            stats: {
                numTracks: numPlaylistTracks ? numPlaylistTracks : 0,
                totalMs: totalMs ? totalMs : 0,
            },
        };
    } catch (err) {
        console.error(`Failed to get playlist stat ${playlistId} for user ${ownerId}`, err);
        return null;
    }
}

export async function getTopPlaylist(ownerId: string): Promise<Public.TopPlaylist | null> {
    try {
        const topPlaylists = await prisma.$queryRawTyped<Public.Playlist & { plays: bigint | null, totalMs: bigint | null }>(queryTopPlaylist(ownerId));
        if (!topPlaylists || topPlaylists.length < 1) {
            // No playlists found
            throw new Error('No playlists found');
        } else if (!topPlaylists[0]!.plays || !topPlaylists[0]!.totalMs) {
            // Something went wrong with the aggregation
            throw new Error('Playlist aggregation error');
        }
        const { totalMs: bigIntTotalMs, plays: bigIntPlays, ...topPlaylist } = topPlaylists[0]!;
        const plays = Number(bigIntPlays);
        const totalMs = Number(bigIntTotalMs);

        return {
            ...topPlaylist,
            listening: {
                plays: plays,
                totalMs: totalMs,
            }
        };
    } catch (err) {
        console.error(`Failed to get top playlist for user ${ownerId}`, err);
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