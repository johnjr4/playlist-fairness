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

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchString, setSearchString] = useState('');
    const { data, isLoading, error, refetch } = useQuery(`/playlists/${playlistId}/tracks/hist`);

    if (isLoading) return <div>It's the loading page...</div>
    if (isSyncing) return <div>Syncing playlist...</div>
    if (error) return <div>Error!</div>

    const playlistData = data as Public.PlaylistHist;

    async function handleSyncClick(enabled: boolean) {
        setIsSyncing(true);
        // TODO: error response handling
        await backendAxios.post(`/playlists/${playlistId}/sync`, { enabled: enabled });
        setIsSyncing(false);
        refetch();
    }

    console.log(playlistData);

    if (!playlistData.syncEnabled) {
        return (
            <>
                <div>Sync not enabled for this playlist</div>
                <Button onClick={() => handleSyncClick(true)}>Enable it</Button>
            </>
        )
    }

    return (
        <div className='flex flex-col items-center'>
            <PlaylistHeader playlist={playlistData} handleSyncClick={handleSyncClick} />
            <PlaylistSummary playlist={playlistData} />
            <SearchBar setSearchString={setSearchString} />
            <TrackList playlist={playlistData} searchString={searchString} />
        </div>
    );
}

export default PlaylistPage;