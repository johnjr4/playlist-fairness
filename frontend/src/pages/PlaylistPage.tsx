import { useParams } from "react-router";
import useQuery from "../utils/api/useQuery";
import * as Public from 'spotifair';
import { useState } from "react";
import { backendAxios } from "../utils/axiosInstances";
import PlaylistHeader from "../components/PlaylistHeader";
import type PlaylistMetadata from "../utils/types/playlistMeta";
import PlaylistBody from "../components/PlaylistBody";

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const { data: playlist, isLoading: isPlaylistLoading, error: playlistError, refetch: refetchPlaylist } = useQuery<Public.PlaylistWithStats>(`/playlists/${playlistId}/stat`);
    const { data: playlistHist, isLoading: isTracksLoading, error: tracksError, refetch: refetchTracks } = useQuery<Public.PlaylistHist>(`/playlists/${playlistId}/tracks/hist`);

    console.log(playlist);

    async function setPlaylistSync(enabled: boolean) {
        setIsSyncing(true);
        // TODO: error response handling
        await backendAxios.post<Public.PlaylistSyncRes>(`/playlists/${playlistId}/sync`, { enabled: enabled });
        setIsSyncing(false);
        refetchPlaylist();
        refetchTracks();
    }

    return (
        <div
            className="overflow-x-clip"
        >
            <div className='w-dvw flex flex-col items-center mt-4' // Fixes layout shift when scrollbar appears
            // style={{ paddingLeft: 'calc(100vw - 100%)' }}
            // style={{ scrollbarGutter: 'stable', overflow: 'auto' }}
            >
                <PlaylistHeader playlist={playlist} setPlaylistSync={setPlaylistSync} isLoading={isPlaylistLoading} isSyncing={isSyncing} error={playlistError} />
                {(!isTracksLoading && !tracksError) && <PlaylistBody playlist={playlistHist} isSyncing={isSyncing} setPlaylistSync={setPlaylistSync} />}
            </div>
        </div>
    );
}

export default PlaylistPage;