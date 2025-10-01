import PlaylistTrackRow from "../components/PlaylistTrackRow";
import playlistTrackRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';

interface TrackListProps {
    playlist: Public.PlaylistHist
    searchString?: string,
}

function TrackList({ playlist, searchString }: TrackListProps) {
    const maxCount = playlist.tracks.reduce((accumulator, currentValue) => {
        return Math.max(accumulator, currentValue.listeningEvents.length);
    }, 0);

    const lowercaseSearchString = searchString ? searchString.toLowerCase() : null;
    function filterTrack(track: Public.TrackWithMeta) {
        if (lowercaseSearchString && lowercaseSearchString.length > 0) {
            return track.name.toLowerCase().includes(lowercaseSearchString)
                || track.album.name.toLowerCase().includes(lowercaseSearchString)
                || track.artist.name.toLowerCase().includes(lowercaseSearchString);
        }
        // Search string is empty/null, just return true
        return true;
    }


    return (
        <div className="w-full">
            <div className={`${playlistTrackRowClasses.playlistTrackRow} font-bold w-full px-2`}>
                <div></div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className='text-right'>Plays</div>
            </div>
            <ul className="flex flex-col w-full gap-2">
                {playlist.tracks.filter(t => filterTrack(t.track)).map(t => <PlaylistTrackRow
                    playlistTrack={t}
                    key={t.track.id}
                    fillPercent={maxCount > 0 ? (t.listeningEvents.length / maxCount) * 100 : 0} />)}
            </ul>
        </div>
    )
}

export default TrackList;