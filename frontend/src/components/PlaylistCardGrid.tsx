import useQuery from "../utils/api/useQuery";
import hoverClasses from '../styling/hovereffect.module.css';
import cardGridClasses from '../styling/cardGrid.module.css';
import PlaylistCard from "./PlaylistCard";
import * as Public from 'spotifair';


function PlaylistCardGrid({ filterString: searchString = "" }: { filterString?: string }) {
    const { data: playlists, isLoading, error } = useQuery<Public.Playlist[]>('/playlists');

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
        <ul className={`${cardGridClasses['card-grid']}`}>
            {playlists!.filter(p => (filterString(p.name))).map(p =>
                <PlaylistCard
                    key={p.id}
                    playlist={p}
                    className={`w-full bg-background-300/80 ${hoverClasses.hover3D} ${hoverClasses.hoverGlint} ${hoverClasses.transition} ${hoverClasses.hoverRise}`}
                />)}
        </ul>
    )
}

export default PlaylistCardGrid;