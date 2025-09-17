import { useParams } from "react-router";

function PlaylistPage() {
    const { spotifyUri } = useParams<{ spotifyUri: string }>();
    // TODO: Make sure it's a valid URI when you get the id
    return <div>It's the playlsit page - {spotifyUri}</div>
}

export default PlaylistPage;