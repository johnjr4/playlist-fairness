import prisma from "../utils/prismaClient.js";

export async function getArtist(artistId: number) {
    try {
        const album = await prisma.artist.findUnique({
            where: {
                id: artistId,
            }
        });
        return album;
    } catch (err) {
        console.error(`Failed to get artist ${artistId}`, err);
        return null;
    }
}

export async function getArtistFull(artistId: number) {
    try {
        const album = await prisma.artist.findUnique({
            where: {
                id: artistId,
            },
            include: {
                tracks: true,
                albums: true,
            }
        });
        return album;
    } catch (err) {
        console.error(`Failed to get full artist ${artistId}`, err);
        return null;
    }
}