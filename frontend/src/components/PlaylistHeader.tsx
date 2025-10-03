import type PlaylistMetadata from "../utils/types/playlistMeta";
import { msToHour } from "../utils/unitConvert";
import CoverArt from "./ui/CoverArt";
import * as Public from 'spotifair';
import Dropdown, { type DropdownItem } from "./ui/Dropdown";
import { LuEllipsis } from "react-icons/lu";
import { useRef, useState } from "react";
import Modal from "./ui/Modal";
import AutoResizeText from "./ui/AutoResizeText";
import { CgSpinner } from "react-icons/cg";
import cardClasses from "../styling/cards.module.css";
import errorCoverUrl from "../assets/covers/error_cover.svg";
import loadingCoverUrl from "../assets/covers/loading_cover.svg";

interface PlaylistHeaderProps {
    playlist: Public.PlaylistWithStats | null;
    setPlaylistSync: (setSyncTo: boolean) => void;
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;
}

// Consult playlist_page_fsm in the planning document
type PlaylistHeaderState = 'loading' | 'error' | 'loadedS' | 'loadedU' | 'syncing';

function getHeaderState(isLoading: boolean, error: string | null, isSyncing: boolean, playlist: Public.PlaylistWithStats | null): PlaylistHeaderState {
    // 1: is it loading?
    if (!isLoading) {
        // 2: was there an error?
        if (error) {
            return 'error';
        }

        // By here, we know playlist exists
        // 3: are we syncing right now? (can only be the case once it's been loaded successfully)
        if (isSyncing) {
            return 'syncing';
        }

        // 4: is sync enabled?
        if (playlist!.syncEnabled) {
            return 'loadedS';
        }

        return 'loadedU';
    }
    return 'loading';
}

// Functions deriving from state

function getDropdown(state: PlaylistHeaderState, setSyncModalOpen: (setOpen: boolean) => void, setPlaylistSync: (setSync: boolean) => void) {
    // Determine dropdown
    if (state === 'syncing' || state === 'loading')
        return (
            <div className="px-2 py-1 lg:px-4 lg:py-1.5"><CgSpinner className="animate-spin text-2xl lg:text-4xl" /></div>
        );
    else if (state === 'error') {
        return undefined;
    }

    // We're in valid loaded state, so determine dropdown items
    const settingsDropdownItems: DropdownItem[] = [];
    if (state === 'loadedS') settingsDropdownItems.push({ label: 'Disable sync', onClick: () => setSyncModalOpen(true) });
    else if (state === 'loadedU') settingsDropdownItems.push({ label: 'Enable sync', onClick: () => setPlaylistSync(true) });

    return (
        <Dropdown items={settingsDropdownItems} hasCaret={false}>
            <LuEllipsis className="text-2xl lg:text-4xl" />
        </Dropdown>
    );
}

function getHeaderContent(state: PlaylistHeaderState, playlist: Public.PlaylistWithStats | null) {
    switch (state) {
        case 'error':
            return { title: 'Error', summary: 'Error getting playlist', coverUrl: errorCoverUrl };
        case 'loading':
            return { title: '', summary: '', coverUrl: loadingCoverUrl }
        default:
            // Non-null playlist because not error or loading
            let contentSummaryText = 'Syncing...';
            if (state === 'loadedU') {
                contentSummaryText = 'Playlist not synced';
            } else if (state === 'loadedS') {
                contentSummaryText = `${playlist!.stats.numTracks.toLocaleString()} Tracks • ${msToHour(playlist!.stats.totalMs, true)}`;
            }
            return { title: playlist!.name, summary: contentSummaryText, coverUrl: playlist!.coverUrl };
    }
}

function PlaylistHeader({ playlist, setPlaylistSync, isLoading, isSyncing, error }: PlaylistHeaderProps) {
    const overviewRef = useRef<HTMLDivElement>(null);
    const [syncModalOpen, setSyncModalOpen] = useState(false);

    const state = getHeaderState(isLoading, error, isSyncing, playlist);
    // const state = 'loading';
    console.log(playlist);

    const dropdown = getDropdown(state, setSyncModalOpen, setPlaylistSync);

    const { title, summary, coverUrl } = getHeaderContent(state, playlist);

    return (
        <div className='relative w-full max-w-7xl flex flex-col gap-4 justify-around items-center mt-5 md:mt-2'>
            <div className={`
                flex items-center flex-col md:flex-row
                rounded-md gap-2 py-2 px-3 lg:gap-4 lg:px-5 lg:py-1
                ${cardClasses['glass-card']}
                `}
            >
                <CoverArt
                    coverUrl={coverUrl}
                    size='w-50 sm:w-60 md:w-32 lg:w-40'
                    className="
                        scale-112
                        md:scale-124
                        lg:scale-120
                        -translate-y-4
                        md:translate-y-0
                        md:-translate-x-5
                        shadow-2xl shadow-background-500 z-10
                    "
                />
                <div className="w-80 sm:w-110 md:w-120 lg:w-2xl xl:w-3xl" ref={overviewRef}>
                    <AutoResizeText text={title} parentRef={overviewRef} maxFontSize={60} minFontSize={18} textStyle="font-bold" />
                    <p className="flex text-dark-highlight gap-1 text-xs md:text-sm">
                        {summary}
                    </p>
                </div>
            </div>
            <div className="absolute -top-8 right-2 md:top-0 md:right-0 flex justify-center">
                {dropdown}
            </div>

            <Modal
                isOpen={syncModalOpen}
                message="This will delete all listening history associated with this playlist. Are you sure you want to continue?"
                secondaryMessage="Your data on Spotify will not be affected"
                onClose={() => setSyncModalOpen(false)}
                onConfirm={() => { setPlaylistSync(false); setSyncModalOpen(false); }}
            />

        </div>
    )
}

export default PlaylistHeader;