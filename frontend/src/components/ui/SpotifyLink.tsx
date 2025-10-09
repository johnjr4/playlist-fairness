import { toSpotifyLink } from "../../utils/spotifyLink";

interface SpotifyLinkProps {
    text: string;
    uri: string;
    type: 'playlist' | 'track';
    underlined?: boolean;
    className?: string;
}

function SpotifyLink({ text, uri, type, underlined = false, className }: SpotifyLinkProps) {
    return <a href={toSpotifyLink(uri, type)} target='_blank' className={`hover:brightness-80 ${underlined ? 'underline' : undefined} ${className}`}>{text}</a>
}

export default SpotifyLink;