import PlaylistAnalysis from "./PlaylistAnalysis";
import cardClasses from "../styling/cards.module.css";
import * as Public from 'spotifair';
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import { useState } from "react";
import type { FilterOptions, PlaylistHistState } from "../utils/types/playlistMeta";
import { FaFilter } from "react-icons/fa6";
import { TiArrowSortedUp } from "react-icons/ti";
import { useDebounce } from "use-debounce";
import Toggle from "./ui/Toggle";

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
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ showRemoved: false, });
    const [debouncedSearchString] = useDebounce(searchString, 300);

    // console.log(`search: ${searchString}`)
    // console.log(`debounced: ${debouncedSearchString}`)

    // if (!playlist) return <div>No playlist found</div>

    const lowercaseSearchString = debouncedSearchString ? debouncedSearchString.toLowerCase() : null;
    // Declare filtering function
    function filterTrack(playlistTrack: Public.PlaylistTrackHist) {
        const track = playlistTrack.track;
        let matchesSearchString = true;
        // Only filter with search string if it exists and is not empty
        if (lowercaseSearchString && lowercaseSearchString.length > 0) {
            matchesSearchString = track.name.toLowerCase().includes(lowercaseSearchString)
                || track.album.name.toLowerCase().includes(lowercaseSearchString)
                || track.artist.name.toLowerCase().includes(lowercaseSearchString);
        }

        let matchesFilterOptions = true;
        if (!filterOptions.showRemoved) {
            matchesFilterOptions = playlistTrack.currentlyOnPlaylist;
        }

        return matchesSearchString && matchesFilterOptions;
    }

    return (
        <div className={`${className} w-full max-w-7xl flex justify-center mt-14 gap-3 min-h-full`}>
            <PlaylistAnalysis playlist={playlist} state={state} className={`w-80 ${cardClasses['glass-card']} grow-0 shrink-0`} />
            <div className="w-full flex flex-col gap-3 grow">
                <div className={`sticky top-15 w-full px-4  ${cardClasses['glass-card']} ${cardClasses['glass-filter']} rounded-xs
                ${state !== 'synced' ? 'pointer-events-none opacity-70' : undefined}`}>
                    <div className={`flex justify-between items-center ${getSearchStyling(state)}`}>
                        <SearchBar setSearchString={setSearchString} disabled={state !== 'synced'} />
                        <div className="flex text-sm items-center gap-8">
                            <div className="flex items-center">
                                <TiArrowSortedUp />
                                <div>Playlist order</div>
                            </div>
                            {/* <FaFilter /> */}
                            <div className="text-xs flex flex-col items-center justify-center gap-0.5">
                                Removed tracks:
                                <Toggle
                                    isOn={filterOptions.showRemoved}
                                    onToggle={(newVal: boolean) => setFilterOptions({ ...filterOptions, showRemoved: newVal })}
                                    onLabel="Show"
                                    offLabel="Hide"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <TrackList className={`grow ${cardClasses['glass-card']}`} playlist={playlist} setPlaylistSync={setPlaylistSync} filterTrack={filterTrack} state={state} refetch={refetch} />
            </div>
        </div>
    )
}

export default PlaylistBody;