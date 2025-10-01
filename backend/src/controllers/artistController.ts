import prisma from "../utils/prismaClient.js";
import { artistFullArgs } from "../utils/types/includeTypes.js";

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
            ...artistFullArgs,
        });
        return album;
    } catch (err) {
        console.error(`Failed to get full artist ${artistId}`, err);
        return null;
    }
}