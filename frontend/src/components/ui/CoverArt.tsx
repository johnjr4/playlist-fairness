import { useQueryGeneric } from "../../utils/api/useQuery";
import loadingCoverUrl from '../../assets/covers/loading_cover.png'
import errorCoverUrl from '../../assets/covers/error_cover.png'

interface CoverArtProps {
    coverUrl: string | null,
    className?: string,
    alt?: string,
    size?: string,
}

function CoverArt({ coverUrl, alt = 'Cover Image', size = 'w-48', className }: CoverArtProps) {
    let usedUrl = loadingCoverUrl;
    if (!coverUrl) {
        usedUrl = errorCoverUrl;
    } else {
        const { error, isLoading } = useQueryGeneric(coverUrl);
        usedUrl = isLoading ? loadingCoverUrl : (!error ? coverUrl! : errorCoverUrl);
    }


    return (
        <div className={`aspect-square ${size} overflow-hidden shadow-md ${className}`}>
            <img
                src={usedUrl}
                alt={alt}
                className="w-full h-full object-cover"
            />
        </div>
    )
}

export default CoverArt;

