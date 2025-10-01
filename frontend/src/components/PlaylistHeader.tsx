import Button from "./ui/Button";
import CoverArt from "./ui/CoverArt";
import * as Public from 'spotifair';

interface PlaylistHeaderProps {
    playlist: Public.PlaylistHist;
    handleSyncClick: (setSyncTo: boolean) => void;
}

function PlaylistHeader({ playlist, handleSyncClick }: PlaylistHeaderProps) {
    return (
        <div className='flex gap-4 items-center justify-center'>
            <CoverArt coverUrl={playlist.coverUrl} size='w-32' />
            <h1>{playlist.name}</h1>
            <p>{playlist.tracks.length} Tracks</p>
            <Button variant='danger' onClick={() => handleSyncClick(false)}>Disable Sync</Button>
        </div>
    )
}

export default PlaylistHeader;