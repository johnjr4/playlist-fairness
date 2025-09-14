import type { Playlist, PlaylistTrack } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (err) {
        console.error("Failed to get all users", err);
        return [];
    }
}

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

export async function getPlaylistTracks(playlistId: number) {
    try {
        const playlistTracks = await prisma.playlistTrack.findMany({
            where: {
                playlistId: playlistId,
            },
            orderBy: {
                playlistPosition: "asc",
            },
            include: {
                track: {
                    select: {
                        id: true,
                        name: true,
                        albumId: true,
                        artistId: true,
                    }
                },
            }
        });
        return playlistTracks;
    } catch (err) {
        console.error("Failed to fetch tracks from playlist from db", err);
        return [];
    }
}

export async function getPlaylistTracksWithHistory(playlistId: number) {
    try {
        const playlistTracks = await prisma.playlistTrack.findMany({
            where: {
                playlistId: playlistId,
            },
            orderBy: {
                playlistPosition: "asc",
            },
            include: {
                track: {
                    select: {
                        id: true,
                        name: true,
                        albumId: true,
                        artistId: true,
                    }
                },
                listeningEvents: {
                    select: {
                        id: true,
                        playedAt: true,
                    }
                },
            }
        });
        return playlistTracks;
    } catch (err) {
        console.error("Failed to get playlist tracks with history", err);
        return null;
    }
}

export async function getNumPlaysFromPlaylistTrack(playlistTrack: PlaylistTrack) { return getNumPlays(playlistTrack.playlistId, playlistTrack.trackId); }
export async function getTrackHistoryFromPlaylistTrack(playlistTrack: PlaylistTrack) { return getTrackHistory(playlistTrack.playlistId, playlistTrack.trackId); }

export async function getNumPlays(playlistId: number, trackId: number) {
    try {
        const numPlays = await prisma.listeningEvent.count({
            where: {
                playlistId: playlistId,
                trackId: trackId,
            }
        });
        return numPlays;
    } catch (err) {
        console.error("Failed to get num plays from db");
        return -1;
    }
}

export async function getTrackHistory(playlistId: number, trackId: number) {
    try {
        const listeningEvents = await prisma.listeningEvent.findMany({
            where: {
                playlistId: playlistId,
                trackId: trackId,
            },
            orderBy: {
                playedAt: "asc",
            },
        });
        return listeningEvents;
    } catch (err) {
        console.error("Failed to fetch tracks from playlist from db", err);
        return [];
    }
}