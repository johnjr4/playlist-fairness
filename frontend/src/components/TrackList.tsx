import PlaylistTrackRow from "../components/PlaylistTrackRow";
import ptRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';
import Button from "./ui/Button";
import { ScaleLoader } from "react-spinners";
import loadingClasses from '../styling/loading.module.css';
import type { PlaylistHistState, SortingOption } from "../utils/types/playlistPage";
import SpotifyLink from "./ui/SpotifyLink";
import { List } from "react-window";
import { useMemo } from "react";

interface TrackListProps {
    className?: string,
    playlist: Public.PlaylistHist | null;
    setPlaylistSync: (setSyncTo: boolean) => void;
    state: PlaylistHistState;
    refetch: () => Promise<void>;
    filterBySearch: (playlistTrack: Public.PlaylistTrackHist) => boolean;
    filterByOptions: (playlistTrack: Public.PlaylistTrackHist) => boolean;
    comparator: (a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) => number;
}

function getTrackList(playlist: Public.Playlist, filteredTracks: Public.PlaylistTrackHist[], totalNumTracks: number, maxPlayCount: number) {
    if (totalNumTracks < 1) {
        return (
            <div className="grow flex justify-center items-center">
                <p>This playlist doesn't have any tracks. Try adding some <SpotifyLink text='on Spotify' type='playlist' uri={playlist.spotifyUri} underlined={true} /></p>
            </div>
        )
    }


    if (filteredTracks.length < 1) {
        return (
            <div className="grow flex justify-center items-center">
                <p>No search results</p>
            </div>
        )
    }

    return (
        <List
            className="grow flex flex-col w-full"
            rowComponent={PlaylistTrackRow}
            rowCount={filteredTracks.length}
            rowHeight={63}
            rowProps={{ filteredTracks, maxPlayCount }}
        />
    );

    // return (
    //     <ul className="grow flex flex-col w-full gap-2">
    //         {filteredTracks.map((t, i) => <PlaylistTrackRow
    //             index={i}
    //             playlistTrack={t}
    //             key={t.track.id}
    //             fillPercent={maxCount > 0 ? (t.listeningEvents.length / maxCount) * 100 : 0} />)}
    //     </ul>
    // )
}

function getTrackListTable(playlist: Public.Playlist, filteredTracks: Public.PlaylistTrackHist[], totalNumTracks: number, maxPlayCount: number) {
    return (
        <>
            <div className="w-full flex flex-col gap-2 grow">
                <div className={`${ptRowClasses['row-full']} font-bold w-full pr-4`}>
                    <div className="text-right">#</div>
                    <div className={`${ptRowClasses['row-details']}`}>
                        <div>Title</div>
                        <div />
                        <div>Album</div>
                        <div className='text-right'>Plays</div>
                    </div>
                </div>
                {getTrackList(playlist, filteredTracks, totalNumTracks, maxPlayCount)}
            </div>
        </>
    )
}

function getCenteredContent(children: React.ReactNode) {
    return (
        <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
            {children}
        </div>
    )
}

function getMainContent(
    state: PlaylistHistState,
    playlist: Public.Playlist | null,
    filteredTracks: Public.PlaylistTrackHist[] | null,
    totalNumTracks: number,
    maxPlayCount: number,
    refetch: () => Promise<void>,
    setPlaylistSync: (setSyncTo: boolean) => void) {

    switch (state) {
        case 'loading':
            // Loading means card is fully empty
            return undefined;
        case 'error':
            return getCenteredContent(
                <>
                    <div>Sorry, something went wrong</div>
                    <Button onClick={() => refetch()}>Try again</Button>
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
                    <Button onClick={() => setPlaylistSync(true)}>Enable sync</Button>
                </>
            );
        case 'synced':
            return getTrackListTable(playlist!, filteredTracks!, totalNumTracks, maxPlayCount);
        default:
            return getCenteredContent(
                <>
                    <div>Something went wrong</div>
                </>
            );
    }
}

function TrackList({ className, playlist, setPlaylistSync, filterBySearch, filterByOptions, comparator, state, refetch }: TrackListProps) {

    // Derive relevant playlist data
    const totalNumTracks = playlist?.tracks.length ?? 0;
    const maxPlayCount = useMemo(() => {
        if (!playlist) return 0;
        return playlist.tracks.reduce((accumulator, currentValue) => {
            return Math.max(accumulator, currentValue.listeningEvents.length);
        }, 0);
    }, [playlist]);
    const filteredBySearch = useMemo(() => {
        console.log('filtering by SEARCH');
        if (!playlist) return null;
        return playlist.tracks.filter(t => filterBySearch(t));
    }, [playlist, filterBySearch]);
    const filteredTracks = useMemo(() => {
        console.log('filtering by options');
        if (!filteredBySearch) return null;
        const filteredByOptions = filteredBySearch.filter(t => filterByOptions(t))
        filteredByOptions.sort(comparator);
        return filteredByOptions;
    }, [filteredBySearch, filterByOptions]);

    // Get content from state
    const mainContent = getMainContent(state, playlist, filteredTracks, totalNumTracks, maxPlayCount, refetch, setPlaylistSync);

    return (
        <div className={`w-full flex flex-col items-center gap-2 py-3 px-2 rounded-sm ${className}`}>
            {mainContent}
        </div>
    )
}

export default TrackList;