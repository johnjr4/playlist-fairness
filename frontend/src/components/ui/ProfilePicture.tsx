import defaultPfp from '../../assets/default_pfp.svg'
import { useProtectedAuth } from '../../utils/AuthContext';

interface ProfilePictureProps {
    pictureUrl?: string | null,
    className?: string,
    alt?: string,
    size?: string,
}

function ProfilePicture({ pictureUrl = null, alt = 'Cover Image', size = 'w-11', className }: ProfilePictureProps) {
    let usedUrl = pictureUrl;
    // pictureUrl is override, will use user's image by default
    if (!pictureUrl) {
        const { user } = useProtectedAuth();
        if (user.imageUrl) {
            usedUrl = user.imageUrl;
        } else {
            usedUrl = defaultPfp;
        }
    }


    return (
        <div className={`aspect-square ${size} overflow-hidden shadow-sm shadow-gray-800 ${className} rounded-full`}>
            <img
                src={usedUrl!}
                alt={alt}
                className="w-full h-full object-cover"
            />
        </div>
    )
}

export default ProfilePicture;

