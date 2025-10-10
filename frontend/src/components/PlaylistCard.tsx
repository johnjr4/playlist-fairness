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
        navigate(`/u/playlists/${playlist.id}`);
    }
    return (
        <li className={`${className} rounded-sm relative p-1.5 min-[790px]:p-2.5 min-[1000px]:p-3 min-[1328px]:p-3.5
            col-start-1 col-end-[-1] sm:col-auto
        `}>
            <button className={`w-full flex sm:flex-col items-center gap-3 sm:gap-2 cursor-pointer`} onClick={() => handleClick()}>
                <CoverArt
                    coverUrl={playlist.coverUrl}
                    alt={`${playlist.name} cover art`}
                    size='w-16 sm:w-full'
                />
                <p className='md:h-5 w-[80%] text-left sm:text-center 
                text-sm/tight sm:text-sm/tight md:text-base/tight line-clamp-1'>{playlist.name}</p>
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