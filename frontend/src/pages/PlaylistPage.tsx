import { useParams } from "react-router";
import useQuery from "../utils/api/useQuery";
import * as Public from 'spotifair';
import { useState } from "react";
import { backendAxios } from "../utils/axiosInstances";
import PlaylistHeader from "../components/PlaylistHeader";
import TrackList from "../components/TrackList";
import type PlaylistMetadata from "../utils/types/playlistMeta";

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const { data, isLoading, error, refetch } = useQuery(`/playlists/${playlistId}/tracks/hist`);

    if (isLoading) return <div>It's the loading page...</div>
    if (error) return <div>Error!</div>

    const playlist = data as Public.PlaylistHist;
    console.log(playlist);
    const playlistMetadata: PlaylistMetadata = {
        numTracks: playlist.tracks.length,
        totalMs: playlist.tracks.reduce((acc, curr) => acc + curr.track.durationMs, 0),
    };

    async function setPlaylistSync(enabled: boolean) {
        setIsSyncing(true);
        // TODO: error response handling
        await backendAxios.post(`/playlists/${playlistId}/sync`, { enabled: enabled });
        setIsSyncing(false);
        refetch();
    }

    return (
        <div className='flex flex-col items-center mt-4 w-full'>
            <PlaylistHeader playlist={playlist} setPlaylistSync={setPlaylistSync} playlistMetadata={playlistMetadata} isSyncing={isSyncing} />
            <TrackList playlist={playlist} setPlaylistSync={setPlaylistSync} isSyncing={isSyncing} />
        </div>
    );
}

export default PlaylistPage;