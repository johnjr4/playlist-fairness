import prisma from "../utils/prismaClient.js";

export async function getAlbum(albumId: number) {
    try {
        const album = await prisma.album.findUnique({
            where: {
                id: albumId,
            }
        });
        return album;
    } catch (err) {
        console.error(`Failed to get album ${albumId}`, err);
        return null;
    }
}

export async function getAlbumFull(albumId: number) {
    try {
        const album = await prisma.album.findUnique({
            where: {
                id: albumId,
            },
            include: {
                tracks: true,
                artist: true,
            }
        });
        return album;
    } catch (err) {
        console.error(`Failed to get full album ${albumId}`, err);
        return null;
    }
}