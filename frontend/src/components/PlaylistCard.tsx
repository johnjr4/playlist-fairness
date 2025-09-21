import * as Public from 'spotifair'
import CoverArt from './ui/CoverArt';

function PlaylistCard({ playlist, className }: { playlist: Public.Playlist, className?: string }) {

    return (
        <li className={`p-2 rounded-sm ${className}`}>
            <CoverArt
                coverUrl={playlist.coverUrl}
                alt={`${playlist.name} cover art`}
                size='w-full'
            />
            <p className='h-5 m-1 text-md/tight line-clamp-1 truncate'>{playlist.name}</p>
        </li>
    )
}

export default PlaylistCard;