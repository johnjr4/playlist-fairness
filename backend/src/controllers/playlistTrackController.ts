import prisma from "../utils/prismaClient.js";

export async function getPlaylistTrack(playlistId: number, trackId: number, ownerId: string) {
    try {
        const playlistTrack = await prisma.playlistTrack.findUnique({
            where: {
                playlistId_trackId: {
                    playlistId: playlistId,
                    trackId: trackId,
                },
                playlist: {
                    ownerId: ownerId,
                }
            }
        });
        return playlistTrack;
    } catch (err) {
        console.error(`Failed to get playlistTrack (playlist: ${playlistId}, track: ${trackId})`, err);
        return null;
    }
}

export async function getPlaylistTrackFull(playlistId: number, trackId: number, ownerId: string) {
    try {
        const playlistTrack = await prisma.playlistTrack.findUnique({
            where: {
                playlistId_trackId: {
                    playlistId: playlistId,
                    trackId: trackId,
                },
                playlist: {
                    ownerId: ownerId,
                }
            },
            include: {
                playlist: true,
                track: true,
                listeningEvents: true,
            }
        });
        return playlistTrack;
    } catch (err) {
        console.error(`Failed to get playlistTrack (playlist: ${playlistId}, track: ${trackId})`, err);
        return null;
    }
}

export async function getPlaylistTrackCount(playlistId: number, ownerId: string) {
    try {
        const numPlaylistTracks = await prisma.playlistTrack.count({
            where: {
                playlistId: playlistId,
                playlist: {
                    ownerId: ownerId,
                }
            }
        });
        return numPlaylistTracks;
    } catch (err) {
        console.error("Error getting playlist track count", err);
        return null;
    }
}