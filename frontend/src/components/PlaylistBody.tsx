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

function PlaylistBody({ playlist, state, setPlaylistSync, className, refetch }: PlaylistBodyProps) {
    const [searchString, setSearchString] = useState('');
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ showRemoved: false, });
    const [sortOption, setSortOption] = useState<SortingOption>({ ascending: true, sortedOn: 'playlist_order' })
    const [debouncedSearchString] = useDebounce(searchString, 300);
    const [selectedTrack, setSelectedTrack] = useState<Public.PlaylistTrackHist | null>(null);


    const sortDropdownOptions: SortDropdownOption[] = [
        {
            label: 'Playlist',
            option: {
                sortedOn: 'playlist_order',
                ascending: true,
            }
        },
        {
            label: 'Last played',
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
            label: 'Least plays',
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

    const optionsDisabled = state !== 'synced';

    return (
        <div className={`${className} w-full max-w-7xl px-2 sm:px-3 md:px-4 flex flex-col md:flex-row justify-center mt-5 md:mt-14 gap-3 min-h-full`}>
            <PlaylistAnalysis
                filteredTracks={filteredTracks}
                state={state}
                selectedTrack={selectedTrack}
                className={`w-full mx-auto md:w-60 lg:w-80 ${cardClasses['glass-card']} grow-0 shrink-0`}
            />
            <div className="w-full flex flex-col gap-3 grow">
                <div className={`sticky top-10 sm:top-12 md:top-14 lg:top-15 w-full flex justify-between items-center px-2 lg:px-4 py-3 lg:py-4 ${cardClasses['glass-card']} ${cardClasses['glass-filter']} rounded-xs
                ${state !== 'synced' ? 'pointer-events-none opacity-70' : undefined} `}>
                    <SearchBar
                        setSearchString={setSearchString}
                        disabled={optionsDisabled}
                        className="h-7 md:h-10 text-xs sm:text-sm lg:text-base sm:w-70 lg:w-85 xl:w-105"
                        clearClassName="hidden sm:block" />
                    <div className="flex text-sm items-center gap-1 lg:gap-2">
                        <SortDropdown
                            onChange={(val) => setSortOption(val)}
                            sortingOptions={sortDropdownOptions}
                            value={sortOption}
                            disabled={optionsDisabled}
                            className="w-26 sm:w-30 lg:w-40 text-xs sm:text-sm lg:text-base"
                        />
                        <div className="
                            w-21 sm:w-24
                            flex flex-col items-center justify-center
                            gap-0.5
                            text-center
                            text-xs sm:text-sm
                        ">
                            <p className={`text-[11px] sm:text-xs ${optionsDisabled && 'opacity-40'} z-10`}>Deleted tracks:</p>
                            <Toggle
                                isOn={filterOptions.showRemoved}
                                onToggle={(newVal: boolean) => setFilterOptions({ ...filterOptions, showRemoved: newVal })}
                                onLabel="Show"
                                offLabel="Hide"
                                disabled={optionsDisabled}
                            />
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