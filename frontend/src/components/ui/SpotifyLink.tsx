import { toSpotifyLink } from "../../utils/spotifyLink";

interface SpotifyLinkProps {
    text: string;
    uri: string;
    type: 'playlist' | 'track';
    underlined?: boolean;
}

function SpotifyLink({ text, uri, type, underlined = false }: SpotifyLinkProps) {
    return <a href={toSpotifyLink(uri, type)} target='_blank' className={`hover:brightness-70 ${underlined ? 'underline' : undefined}`}>{text}</a>
}

export default SpotifyLink;