import type { Playlist } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";

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

export async function getPlaylistTracksFromPlaylist(playlistId: number) {
    try {
        const playlistTracks = await prisma.playlistTrack.findMany({
            where: {
                playlistId: playlistId,
            },
            orderBy: {
                playlistPosition: "asc",
            },
            include: {
                track: true,
            }
        });
        return playlistTracks;
    } catch (err) {
        console.error("Failed to fetch tracks from playlist from db", err);
        return [];
    }
}