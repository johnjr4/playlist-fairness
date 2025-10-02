import { useParams } from "react-router";
import useQuery from "../utils/api/useQuery";
import * as Public from 'spotifair';

import Button from "../components/ui/Button";
import { useState } from "react";
import { backendAxios } from "../utils/axiosInstances";
import PlaylistHeader from "../components/PlaylistHeader";
import PlaylistSummary from "../components/PlaylistSummary";
import SearchBar from "../components/SearchBar";
import TrackList from "../components/TrackList";
import type PlaylistMetadata from "../utils/types/playlistMeta";

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchString, setSearchString] = useState('');
    const { data, isLoading, error, refetch } = useQuery(`/playlists/${playlistId}/tracks/hist`);

    if (isLoading) return <div>It's the loading page...</div>
    if (isSyncing) return <div>Syncing playlist...</div>
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

    if (!playlist.syncEnabled) {
        return (
            <>
                <div>Sync not enabled for this playlist</div>
                <Button onClick={() => setPlaylistSync(true)}>Enable it</Button>
            </>
        )
    }

    return (
        <div className='flex flex-col items-center mt-4 w-full'>
            <PlaylistHeader playlist={playlist} setPlaylistSync={setPlaylistSync} playlistMetadata={playlistMetadata} />
            <PlaylistSummary playlist={playlist} />
            <SearchBar setSearchString={setSearchString} />
            <TrackList playlist={playlist} searchString={searchString} />
        </div>
    );
}

export default PlaylistPage;