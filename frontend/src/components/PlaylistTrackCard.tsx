import * as Public from 'spotifair';
import CoverArt from './ui/CoverArt';
import cardClasses from '../styling/cards.module.css';
import AutoResizeText from './ui/AutoResizeText';
import { FaCompactDisc } from 'react-icons/fa';
import { PiMicrophoneStageFill } from 'react-icons/pi';
import type { AnalysisStats } from '../utils/types/playlistPage';
import { roundToDecimals } from '../utils/numberUtils';

function getPlayDifference(stats: AnalysisStats, numPlays: number) {
    if (stats.totalPlays <= 0) return undefined;
    return <>({roundToDecimals(Math.abs(stats.avgPlays - numPlays), 2)} {stats.avgPlays > numPlays ? 'less' : 'more'} than average)</>;
}

function PlaylistTrackCard({ playlistTrack, stats }: { playlistTrack: Public.PlaylistTrackHist, stats: AnalysisStats }) {
    const numPlays = playlistTrack.listeningEvents.length;

    return (
        <div className='flex flex-col'>
            <div className={`flex flex-col ${cardClasses['glass-card']} rounded-xs p-2 w-60 my-2 gap-1`}>
                <CoverArt coverUrl={playlistTrack.track.album.coverUrl} size='w-full' />
                <AutoResizeText maxFontSize={20} minFontSize={16} textStyle='line-clamp-4' text={playlistTrack.track.name} containerStyle='min-h-6.5' />
                <div className='w-full flex flex-col justify-between text-xs'>
                    <div className='flex items-baseline gap-1'>
                        <PiMicrophoneStageFill className='size-2.5 shrink-0' />
                        <p className='shrink grow line-clamp-1'>{playlistTrack.track.artist.name}</p>
                    </div>
                    <div className='flex items-baseline gap-1'>
                        <FaCompactDisc className='size-2.5 shrink-0' />
                        <p className='shrink grow line-clamp-1'>{playlistTrack.track.album.name}</p>
                    </div>
                </div>
            </div>
            <div className='text-sm'>
                <p>Plays: {numPlays} <span className='text-sm text-dark-highlight'> {getPlayDifference(stats, numPlays)}</span></p>
                <p>Added to playlist: {playlistTrack.addedToPlaylistTime ? new Date(playlistTrack.addedToPlaylistTime).toLocaleDateString() : 'unknown'}</p>
            </div>
        </div>
    );
}

export default PlaylistTrackCard;