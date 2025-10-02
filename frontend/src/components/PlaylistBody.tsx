import PlaylistAnalysis from "./PlaylistAnalysis";
import cardClasses from "../styling/cards.module.css";
import * as Public from 'spotifair';
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import { useState } from "react";

interface PlaylistBodyProps {
    playlist: Public.PlaylistHist;
    setPlaylistSync: (setSyncTo: boolean) => void;
    isSyncing: boolean;
}

function PlaylistBody({ playlist, setPlaylistSync, isSyncing }: PlaylistBodyProps) {
    const [searchString, setSearchString] = useState('');

    return (
        <div className='w-full flex mt-23 px-30 gap-6'>
            <PlaylistAnalysis playlist={playlist} className={`w-100 ${cardClasses['glass-card']} grow-0 shrink-0`} />
            <div className="w-full flex flex-col gap-4">
                <div className={`sticky top-15 w-full px-4 flex justify-between items-center ${cardClasses['glass-card']} ${cardClasses['glass-filter']} rounded-xs`}>
                    <SearchBar setSearchString={setSearchString} />
                    <div>Sorting</div>
                </div>
                <TrackList className='grow' playlist={playlist} setPlaylistSync={setPlaylistSync} isSyncing={isSyncing} searchString={searchString} />
            </div>
        </div>
    )
}

export default PlaylistBody;