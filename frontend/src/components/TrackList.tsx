import PlaylistTrackRow from "../components/PlaylistTrackRow";
import ptRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';
import Button from "./ui/Button";
import { ScaleLoader } from "react-spinners";
import loadingClasses from '../styling/loading.module.css';
import type { PlaylistHistState, SortingOption } from "../utils/types/playlistPage";
import SpotifyLink from "./ui/SpotifyLink";
import { List } from "react-window";
import { nameComparator, numPlaysComparator, lastPlayedAtComparator, playlistOrderComparator } from "../utils/comparators";
import { useMemo } from "react";

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
    filteredTracks: Public.PlaylistTrackHist[],
    selectedTrack: Public.PlaylistTrackHist | null,
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void,
    totalNumTracks: number) {
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

    const maxPlayCount = filteredTracks.reduce((max, curr) => Math.max(max, curr.listeningEvents.length), 0);
    return (
        <List
            // className="grow flex flex-col w-full"
            rowComponent={PlaylistTrackRow}
            rowCount={filteredTracks.length}
            rowHeight={63}
            rowProps={{ filteredTracks, selectedTrack, setSelectedTrack, maxPlayCount }}
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

function getTrackListTable(
    playlist: Public.Playlist,
    filteredTracks: Public.PlaylistTrackHist[],
    selectedTrack: Public.PlaylistTrackHist | null,
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void,
    totalNumTracks: number) {
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
                {getTrackList(playlist, filteredTracks, selectedTrack, setSelectedTrack, totalNumTracks)}
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
    selectedTrack: Public.PlaylistTrackHist | null,
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void,
    totalNumTracks: number,
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
            return getTrackListTable(playlist!, filteredTracks!, selectedTrack, setSelectedTrack, totalNumTracks);
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

    const mainContent = getMainContent(state, playlist, sortedTracks, selectedTrack, setSelectedTrack, totalNumTracks, refetch, setPlaylistSync);

    return (
        <div className={`w-full flex flex-col items-center gap-2 py-3 px-2 rounded-sm ${className}`}>
            {mainContent}
        </div>
    )
}

export default TrackList;