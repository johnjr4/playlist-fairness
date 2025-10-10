import cron, { type TaskContext } from "node-cron";
import { getSpotifyAxios } from "../utils/axiosInstances.js";
import type { User } from "../generated/prisma/client.js";
import type * as Spotify from "../utils/types/spotifyTypes.js";
import { getAllUsers } from "./getFromDb.js";
import prisma from "../utils/prismaClient.js";
import pLimit from "p-limit";
import { SPOTIFY_CONCURRENCY_LIMIT } from "../utils/envLoader.js";
import { syncSpotifyData } from "./syncSpotifyData.js";
import type { AxiosInstance } from "axios";
import { refreshAccessToken } from "./refreshToken.js";

const cronStr = '*/25 * * * *';
const pollTask = cron.createTask(cronStr, pollAndUpdateSpotifyHistory);

export function startPollingHistory() {
    pollTask.start();
    return pollTask;
}

export async function stopPollingHistory() {
    await pollTask.stop();
    await pollTask.destroy();
}

async function pollAndUpdateSpotifyHistory(ctx: TaskContext) {
    try {
        console.log(`Polling Spotify history (${new Date()})`);
        // Get all users
        const allUsers = await getAllUsers();
        // Poll and insert their history with limited concurrency
        const limit = pLimit(SPOTIFY_CONCURRENCY_LIMIT);
        const listeningHistoryTasks = allUsers.map(
            user => limit(async () => {
                const refreshedUser = await refreshAccessToken(user);
                return await updateUsersListeningHistory(refreshedUser);
            })
        );
        const taskResults = await Promise.allSettled(listeningHistoryTasks);
        console.log("Polled and updated spotify history");
    } catch (err) {
        console.error("Critical error! Failed to poll history for all users!");
    }
}

async function updateUsersListeningHistory(user: User) {
    try {
        const spotifyAxios = getSpotifyAxios(user.accessToken);
        // TODO: Should we actually sync data here? Or is that super wasteful
        await syncSpotifyData(user, spotifyAxios);
        const recentlyPlayed = await getUserRecentlyPlayed(user, spotifyAxios);
        const listeningEvents = await createListeningEvents(user, recentlyPlayed);
        console.log(`Successfully inserted ${listeningEvents.count} listening events for user ${user.displayName}`);
    } catch (err) {
        // TODO: Push error to db
        console.error(`Failed to poll history for user ${user.displayName}`);
    }
}

async function getUserRecentlyPlayed(user: User, spotifyAxios: AxiosInstance) {
    try {
        const recentlyPlayedLimit = 50;
        const recentlyPlayed = await spotifyAxios.get(`/me/player/recently-played?limit=${recentlyPlayedLimit}`);
        return recentlyPlayed.data.items;
    } catch (err) {
        console.error("Failed to get user recently played");
        throw err;
    }
}

function isCorrectContext(histObj: Spotify.PlayHistoryObject) {
    return histObj.context && histObj.context.type === "playlist";
}

async function createListeningEvents(user: User, recentlyPlayed: Spotify.PlayHistoryObject[]) {
    try {
        // Filter recently played to include only (context: "playlist")
        const playlistContextOnly = recentlyPlayed.filter(playHistObj => isCorrectContext(playHistObj));
        console.log(`playlistContextOnly count: ${playlistContextOnly.length}`);
        // Find all the relevant PlaylistTracks in db
        const necessaryTrackUris = playlistContextOnly.map(playHistObj => playHistObj.track.uri);
        const necessaryPlaylistUris = playlistContextOnly.map(playHistObj => playHistObj.context.uri)
        const foundPlaylistTracks = await prisma.playlistTrack.findMany({
            where: {
                track: {
                    spotifyUri: {
                        in: necessaryTrackUris,
                    }
                },
                playlist: {
                    spotifyUri: {
                        in: necessaryPlaylistUris,
                    }
                }
            },
            include: {
                track: {
                    select: {
                        spotifyUri: true,
                    }
                },
                playlist: {
                    select: {
                        spotifyUri: true,
                    }
                }
            }
        });
        // Map track spotify uris -> id
        // (Using string-joined arrays as keys because maps use === and return false even for arrays with same values. It's hacky and I shouldn't do it)
        const foundUrisToPlaylistTracks = new Map(foundPlaylistTracks.map(pt => [[pt.track.spotifyUri, pt.playlist.spotifyUri].join(','), pt]));
        console.log(`Found uris count: ${foundUrisToPlaylistTracks.size}`);
        // Filter recently played to include only playlists and tracks in db
        const historyWithNecessaryData = playlistContextOnly.filter(playHistObj => foundUrisToPlaylistTracks.has([playHistObj.track.uri, playHistObj.context.uri].join(',')));
        console.log(`historyWithNecessaryData count: ${historyWithNecessaryData.length}`);
        // Insert all remaining as ListeningEvents
        const listeningEvents = await prisma.listeningEvent.createMany({
            data: historyWithNecessaryData.map(histObj => {
                // Non-null because we called .filter() earlier
                const playlistTrack = foundUrisToPlaylistTracks.get([histObj.track.uri, histObj.context.uri].join(','))!;
                return {
                    userId: user.id,
                    playlistId: playlistTrack.playlistId,
                    trackId: playlistTrack.trackId,
                    playedAt: histObj.played_at,
                };
            }),
            skipDuplicates: true,
        });

        return listeningEvents;
    } catch (err) {
        console.error("Failed to insert listening events:", err);
        throw err;
    }
}