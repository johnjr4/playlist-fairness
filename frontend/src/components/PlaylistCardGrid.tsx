import useQuery from "../utils/api/useQuery";
import hoverClasses from '../styling/hovereffect.module.css';
import PlaylistCard from "./PlaylistCard";
import * as Public from 'spotifair';


function PlaylistCardGrid({ filterString = "" }: { filterString?: string }) {
    const { data: fetchedPlaylists, isLoading, error } = useQuery('/playlists');
    const playlists = fetchedPlaylists as Public.Playlist[] | null;

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error getting playlists</div>


    let filterCondition = (name: string) => { return true; }
    if (filterString) {
        const lowercaseFilterString = filterString.toLowerCase();
        filterCondition = (name: string) => {
            return lowercaseFilterString.length > 0 && name.toLowerCase().includes(lowercaseFilterString);
        }
    }

    return (
        <ul className="
                grid
                grid-cols-[repeat(auto-fill,theme(width.32))] 
                sm:grid-cols-[repeat(auto-fill,theme(width.44))] 
                md:grid-cols-[repeat(auto-fill,theme(width.52))] 
                lg:grid-cols-[repeat(auto-fill,theme(width.60))] 
                gap-4
                justify-center 
                w-full
                px-5
                md:px-20
                max-w-[1920px]
            ">
            {playlists!.filter(p => (filterCondition(p.name))).map(p => <PlaylistCard
                key={p.id}
                playlist={p}
                className={`w-32 sm:w-44 md:w-52 lg:w-60  bg-background-400 ${hoverClasses.hover3D}`}
            />)}
        </ul>
    )
}

export default PlaylistCardGrid;