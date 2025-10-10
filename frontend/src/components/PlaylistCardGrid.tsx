import useQuery from "../utils/api/useQuery";
import hoverClasses from '../styling/hovereffect.module.css';
import cardGridClasses from '../styling/cardGrid.module.css';
import PlaylistCard from "./PlaylistCard";
import * as Public from 'spotifair';
import SpotifyLink from "./ui/SpotifyLink";
import { useProtectedAuth } from "../utils/AuthContext";
import { handleLogin } from "../utils/handleLogin";
import Button from "./ui/Button";
import { useMemo } from "react";

function getPlaceholderContent(isLoading: boolean, error: string | null, numPlaylistsUnfiltered: number | null, filteredPlaylists: Public.Playlist[] | null, user: Public.User) {
    let centeredContent: React.ReactNode;
    if (isLoading) {
        centeredContent = (
            <></>
        )
    } else if (error) {
        centeredContent = (
            <>
                Sorry, something went wrong. Try re-authenticating below
                <Button useDefaultSizing={true} onClick={() => handleLogin()} >Login</Button>
            </>
        )
    } else if (numPlaylistsUnfiltered! < 1) { // Not loading or error means other arguments non-null
        centeredContent = (
            <>
                <p>Looks like you don't have any playlists. Try creating some <SpotifyLink type='user' uri={user.spotifyUri} text="on Spotify!" underlined={true} /></p>
            </>
        )
    } else if (filteredPlaylists!.length < 1) {
        centeredContent = (
            <>
                No results
            </>
        )
    } else {
        return null;
    }
    return (
        <div className="w-full h-full flex justify-center items-center text-center px-6 py-2 text-base md:text-lg">
            {centeredContent}
        </div>
    )
}

function PlaylistCardGrid({ filterString: searchString = "" }: { filterString?: string }) {
    const { user } = useProtectedAuth();
    const { data: playlists, isLoading, error } = useQuery<Public.Playlist[]>('/playlists');

    const numPlaylistsUnfiltered = playlists?.length ?? null;

    const filteredPlaylists = useMemo(() => {
        if (!playlists) return null;
        const lowercaseSearchString = searchString ? searchString.toLowerCase() : null;
        function filterString(name: string) {
            if (lowercaseSearchString && lowercaseSearchString.length > 0) {
                return name.toLowerCase().includes(lowercaseSearchString);
            }
            // Search string is empty/null, just return true
            return true;
        }

        return playlists.filter(p => (filterString(p.name)));
    }, [playlists, searchString]);

    const sortedPlaylists = useMemo(() => {
        if (!filteredPlaylists) return null;
        // Sort syncEnabled playlists to front
        return filteredPlaylists.sort((a, b) => (a.syncEnabled === b.syncEnabled) ? 0 : (a.syncEnabled ? -1 : 1));
    }, [filteredPlaylists]);

    const placeholderContent = getPlaceholderContent(isLoading, error, numPlaylistsUnfiltered, filteredPlaylists, user);

    if (placeholderContent) {
        return placeholderContent;
    }

    return (
        <ul className={`${cardGridClasses['card-grid']}`}>
            {sortedPlaylists!.map(p =>
                <PlaylistCard
                    key={p.id}
                    playlist={p}
                    className={`w-full bg-background-300/80 ${hoverClasses.hover3D} ${hoverClasses.hoverGlint} ${hoverClasses.transition} ${hoverClasses.hoverRise}`}
                />)}
        </ul>
    )
}

export default PlaylistCardGrid;