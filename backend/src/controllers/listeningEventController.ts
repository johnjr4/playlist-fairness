import type * as Public from "spotifair";
import { queryListeningStat } from "../generated/prisma/sql.js";
import prisma from "../utils/prismaClient.js";
import type { NullableBigIntListeningStat } from "../utils/types/helperTypes.js";
import { nullableListeningStatToPublic } from "../utils/types/frontendTypeMapper.js";

export async function getListeningHistory(userId: string) {
    try {
        const listeningEvents = await prisma.listeningEvent.findMany({
            where: {
                userId: userId,
            }
        });
        return listeningEvents;
    } catch (err) {
        console.error("Error fetching history from db", err);
        return [];
    }
}

export async function getListeningHistoryStat(userId: string): Promise<Public.ListeningStat> {
    try {
        const listeningStats = await prisma.$queryRawTyped<NullableBigIntListeningStat>(queryListeningStat(userId));
        if (!listeningStats || listeningStats.length < 1) {
            // No stats found
            throw new Error("Failed to get stats");
        }
        return nullableListeningStatToPublic(listeningStats[0]!);
    } catch (err) {
        console.error("Error getting listening history stats", err);
        return { plays: 0, totalMs: 0 };
    }
}