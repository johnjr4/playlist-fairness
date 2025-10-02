import type PlaylistMetadata from "../utils/types/playlistMeta";
import { msToHour } from "../utils/unitConvert";
import CoverArt from "./ui/CoverArt";
import * as Public from 'spotifair';
import Dropdown from "./ui/Dropdown";
import { LuEllipsis } from "react-icons/lu";
import { useRef, useState } from "react";
import Modal from "./ui/Modal";
import AutoResizeText from "./ui/AutoResizeText";
import { CgSpinner } from "react-icons/cg";
import cardClasses from "../styling/cards.module.css";

interface PlaylistHeaderProps {
    playlist: Public.Playlist;
    playlistMetadata: PlaylistMetadata;
    setPlaylistSync: (setSyncTo: boolean) => void;
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;
}

// Consult playlist_page_fsm in the planning document
type PlaylistHeaderState = 'loading' | 'error' | 'loadedS' | 'loadedU' | 'syncing' | 'unsyncing';

function getHeaderState(isLoading: boolean, error: string | null, isSyncing: boolean, playlist: Public.Playlist | null) {
    let state = 'loading';
    if (!isLoading) {
        if (error) {
            state = 'error';
        } else {
            // By here, we know playlist exists
            if (isSyncing) {
                state = 'syncing';
            } else {
                if (playlist!.syncEnabled) {
                    state = 'loadedS';
                } else {
                    state = 'loadedU';
                }
            }
        }
    }
    return state;
}

function PlaylistHeader({ playlist, playlistMetadata, setPlaylistSync, isLoading, isSyncing, error }: PlaylistHeaderProps) {
    const overviewRef = useRef<HTMLDivElement>(null);
    const [syncModalOpen, setSyncModalOpen] = useState(false);

    const state = getHeaderState(isLoading, error, isSyncing, playlist);

    const settingsDropdownItems = [
        playlist.syncEnabled ? { label: 'Disable sync', onClick: () => setSyncModalOpen(true) } : { label: 'Enable sync', onClick: () => setPlaylistSync(true) }
    ]

    let contentSummaryText;
    if (isSyncing) {
        contentSummaryText = 'Syncing...';
    } else if (!playlist.syncEnabled) {
        contentSummaryText = 'Playlist not synced';
    } else {
        contentSummaryText = `${playlistMetadata.numTracks} Tracks • ${msToHour(playlistMetadata.totalMs, true)}`;
    }

    return (
        <div className='relative w-full flex flex-col gap-4 justify-around items-center mt-5 md:mt-2'>
            <div className={`
                flex items-center flex-col md:flex-row
                rounded-md gap-2 py-2 px-3 lg:gap-4 lg:px-5 lg:py-1
                ${cardClasses['glass-card']}
                `}
            >
                <CoverArt
                    coverUrl={playlist.coverUrl}
                    size='w-50 sm:w-60 md:w-32 lg:w-40'
                    className="
                        scale-112
                        md:scale-120
                        -translate-y-4
                        md:translate-y-0
                        md:-translate-x-5
                        shadow-2xl shadow-background-500 z-10
                    "
                />
                <div className="w-80 sm:w-110 md:w-120 lg:w-2xl xl:w-3xl" ref={overviewRef}>
                    <AutoResizeText text={playlist.name} parentRef={overviewRef} maxFontSize={60} minFontSize={18} textStyle="font-bold" />
                    <p className="flex text-dark-highlight gap-1 text-xs md:text-sm">
                        {contentSummaryText}
                    </p>
                </div>
            </div>
            <div className="absolute -top-8 right-2 md:top-0 md:right-0 flex justify-center">
                {isSyncing
                    ? <div className="px-2 py-1 lg:px-4 lg:py-1.5"><CgSpinner className="animate-spin text-2xl lg:text-4xl" /></div>
                    : <Dropdown items={settingsDropdownItems} hasCaret={false}>
                        <LuEllipsis className="text-2xl lg:text-4xl" />
                    </Dropdown>
                }
            </div>

            <Modal
                isOpen={syncModalOpen}
                message="This will delete all listening history associated with this playlist. Are you sure you want to continue?"
                secondaryMessage="Your data on Spotify will not be affected"
                onClose={() => setSyncModalOpen(false)}
                onConfirm={() => setPlaylistSync(false)}
            />

        </div>
    )
}

export default PlaylistHeader;