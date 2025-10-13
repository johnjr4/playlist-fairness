import type * as Public from 'spotifair';
import CoverArt from './ui/CoverArt';
import ptRowClasses from '../styling/playlistTrackRow.module.css'
import { memo } from 'react';

interface PlaylistTrackRowProps {
    index: number;
    playlistTrack: Public.PlaylistTrackHist;
    selectedTrack: Public.PlaylistTrackHist | null;
    setSelectedTrack: (track: Public.PlaylistTrackHist | null) => void;
    maxPlayCount: number;
}

function getFillPercent(playlistTrack: Public.PlaylistTrackHist, maxPlayCount: number) {
    const fillPercent = maxPlayCount > 0 ? (playlistTrack.listeningEvents.length / maxPlayCount) * 100 : 0;
    return Math.max(0, Math.min(fillPercent, 100));
}

function PlaylistTrackRow({ index, playlistTrack, selectedTrack, setSelectedTrack, maxPlayCount }: PlaylistTrackRowProps) {
    return (
        <div className={`w-full ${playlistTrack.currentlyOnPlaylist ? undefined : 'brightness-60'} text-dark-highlight z-10 sm:pr-2 lg:pr-4 ${ptRowClasses['row-full']} items-center`}>
            <div className='max-[500px]:hidden text-right text-xs md:text-sm font-mono'>{(index + 1).toString().replaceAll('0', 'O')}</div>
            <button
                className={`rounded-xs outline-background-100 outline-0 ${selectedTrack && selectedTrack.track.id === playlistTrack.track.id ? 'md:outline-2' : 'md:hover:outline-1'}`}
                onClick={selectedTrack && selectedTrack.track.id === playlistTrack.track.id ? () => setSelectedTrack(null) : () => setSelectedTrack(playlistTrack)}
            >
                <PlaylistTrackRowContent playlistTrack={playlistTrack} maxPlayCount={maxPlayCount} />
            </button>
        </div>
    )
}

type PlaylisTrackRowContentProps = Pick<PlaylistTrackRowProps, 'maxPlayCount'> & {
    playlistTrack: Public.PlaylistTrackHist;
}

const PlaylistTrackRowContent = memo(function PlaylistTrackRowContent({ playlistTrack, maxPlayCount }: PlaylisTrackRowContentProps) {
    const fillPercent = getFillPercent(playlistTrack, maxPlayCount);
    const track = playlistTrack.track;
    return (
        <div
            className={`text-left relative px-2 py-1.5 ${ptRowClasses['row-details']} z-10 items-center cursor-pointer`}

        >
            {/* Background fill */}
            <div
                className="absolute top-0 left-0 h-full bg-background-200 opacity-40 -z-1 rounded-xs"
                style={{ width: `${fillPercent}%` }}
            />
            {/* Content */}
            <CoverArt coverUrl={track.album.coverUrl} size="w-full" />
            <div className='flex flex-col'>
                <p className='text-textPrimary text-sm md:text-base line-clamp-1' style={{ lineHeight: 'normal' }}>{track.name}</p>
                <p className='text-xs md:text-sm line-clamp-1'>{track.artist.name}</p>
            </div>
            {/* Hide album when less than 800 px */}
            <div className='max-[1024px]:hidden text-sm line-clamp-2'>{track.album.name}</div>
            <div
                className=' text-right font-mono'
                style={{ filter: `brightness(${fillPercent + 100}%)` }}
            >
                {playlistTrack.listeningEvents.length.toLocaleString().replaceAll('0', 'O')}
            </div>
        </div>
    )
});

export default PlaylistTrackRow