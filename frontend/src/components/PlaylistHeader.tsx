import type PlaylistMetadata from "../utils/types/playlistMeta";
import { msToHour } from "../utils/unitConvert";
import CoverArt from "./ui/CoverArt";
import * as Public from 'spotifair';
import Dropdown from "./ui/Dropdown";
import { LuEllipsis } from "react-icons/lu";
import { useRef, useState } from "react";
import Modal from "./ui/Modal";
import AutoResizeText from "./ui/AutoResizeText";
import Tilter from "./ui/Tilter";

interface PlaylistHeaderProps {
    playlist: Public.PlaylistHist;
    playlistMetadata: PlaylistMetadata;
    setPlaylistSync: (setSyncTo: boolean) => void;
}

function PlaylistHeader({ playlist, playlistMetadata, setPlaylistSync }: PlaylistHeaderProps) {
    const overviewRef = useRef<HTMLDivElement>(null);
    const [syncModalOpen, setSyncModalOpen] = useState(false);
    const settingsDropdownItems = [
        { label: 'Disable sync', onClick: () => setSyncModalOpen(true) }
    ]

    return (
        <div className='relative w-full flex gap-4 justify-around mt-5 md:mt-2'>
            <div className="flex items-center flex-col md:flex-row
            rounded-md gap-2 py-2 px-3 lg:gap-4 lg:px-5 lg:py-1
            bg-background-300/30
            outline md:outline-2 outline-background-50/30
            shadow-sm md:shadow-md shadow-background-500">
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
                    {/* <h1>{playlist.name}</h1> */}
                    <AutoResizeText text={playlist.name} parentRef={overviewRef} maxFontSize={60} minFontSize={18} textStyle="font-bold" />
                    <p className="flex text-dark-highlight gap-1 text-xs md:text-sm">
                        {playlistMetadata.numTracks} Tracks • {msToHour(playlistMetadata.totalMs, true)}
                    </p>
                </div>
            </div>
            <Dropdown positionClassName='absolute -top-8 right-2 md:top-0 md:right-0 md:mx-2' items={settingsDropdownItems} hasCaret={false}>
                <LuEllipsis className="text-2xl lg:text-4xl" />
            </Dropdown>

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