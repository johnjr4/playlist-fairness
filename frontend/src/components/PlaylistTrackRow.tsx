import * as Public from 'spotifair';
import CoverArt from './ui/CoverArt';
import classes from '../styling/playlistTrackRow.module.css'

interface PlaylistTrackRowProps {
    playlistTrack: Public.PlaylistTrackHist;
    className?: string;
    fillPercent: number;
}

function PlaylistTrackRow({ playlistTrack, className, fillPercent }: PlaylistTrackRowProps) {
    const track = playlistTrack.track;
    if (fillPercent > 100 || fillPercent < 0) {
        console.error(`PlaylistTrack ${track.name} received fillPercent out of range`);
    }
    const cappedPercent = Math.max(0, Math.min(fillPercent, 100));
    return (
        <li className={`w-full ${className} relative border-2`}>
            {/* Background */}
            <div
                className="absolute top-0 left-0 h-full bg-blue-600 opacity-60"
                style={{ width: `${cappedPercent}%` }}
            />
            {/* Main content */}
            <div className={`relative z-10 h-full px-2 py-1 ${classes.playlistTrackRow} items-center`}>
                <CoverArt coverUrl={track.album.coverUrl} size="w-20" />
                <div>{track.name}</div>
                <div>{track.artist.name}</div>
                <div>{track.album.name}</div>
                <div className='text-right'>{playlistTrack.listeningEvents.length}</div>
            </div>
        </li>
    )
}

export default PlaylistTrackRow