import { useParams } from "react-router";
import useQuery from "../utils/api/useQuery";
import * as Public from 'spotifair';
import { useMemo, useState } from "react";
import { backendAxios } from "../utils/axiosInstances";
import PlaylistHeader from "../components/PlaylistHeader";
import type { PlaylistHistState } from "../utils/types/playlistMeta";
import PlaylistBody from "../components/PlaylistBody";

function getPlaylistHistState(isLoading: boolean, error: string | null, isSyncing: boolean, playlistHist: Public.PlaylistHist | null): PlaylistHistState {
    if (isSyncing) {
        return 'syncing';
    }

    if (isLoading) {
        return 'loading';
    }

    if (error) {
        return 'error';
    }

    // By here we know playlist stats exist

    if (playlistHist!.syncEnabled) {
        return 'synced';
    }

    return 'unsynced';
}

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const { data: playlistHist, isLoading: isTracksLoading, error: tracksError, refetch: refetchTracks } = useQuery<Public.PlaylistHist>(`/playlists/${playlistId}/tracks/hist`);

    // console.log(playlist);
    const playlistHistState = getPlaylistHistState(isTracksLoading, tracksError, isSyncing, playlistHist);
    const numTracks = playlistHist?.tracks.length ?? 0;
    const totalMs = useMemo(() => {
        return playlistHist?.tracks.reduce((sum, track) => sum + track.track.durationMs, 0) ?? 0;
    }, [playlistHist]);

    async function setPlaylistSync(enabled: boolean) {
        setIsSyncing(true);
        // TODO: error response handling
        await backendAxios.post<Public.PlaylistSyncRes>(`/playlists/${playlistId}/sync`, { enabled: enabled });
        await refetchTracks();
        setIsSyncing(false);
        // refetchPlaylist();
    }

    return (
        <div
            className="overflow-x-clip"
        >
            <div className='w-dvw flex flex-col items-center mt-4' // Fixes layout shift when scrollbar appears
            // style={{ paddingLeft: 'calc(100vw - 100%)' }}
            // style={{ scrollbarGutter: 'stable', overflow: 'auto' }}
            >
                <PlaylistHeader playlistId={parseInt(playlistId!)} playlistStats={{ numTracks, totalMs }} setPlaylistSync={setPlaylistSync} playlistHistState={playlistHistState} />
                {(!isTracksLoading && !tracksError) && <PlaylistBody playlist={playlistHist} isSyncing={isSyncing} setPlaylistSync={setPlaylistSync} />}
            </div>
        </div>
    );
}

export default PlaylistPage;