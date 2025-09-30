import useQuery from "../utils/api/useQuery";
import hoverClasses from '../styling/hovereffect.module.css';
import PlaylistCard from "./PlaylistCard";
import * as Public from 'spotifair';


function PlaylistCardGrid({ filterString: searchString = "" }: { filterString?: string }) {
    const { data: fetchedPlaylists, isLoading, error } = useQuery('/playlists');
    const playlists = fetchedPlaylists as Public.Playlist[] | null;

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error getting playlists</div>

    const lowercaseSearchString = searchString ? searchString.toLowerCase() : null;
    function filterString(name: string) {
        if (lowercaseSearchString && lowercaseSearchString.length > 0) {
            return name.toLowerCase().includes(lowercaseSearchString);
        }
        // Search string is empty/null, just return true
        return true;
    }

    // Sort by if sync is enabled
    playlists!.sort((a, b) => {
        return (a.syncEnabled === b.syncEnabled) ? 0 : (a.syncEnabled ? -1 : 1);
    });

    return (
        <ul className="
                grid
                grid-cols-[repeat(auto-fill,theme(width.32))] 
                sm:grid-cols-[repeat(auto-fill,theme(width.44))] 
                md:grid-cols-[repeat(auto-fill,theme(width.52))] 
                lg:grid-cols-[repeat(auto-fill,theme(width.64))] 
                gap-4
                justify-center 
                w-full
                px-5
                md:px-20
                max-w-[1920px]
                relative
                z-10
            ">
            {playlists!.filter(p => (filterString(p.name))).map(p => <PlaylistCard
                key={p.id}
                playlist={p}
                className={`w-32 sm:w-44 md:w-52 lg:w-64 bg-background-300 ${hoverClasses.transition} ${hoverClasses.hover3D} ${hoverClasses.hoverRise}`}
            />)}
        </ul>
    )
}

export default PlaylistCardGrid;