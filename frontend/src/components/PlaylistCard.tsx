import * as Public from 'spotifair'
import CoverArt from './ui/CoverArt';
import { useNavigate } from 'react-router';
import { FaSyncAlt } from 'react-icons/fa';

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
            <button className={`w-full flex flex-col items-center gap-2 rounded-sm cursor-pointer`} onClick={() => handleClick()}>
                <CoverArt
                    coverUrl={playlist.coverUrl}
                    alt={`${playlist.name} cover art`}
                    size='w-full'
                />
                <p className='md:h-5 w-[80%] text-xs/tight sm:text-sm/tight md:text-base/tight line-clamp-1 truncate'>{playlist.name}</p>
                <FaSyncAlt
                    color={playlist.syncEnabled ? 'var(--color-textPrimary)' : 'var(--color-background-100)'}
                    // text size controls the SVG size (apparently)
                    className='absolute bottom-2.5 right-2 md:bottom-3 md:right-3 text-[8.5px] md:text-[11px] lg:text-[13px]'
                />
            </button>
        </li>
    )
}

export default PlaylistCard;