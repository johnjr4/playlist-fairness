import loadingCoverUrl from '../../assets/covers/loading_cover.svg'
import ErrorImage from "./ErrorImage";
import errorCoverUrl from '../../assets/covers/error_cover.svg'
import { useState } from "react";

interface CoverArtProps {
    coverUrl: string | null,
    className?: string,
    alt?: string,
    size?: string,
}

function CoverArt({ coverUrl, alt = 'Cover Image', size = 'w-48', className }: CoverArtProps) {
    const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>(!coverUrl ? 'error' : 'loading');

    return (
        <div className={`aspect-square ${size} overflow-hidden shadow-md shadow-background-400 ${className}`}>
            {status === 'loading' && <img src={loadingCoverUrl} alt={alt} className="w-full h-full" />}
            {status !== 'error'
                ? <img
                    src={coverUrl!} // Can assert because of initial status state
                    alt={alt}
                    className="w-full h-full object-cover"
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
                : <img
                    src={errorCoverUrl} // Can assert because of initial status state
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            }
        </div>
    )
}

function ErrorCover() {
    return <ErrorImage iconSize="text-4xl md:text-5xl lg:text-7xl" className="w-full h-full bg-background-500" />
}

export default CoverArt;

