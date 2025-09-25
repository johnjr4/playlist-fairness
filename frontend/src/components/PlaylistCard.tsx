import * as Public from 'spotifair'
import CoverArt from './ui/CoverArt';
import { useNavigate } from 'react-router';

interface PlaylistCardProps {
    playlist: Public.Playlist;
    className?: string;
    wrapperClassName?: string;
}

function PlaylistCard({ playlist, className, wrapperClassName }: PlaylistCardProps) {
    const navigate = useNavigate();
    function handleClick() {
        navigate(`/u/${playlist.id}`);
    }
    return (
        <li className={`${wrapperClassName} rounded-sm`}>
            <button className={`p-3 rounded-sm ${className} cursor-pointer`} onClick={() => handleClick()}>
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