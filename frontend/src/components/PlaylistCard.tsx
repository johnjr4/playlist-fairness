import * as Public from 'spotifair'
import CoverArt from './ui/CoverArt';
import { useNavigate } from 'react-router';

interface PlaylistCardProps {
    playlist: Public.Playlist;
    className?: string;
}

function PlaylistCard({ playlist, className }: PlaylistCardProps) {
    const navigate = useNavigate();
    function handleClick() {
        navigate(`/u/${playlist.id}`);
    }
    return (
        <li className={`${className} rounded-sm relative p-3.5`}>
            <button className={`w-full flex flex-col gap-2 rounded-sm cursor-pointer`} onClick={() => handleClick()}>
                <CoverArt
                    coverUrl={playlist.coverUrl}
                    alt={`${playlist.name} cover art`}
                    size='w-full'
                />
                <p className='h-5 text-md/tight line-clamp-1 truncate'>{playlist.name}</p>
            </button>
        </li>
    )
}

export default PlaylistCard;