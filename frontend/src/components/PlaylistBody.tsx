import PlaylistAnalysis from "./PlaylistAnalysis";
import cardClasses from "../styling/cards.module.css";
import * as Public from 'spotifair';
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import { useMemo, useState } from "react";
import type { SortingOption, FilterOptions, PlaylistHistState, SortDropdownOption } from "../utils/types/playlistPage";
import { useDebounce } from "use-debounce";
import Toggle from "./ui/Toggle";
import SortDropdown from "./ui/SortDropdown";

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
    const [sortOption, setSortOption] = useState<SortingOption>({ ascending: true, sortedOn: 'playlist_order' })
    const [debouncedSearchString] = useDebounce(searchString, 300);
    const [selectedTrack, setSelectedTrack] = useState<Public.PlaylistTrackHist | null>(null);


    const sortDropdownOptions: SortDropdownOption[] = [
        {
            label: 'Spotify order',
            option: {
                sortedOn: 'playlist_order',
                ascending: true,
            }
        },
        {
            label: 'Recently played',
            option: {
                sortedOn: 'last_played_at',
                ascending: false,
            }
        },
        {
            label: 'Most plays',
            option: {
                sortedOn: 'num_plays',
                ascending: false,
            }
        },
        {
            label: 'Fewest plays',
            option: {
                sortedOn: 'num_plays',
                ascending: true,
            }
        },
        {
            label: 'A-Z',
            option: {
                sortedOn: 'name',
                ascending: true,
            }
        },
        {
            label: 'Z-A',
            option: {
                sortedOn: 'name',
                ascending: false,
            }
        },

    ];

    // Derive relevant playlist data
    const totalNumTracks = playlist?.tracks.length ?? 0;
    const filteredBySearch = useMemo(() => {
        if (!playlist) return null;

        const lowercaseSearchString = debouncedSearchString ? debouncedSearchString.toLowerCase() : null;
        // Declare filtering function
        function filterBySearch(playlistTrack: Public.PlaylistTrackHist) {
            const track = playlistTrack.track;
            // Only filter with search string if it exists and is not empty
            if (lowercaseSearchString && lowercaseSearchString.length > 0) {
                return track.name.toLowerCase().includes(lowercaseSearchString)
                    || track.album.name.toLowerCase().includes(lowercaseSearchString)
                    || track.artist.name.toLowerCase().includes(lowercaseSearchString);
            }
            return true;
        }

        return playlist.tracks.filter(t => filterBySearch(t));
    }, [playlist, debouncedSearchString]);
    const filteredTracks = useMemo(() => {
        if (!filteredBySearch) return null;

        // Declare filter function
        function filterByOptions(playlistTrack: Public.PlaylistTrackHist) {
            if (!filterOptions.showRemoved) {
                return playlistTrack.currentlyOnPlaylist;
            }
            return true;
        }

        const filteredByOptions = filteredBySearch.filter(t => filterByOptions(t))
        return filteredByOptions;
    }, [filteredBySearch, filterOptions]);


    return (
        <div className={`${className} w-full max-w-7xl flex justify-center mt-14 gap-3 min-h-full`}>
            <PlaylistAnalysis filteredTracks={filteredTracks} state={state} selectedTrack={selectedTrack} className={`w-80 ${cardClasses['glass-card']} grow-0 shrink-0`} />
            <div className="w-full flex flex-col gap-3 grow">
                <div className={`sticky top-15 w-full px-4  ${cardClasses['glass-card']} ${cardClasses['glass-filter']} rounded-xs
                ${state !== 'synced' ? 'pointer-events-none opacity-70' : undefined}`}>
                    <div className={`flex justify-between items-center ${getSearchStyling(state)}`}>
                        <SearchBar setSearchString={setSearchString} disabled={state !== 'synced'} />
                        <div className="flex text-sm items-center gap-8">
                            <div className="flex items-center">
                                {/* <TiArrowSortedUp />
                                <div>Playlist order</div> */}
                                <SortDropdown onChange={(val) => setSortOption(val)} sortingOptions={sortDropdownOptions} value={sortOption} />
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
                <TrackList
                    className={`grow ${cardClasses['glass-card']}`}
                    playlist={playlist}
                    filteredTracks={filteredTracks}
                    sortingOption={sortOption}
                    totalNumTracks={totalNumTracks}
                    setPlaylistSync={setPlaylistSync}
                    selectedTrack={selectedTrack}
                    setSelectedTrack={setSelectedTrack}
                    state={state}
                    refetch={refetch}
                />
            </div>
        </div>
    )
}

export default PlaylistBody;