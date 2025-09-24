import * as Public from 'spotifair'
import CoverArt from './ui/CoverArt';
import { useNavigate } from 'react-router';

function PlaylistCard({ playlist, className }: { playlist: Public.Playlist, className?: string }) {
    const navigate = useNavigate();
    function handleClick() {
        navigate(`/u/${playlist.id}`);
    }
    return (
        <li>
            <button className={`p-3 rounded-sm ${className}`} onClick={() => handleClick()}>
                <CoverArt
                    coverUrl={playlist.coverUrl}
                    alt={`${playlist.name} cover art`}
                    size='w-full'
                />
                <p className='h-5 m-1 text-md/tight line-clamp-1 truncate'>{playlist.name}</p>
            </button>
        </li>
    )
}

export default PlaylistCard;