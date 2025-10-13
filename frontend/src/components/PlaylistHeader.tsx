import { msToHour } from "../utils/unitConvert";
import CoverArt from "./ui/CoverArt";
import type * as Public from 'spotifair';
import Dropdown, { type DropdownItem } from "./ui/Dropdown";
import { LuEllipsis } from "react-icons/lu";
import { useRef, useState } from "react";
import Modal from "./ui/Modal";
import AutoResizeText from "./ui/AutoResizeText";
import { CgSpinner } from "react-icons/cg";
import cardClasses from "../styling/cards.module.css";
import errorCoverUrl from "../assets/covers/error_cover.svg";
import loadingCoverUrl from "../assets/covers/loading_cover.svg";
import useQuery from "../utils/api/useQuery";
import type { PlaylistHeaderState, PlaylistHistState } from "../utils/types/playlistPage";
import { toSpotifyLink } from "../utils/spotifyLink";
import { useMediaQuery } from "usehooks-ts";

interface PlaylistHeaderProps {
    playlistId: number;
    playlistStats: Public.PlaylistStat;
    setPlaylistSync: (setSyncTo: boolean) => void;
    // isSyncing: boolean;
    playlistHistState: PlaylistHistState;
}


function getHeaderState(isLoading: boolean, error: string | null): PlaylistHeaderState {
    // 1: is it loading?
    if (isLoading) {
        return 'loading';
    }

    // 2: was there an error?
    if (error) {
        return 'error';
    }

    return 'loaded';
}

// Functions deriving from state

function getDropdown(playlist: Public.Playlist | null, state: PlaylistHistState, setSyncModalOpen: (setOpen: boolean) => void, updateSync: (setSync: boolean) => void) {
    // Determine dropdown
    if (state === 'syncing' || state === 'loading')
        return (
            <div className="px-2 py-1 lg:px-3 lg:py-1"><CgSpinner className="animate-spin text-2xl lg:text-4xl" /></div>
        );
    else if (state === 'error') {
        return undefined;
    }

    // We're in valid loaded state, so determine dropdown items
    const settingsDropdownItems: DropdownItem[] = [];
    if (playlist) settingsDropdownItems.push({ label: 'Open on Spotify', onClick: () => window.open(toSpotifyLink(playlist.spotifyUri, 'playlist')) });
    if (state === 'synced') settingsDropdownItems.push({ label: 'Disable sync', onClick: () => setSyncModalOpen(true) });
    else if (state === 'unsynced') settingsDropdownItems.push({ label: 'Enable sync', onClick: () => updateSync(true) });

    return (
        <Dropdown items={settingsDropdownItems} hasCaret={false} buttonClassName="px-2 py-1 lg:px-3 lg:py-1" optionListClassName="bg-background-700">
            <LuEllipsis className="text-2xl lg:text-4xl" />
        </Dropdown>
    );
}

function getPlaylistIdentifiers(state: PlaylistHeaderState, playlist: Public.Playlist | null) {
    switch (state) {
        case 'error':
            return { title: 'Error', coverUrl: errorCoverUrl };
        case 'loading':
            return { title: '', coverUrl: loadingCoverUrl }
        default:
            // Non-null playlist because not error or loading
            return { title: playlist!.name, coverUrl: playlist!.coverUrl };
    }
}

function getSummaryText(statsState: PlaylistHistState, headerState: PlaylistHeaderState, playlistStats: Public.PlaylistStat) {
    switch (headerState) {
        // Header error/loading pre-empt sync state
        case 'error':
            return 'Error getting playlist';
        case 'loading':
            return ''
        default:
        // Do nothing if loaded state 
    }
    switch (statsState) {
        case 'error':
            return 'Error getting playlist tracks';
        case 'loading':
            return 'Lodaing tracks...';
        case 'syncing':
            return 'Syncing...';
        case 'synced':
            return `${playlistStats.numTracks.toLocaleString()} Tracks • ${msToHour(playlistStats.totalMs, true)}`;
        case 'unsynced':
            return 'Playlist not synced';
        default:
            // Non-null playlist because not error or loading
            return 'Something went wrong';
    }
}

function PlaylistHeader({ playlistId, setPlaylistSync, playlistHistState, playlistStats }: PlaylistHeaderProps) {
    const { data: playlist, isLoading, error } = useQuery<Public.Playlist>(`/playlists/${playlistId}`);
    const overviewRef = useRef<HTMLDivElement>(null);
    const [syncModalOpen, setSyncModalOpen] = useState(false);

    const state = getHeaderState(isLoading, error);
    // const state = 'loading';
    const mdBreakpoint = useMediaQuery('(min-width: 768px)');

    const { title, coverUrl } = getPlaylistIdentifiers(state, playlist);

    const dropdown = getDropdown(playlist, playlistHistState, setSyncModalOpen, updateSync);
    const summary = getSummaryText(playlistHistState, state, playlistStats);

    function updateSync(setSync: boolean) {
        // console.log(`Updating sync to ${setSync}`);
        setPlaylistSync(setSync);
    }

    return (
        <div className='relative w-full max-w-70 sm:max-w-88 md:max-w-160 lg:max-w-3xl xl:max-w-5xl flex flex-col gap-4 justify-around items-center mt-3 md:mt-2'>
            <div className={`
                w-full
                relative flex justify-baseline items-center flex-col md:flex-row
                rounded-md gap-2 py-2 px-3 lg:gap-4 md:px-5 lg:py-1
                ${cardClasses['glass-card']}
                `}
            >
                <CoverArt
                    coverUrl={coverUrl}
                    size='w-40 sm:w-50 md:w-36 lg:w-40'
                    className="
                        scale-112
                        md:scale-124
                        -translate-y-2
                        sm:-translate-y-3
                        md:translate-y-0
                        md:-translate-x-5
                        shrink-0
                        grow-0
                        shadow-2xl shadow-background-500 z-10
                    "
                />
                <div className="w-full md:w-0 basis-0 grow shrink" ref={overviewRef}>
                    <AutoResizeText text={title} maxFontSize={mdBreakpoint ? 60 : 30} minFontSize={18} textStyle="font-bold" />
                    <p className="flex text-dark-highlight gap-1 text-xs md:text-sm">
                        {summary}
                    </p>
                </div>
                <div className="absolute top-1 flex justify-center
                    right-1 md:-right-14 lg:-right-21 xl:-right-30
                ">
                    {dropdown}
                </div>
            </div>

            <Modal
                isOpen={syncModalOpen}
                message="This will delete all listening history associated with this playlist. Are you sure you want to continue?"
                secondaryMessage="Your data on Spotify will not be affected"
                onClose={() => setSyncModalOpen(false)}
                onConfirm={() => { setSyncModalOpen(false); updateSync(false); }}
            />

        </div>
    )
}

export default PlaylistHeader;