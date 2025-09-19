import prisma from "../utils/prismaClient.js";

export async function getTrack(trackId: number) {
    try {
        const track = await prisma.track.findUnique({
            where: {
                id: trackId,
            }
        });
        return track;
    } catch (err) {
        console.error(`Failed to get track ${trackId}`, err);
        return null;
    }
}

export async function getTrackFull(trackId: number, userId: string) {
    try {
        const track = await prisma.track.findUnique({
            where: {
                id: trackId,
            },
            include: {
                album: true,
                artist: true,
                playlistTracks: {
                    where: {
                        playlist: {
                            ownerId: userId,
                        }
                    }
                },
            }
        });
        return track;
    } catch (err) {
        console.error(`Failed to get track ${trackId}`, err);
        return null;
    }
}