import * as Public from 'spotifair';
import useQuery from "../utils/api/useQuery";

function HomePage() {
    const { data: fetchedPlaylists, isLoading, error } = useQuery('/playlists');
    const playlists = fetchedPlaylists as Public.Playlist[] | null;
    console.log("Rendering home page");
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error getting playlists</div>
    return (
        <>
            <p>Home page</p>
            <ul className="grid grid-cols-6">
                {playlists!.map(p => <li key={p.id}>
                    <img src={p.coverUrl ?? ""} className="h-40" />
                    <p>{p.name}</p>
                </li>)}
            </ul>
        </>
    )
}

export default HomePage;