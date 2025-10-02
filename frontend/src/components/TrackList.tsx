import PlaylistTrackRow from "../components/PlaylistTrackRow";
import playlistTrackRowClasses from '../styling/playlistTrackRow.module.css'
import * as Public from 'spotifair';
import Button from "./ui/Button";
import { ScaleLoader } from "react-spinners";
import loadingClasses from '../styling/loading.module.css';
import SearchBar from "./SearchBar";
import { useState } from "react";

interface TrackListProps {
    playlist: Public.PlaylistHist;
    setPlaylistSync: (setSyncTo: boolean) => void;
    isSyncing: boolean;
}

function TrackList({ playlist, setPlaylistSync, isSyncing }: TrackListProps) {
    const [searchString, setSearchString] = useState('');

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


    let mainContent;
    if (isSyncing) {
        mainContent = (
            <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
                <p className="text-base lg:text-lg">Syncing playlist</p>
                <div className="p-2 text-center flex justify-center">
                    <ScaleLoader color="var(--color-textPrimary)" height={12} barCount={10} radius={5} speedMultiplier={1.2} />
                </div>
                <p className={`text-sm lg:text-base ${loadingClasses['fade-in']}`}>
                    This may take a while
                </p>
            </div>
        )
    } else if (!playlist.syncEnabled) {
        mainContent = (
            <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
                <div>Sync not enabled for this playlist</div>
                <Button onClick={() => setPlaylistSync(true)}>Enable it</Button>
            </div>
        )
    } else {
        mainContent = (
            <>
                <SearchBar setSearchString={setSearchString} />
                <div className="flex flex-col gap-2">
                    <div className={`${playlistTrackRowClasses.playlistTrackRow} font-bold w-full px-2 py-1`}>
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
            </>
        )
    }

    return (
        <div className="w-full flex flex-col items-center gap-2 mt-6">
            {mainContent}
        </div>
    )
}

export default TrackList;