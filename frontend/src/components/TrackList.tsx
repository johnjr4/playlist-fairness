import PlaylistTrackRow from "../components/PlaylistTrackRow";
import ptRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';
import Button from "./ui/Button";
import { ScaleLoader } from "react-spinners";
import loadingClasses from '../styling/loading.module.css';
import type { PlaylistHistState, SortingOption } from "../utils/types/playlistPage";
import SpotifyLink from "./ui/SpotifyLink";
import { nameComparator, numPlaysComparator, lastPlayedAtComparator, playlistOrderComparator } from "../utils/comparators";
import { useMemo, useRef } from "react";
import { useWindowVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useMediaQuery } from "usehooks-ts";

interface TrackListProps {
    className?: string,
    playlist: Public.Playlist | null;
    filteredTracks: Public.PlaylistTrackHist[] | null;
    sortingOption: SortingOption;
    totalNumTracks: number
    setPlaylistSync: (setSyncTo: boolean) => void;
    selectedTrack: Public.PlaylistTrackHist | null;
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void;
    state: PlaylistHistState;
    refetch: () => Promise<void>;
}

function getTrackList(
    playlist: Public.Playlist,
    sortedTracks: Public.PlaylistTrackHist[],
    rowVars: RowVars,
    virtualizerVars: VirtualizerVars,
) {
    if (rowVars.totalNumTracks < 1) {
        return (
            <div className="grow flex flex-col justify-center items-center gap-1 p-4 text-center text-sm md:text-base">
                <p>This playlist doesn't have any tracks. Try adding some <SpotifyLink text='on Spotify' type='playlist' uri={playlist.spotifyUri} underlined={true} /></p>
                <p className="text-xs md:text-sm text-dark-highlight">It may take up to 30 minutes for tracks to sync</p>
            </div>
        )
    }


    if (sortedTracks.length < 1) {
        return (
            <div className="grow flex justify-center items-center">
                <p>No search results</p>
            </div>
        )
    }

    const maxPlayCount = sortedTracks.reduce((max, curr) => Math.max(max, curr.listeningEvents.length), 0);
    return (
        <div
            ref={virtualizerVars.listRef}
        >
            <ul
                style={{
                    position: 'relative',
                    width: '100%',
                    height: `${virtualizerVars.rowVirtualizer.getTotalSize()}px`
                }}
            >
                {virtualizerVars.rowVirtualizer.getVirtualItems().map((virtualRow => (
                    <li
                        key={virtualRow.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start - virtualizerVars.rowVirtualizer.options.scrollMargin}px)`
                        }}
                    >
                        <PlaylistTrackRow
                            key={virtualRow.key}
                            index={virtualRow.index}
                            playlistTrack={sortedTracks[virtualRow.index]}
                            maxPlayCount={maxPlayCount}
                            selectedTrack={rowVars.selectedTrack}
                            setSelectedTrack={rowVars.setSelectedTrack}
                        />
                    </li>
                )))}
            </ul>
        </div>
    );
}

function getTrackListTable(
    playlist: Public.Playlist,
    sortedTracks: Public.PlaylistTrackHist[],
    rowVars: RowVars,
    virtualizerVars: VirtualizerVars,
) {
    return (
        <>
            <div className="w-full flex flex-col gap-2 grow">
                <div className={`${ptRowClasses['row-full']} font-bold w-full pr-4 text-sm md:text-base`} style={{ lineHeight: 'normal' }}>
                    <div className="text-right max-[500px]:hidden">#</div>
                    <div className={`${ptRowClasses['row-details']} px-2`}>
                        <div>Title</div>
                        <div />
                        <div className="hidden min-[1024px]:block">Album</div>
                        <div className='text-right'>Plays</div>
                    </div>
                </div>
                {getTrackList(playlist, sortedTracks, rowVars, virtualizerVars)}
            </div>
        </>
    )
}

function getCenteredContent(children: React.ReactNode) {
    return (
        <div className="w-full h-full flex flex-col gap-1 justify-center items-center text-center">
            {children}
        </div>
    )
}

function getMainContent(
    state: PlaylistHistState,
    playlist: Public.Playlist | null,
    sortedTracks: Public.PlaylistTrackHist[] | null,
    unsyncedVars: UnsyncedVars,
    rowVars: RowVars,
    virtualizerVars: VirtualizerVars,
) {

    switch (state) {
        case 'loading':
            // Loading means card is fully empty
            return undefined;
        case 'error':
            return getCenteredContent(
                <>
                    <div>Sorry, something went wrong</div>
                    <Button useDefaultSizing={true} onClick={() => unsyncedVars.refetch()}>Try again</Button>
                </>
            );
        case 'syncing':
            return getCenteredContent(
                <>
                    <div className={`flex flex-col gap-1 ${loadingClasses['fade-up']}`}>
                        <p className="text-base lg:text-lg">Syncing playlist</p>
                        <div className="p-2 text-center flex justify-center">
                            <ScaleLoader color="var(--color-textPrimary)" height={12} barCount={12} radius={5} speedMultiplier={1.2} />
                        </div>
                    </div>
                    <p className={`text-sm lg:text-base ${loadingClasses['fade-in']}`}>
                        This may take a while
                    </p>
                </>
            );
        case 'unsynced':
            return getCenteredContent(
                <>
                    <div>Sync not enabled for this playlist</div>
                    <Button useDefaultSizing={true} onClick={() => unsyncedVars.setPlaylistSync(true)}>Enable sync</Button>
                </>
            );
        case 'synced':
            return getTrackListTable(playlist!, sortedTracks!, rowVars, virtualizerVars);
        default:
            return getCenteredContent(
                <>
                    <div>Something went wrong</div>
                </>
            );
    }
}

function TrackList({
    className,
    playlist,
    filteredTracks,
    sortingOption,
    totalNumTracks,
    setPlaylistSync,
    selectedTrack,
    setSelectedTrack,
    state,
    refetch
}: TrackListProps) {

    // Get content from state
    function comparator(a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) {
        const ascendingMultipler = sortingOption.ascending ? 1 : -1;
        switch (sortingOption.sortedOn) {
            case 'num_plays':
                return numPlaysComparator(ascendingMultipler, a, b);
            case 'name':
                return nameComparator(ascendingMultipler, a, b);
            case 'playlist_order':
                return playlistOrderComparator(ascendingMultipler, a, b);
            case 'last_played_at':
                return lastPlayedAtComparator(ascendingMultipler, a, b);
        }
    }

    const sortedTracks = useMemo(() => {
        const copiedTracks = filteredTracks ? [...filteredTracks] : null;
        if (copiedTracks) copiedTracks.sort(comparator);
        return copiedTracks;
    }, [filteredTracks, sortingOption])

    const getItemKey = useMemo(() => (index: number) => sortedTracks ? sortedTracks[index].track.id : 0, [sortedTracks]);


    const coverSizeMatches = useMediaQuery('(min-width: 500px)');
    const gapSizeMatches = useMediaQuery('(min-width: 800px)')
    const listRef = useRef<HTMLDivElement | null>(null);
    const rowVirtualizer = useWindowVirtualizer({
        count: sortedTracks ? sortedTracks.length : 0,
        estimateSize: () => coverSizeMatches ? 52 : 48,
        scrollMargin: listRef.current?.offsetTop ?? 0,
        overscan: 5, // How many extra items above and below are rendered
        getItemKey: getItemKey,
        gap: gapSizeMatches ? 6 : 3,
    });

    const rowVars: RowVars = { selectedTrack, setSelectedTrack, totalNumTracks };
    const virtualizerVars: VirtualizerVars = { rowVirtualizer, listRef };
    const unsyncedVars: UnsyncedVars = { refetch, setPlaylistSync };

    const mainContent = getMainContent(state, playlist, sortedTracks, unsyncedVars, rowVars, virtualizerVars);

    return (
        <div className={`w-full flex flex-col items-center gap-2 py-3 px-1 md:px-2 rounded-sm ${className}`}>
            {mainContent}
        </div>
    )
}

// For params passed all the way to PlaylistTrackRows
interface RowVars {
    selectedTrack: Public.PlaylistTrackHist | null;
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void;
    totalNumTracks: number;
}

// For top level getMainContent (used on cases other than state === 'synced')
interface UnsyncedVars {
    refetch: () => Promise<void>;
    setPlaylistSync: (setSyncTo: boolean) => void;
}

// For params related to virtualization
interface VirtualizerVars {
    rowVirtualizer: Virtualizer<Window, Element>;
    listRef: React.RefObject<HTMLDivElement | null>;
}

export default TrackList;