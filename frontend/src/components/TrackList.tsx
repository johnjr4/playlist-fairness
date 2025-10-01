import PlaylistTrackRow from "../components/PlaylistTrackRow";
import playlistTrackRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';

interface TrackListProps {
    playlist: Public.PlaylistHist
}

function TrackList({ playlist }: TrackListProps) {
    const maxCount = playlist.tracks.reduce((accumulator, currentValue) => {
        return Math.max(accumulator, currentValue.listeningEvents.length);
    }, 0);

    return (
        <div>
            <div className={`${playlistTrackRowClasses.playlistTrackRow} font-bold w-full px-2`}>
                <div></div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className='text-right'>Plays</div>
            </div>
            <ul className="flex flex-col w-full gap-2">
                {playlist.tracks.map(t => <PlaylistTrackRow
                    playlistTrack={t}
                    key={t.track.id}
                    fillPercent={maxCount > 0 ? (t.listeningEvents.length / maxCount) * 100 : 0} />)}
            </ul>
        </div>
    )
}

export default TrackList;