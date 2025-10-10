import * as Public from 'spotifair';
import CoverArt from './ui/CoverArt';
import cardClasses from '../styling/cards.module.css';
import AutoResizeText from './ui/AutoResizeText';
import { FaCompactDisc } from 'react-icons/fa';
import { PiMicrophoneStageFill } from 'react-icons/pi';
import type { AnalysisStats } from '../utils/types/playlistPage';
import { roundToDecimals } from '../utils/numberUtils';
import SpotifyLink from './ui/SpotifyLink';

function getPlayDifference(stats: AnalysisStats, numPlays: number) {
    if (stats.totalPlays <= 0) return undefined;
    return <>({roundToDecimals(Math.abs(stats.avgPlays - numPlays), 2)} {stats.avgPlays > numPlays ? 'less' : 'more'} than avg)</>;
}

function PlaylistTrackCard({ playlistTrack, stats, className }: { playlistTrack: Public.PlaylistTrackHist | null, stats: AnalysisStats, className?: string }) {
    let cardContent;
    let statsContent;
    if (playlistTrack) {
        const numPlays = playlistTrack.listeningEvents.length;
        cardContent = (<>
            <CoverArt coverUrl={playlistTrack.track.album.coverUrl} size='max-w-60' />
            <div>
                <div className='flex gap-1 items-base'>
                    {/* <p className='font-mono text-dark-highlight text-sm h-6 flex items-center'>{playlistTrack.playlistPosition + 1}</p> */}
                    <AutoResizeText
                        maxFontSize={20}
                        minFontSize={16}
                        textStyle='line-clamp-4'
                        text={playlistTrack.track.name}
                        containerStyle='min-h-6.5'
                    />
                </div>
                <div className='flex flex-col justify-between text-xs'>
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
        </>);

        statsContent = (<>
            <p>{numPlays.toLocaleString()} play{numPlays === 1 ? '' : 's'}<span className='text-dark-highlight'> {getPlayDifference(stats, numPlays)}</span></p>
            <p>On playlist since {playlistTrack.addedToPlaylistTime ? new Date(playlistTrack.addedToPlaylistTime).toLocaleDateString() : 'unknown'}</p>
            {/* <p>Position {playlistTrack.playlistPosition + 1} on playlist</p> */}
            <SpotifyLink text='Open on Spotify' type='track' uri={playlistTrack.track.spotifyUri} underlined={true} className='text-dark-highlight' />
        </>)
    } else {
        cardContent = (
            <div className='h-20 w-full flex justify-center items-center text-dark-highlight'>
                Select a track to see more
            </div>
        );
        statsContent = <></>
    }


    return (
        <div className={`flex mt-1 flex-col gap-2 ${className} transition-all`}>
            <div className={`flex md:flex-col ${cardClasses['glass-card']} rounded-xs p-2 gap-1`}>
                {cardContent}
            </div>
            <div className='flex md:flex-col justify-between text-xs lg:text-sm'>
                {statsContent}
            </div>
        </div>
    );
}

export default PlaylistTrackCard;