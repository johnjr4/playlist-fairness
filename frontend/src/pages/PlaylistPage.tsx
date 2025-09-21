import { useParams } from "react-router";
import useQuery from "../utils/api/useQuery";
import * as Public from 'spotifair';
import CoverArt from "../components/ui/CoverArt";
import PlaylistTrackRow from "../components/PlaylistTrackRow";
import playlistTrackRowClasses from '../styling/playlistTrackRow.module.css'

function PlaylistPage() {
    const { playlistId } = useParams<{ playlistId: string }>();
    const { data, isLoading, error } = useQuery(`/playlists/${playlistId}/tracks/hist`);

    if (isLoading) return <div>It's the loading page...</div>
    if (error) return <div>Error!</div>

    const playlistData = data as Public.PlaylistHist;
    const maxCount = playlistData.tracks.reduce((accumulator, currentValue) => {
        return Math.max(accumulator, currentValue.listeningEvents.length);
    }, 0);

    return (
        <div className='flex flex-col items-center'>
            <div className='flex gap-4 items-center justify-center'>
                <CoverArt coverUrl={playlistData.coverUrl} size='w-32' />
                <h1>{playlistData.name}</h1>
            </div>
            <div className='my-4'>
                <h1 className='font-bold text-4xl'>Your playlist is <span className='text-green-600'>mostly fair</span></h1>
            </div>
            <div className={`${playlistTrackRowClasses.playlistTrackRow} font-bold w-full px-2`}>
                <div></div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className='text-right'>Plays</div>
            </div>
            <ul className="flex flex-col w-full gap-2">
                {playlistData.tracks.map(t => <PlaylistTrackRow
                    playlistTrack={t}
                    key={t.track.id}
                    fillPercent={maxCount > 0 ? (t.listeningEvents.length / maxCount) * 100 : 0} />)}
            </ul>
        </div>
    );
}

export default PlaylistPage;