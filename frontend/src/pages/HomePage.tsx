import * as Public from 'spotifair';
import useQuery from "../utils/api/useQuery";
import PlaylistCard from '../components/PlaylistCard';

function HomePage() {
    const { data: fetchedPlaylists, isLoading, error } = useQuery('/playlists');
    const playlists = fetchedPlaylists as Public.Playlist[] | null;
    console.log("Rendering home page");
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error getting playlists</div>
    return (
        <div className='flex flex-col content-center items-center w-full px-4'>
            <h1 className="mt-4 text-3xl font-bold">Your playlists</h1>
            <div className='px-4 py-2 m-4 bg-red-300 lg:w-2xl'>Search bar goes here!</div>
            <ul className="
                grid
                grid-cols-[repeat(auto-fill,theme(width.52))]
                gap-4
                justify-center 
                w-full
                max-w-[1920px]
            ">
                {playlists!.map(p => <PlaylistCard
                    key={p.id}
                    playlist={p}
                    className='w-52 bg-bgHighlight'
                />)}
            </ul>
        </div>
    )
}

export default HomePage;