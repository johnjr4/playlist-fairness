import type * as Public from 'spotifair';
import { getListeningHistoryStat } from './listeningEventController.js';
import { getTopPlaylist, getPlaylistCount } from './playlistsController.js';
import { getTopTrack, getTrackCount } from './trackController.js';

export async function getUserStats(userId: string) {
    const topPlaylist = await getTopPlaylist(userId);
    const topTrack = await getTopTrack(userId);
    const history = await getListeningHistoryStat(userId);


    const stats: Public.UserStats = {
        listens: history,
        playlists: {
            synced: await getPlaylistCount(userId, true),
            top: topPlaylist,
            total: await getPlaylistCount(userId, false),
        },
        tracks: {
            top: topTrack,
            total: await getTrackCount(userId),
        },
    };
    return stats;
}
