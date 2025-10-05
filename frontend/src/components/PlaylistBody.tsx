import PlaylistAnalysis from "./PlaylistAnalysis";
import cardClasses from "../styling/cards.module.css";
import * as Public from 'spotifair';
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import { useState } from "react";
import type { PlaylistHistState } from "../utils/types/playlistMeta";
import { FaFilter } from "react-icons/fa6";
import { TiArrowSortedUp } from "react-icons/ti";
import { useDebounce } from "use-debounce";

interface PlaylistBodyProps {
    playlist: Public.PlaylistHist | null;
    state: PlaylistHistState;
    setPlaylistSync: (setSyncTo: boolean) => void;
    className?: string;
    refetch: () => Promise<void>;
}

function getSearchStyling(state: PlaylistHistState) {
    switch (state) {
        case 'synced':
            return undefined;
        case 'loading':
            return 'opacity-0';
        default:
            return 'opacity-30';
    }
}

function PlaylistBody({ playlist, state, setPlaylistSync, className, refetch }: PlaylistBodyProps) {
    const [searchString, setSearchString] = useState('');
    const [debouncedSearchString] = useDebounce(searchString, 300);

    // console.log(`search: ${searchString}`)
    // console.log(`debounced: ${debouncedSearchString}`)

    // if (!playlist) return <div>No playlist found</div>

    return (
        <div className={`${className} w-full max-w-7xl flex justify-center mt-14 gap-3 min-h-full`}>
            <PlaylistAnalysis playlist={playlist} state={state} className={`w-80 ${cardClasses['glass-card']} grow-0 shrink-0`} />
            <div className="w-full flex flex-col gap-3 grow">
                <div className={`sticky top-15 w-full px-4  ${cardClasses['glass-card']} ${cardClasses['glass-filter']} rounded-xs
                ${state !== 'synced' ? 'pointer-events-none opacity-70' : undefined}`}>
                    <div className={`flex justify-between items-center ${getSearchStyling(state)}`}>
                        <SearchBar setSearchString={setSearchString} disabled={state !== 'synced'} />
                        <div className="flex text-sm items-center gap-6">
                            <div className="flex items-center">
                                <TiArrowSortedUp />
                                <div>Playlist order</div>
                            </div>
                            <FaFilter />
                        </div>
                    </div>
                </div>
                <TrackList className={`grow ${cardClasses['glass-card']}`} playlist={playlist} setPlaylistSync={setPlaylistSync} state={state} searchString={debouncedSearchString} refetch={refetch} />
            </div>
        </div>
    )
}

export default PlaylistBody;