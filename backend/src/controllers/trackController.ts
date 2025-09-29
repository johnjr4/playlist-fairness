import { queryTopTrack } from "../generated/prisma/sql.js";
import prisma from "../utils/prismaClient.js";
import * as Public from "spotifair";

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

export async function getTrackCount(ownerId: string) {
    try {
        const trackCount = await prisma.track.count({
            where: {
                playlistTracks: {
                    some: {
                        playlist: {
                            ownerId: ownerId,
                        }
                    }
                }
            }
        });
        return trackCount;
    } catch (err) {
        console.error(`Failed to get track count ${ownerId}`, err);
        return 0;
    }
}

export async function getTopTrack(ownerId: string): Promise<Public.TrackStat | null> {
    try {
        const topTracks = await prisma.$queryRawTyped<Public.Track & { plays: bigint | null }>(queryTopTrack(ownerId));
        if (!topTracks || topTracks.length < 1) {
            // No tracks found
            throw new Error("No tracks found");
        } else if (!topTracks[0]!.plays) {
            // Something went wrong with the aggregation
            throw new Error("Track aggregation error");
        }
        const plays = Number(topTracks[0]!.plays!);
        const topTrackObj: Public.Track = topTracks[0]!;

        return {
            ...topTrackObj,
            plays: plays,
        };
    } catch (err) {
        console.error(`Failed to get top track for ${ownerId}`, err);
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