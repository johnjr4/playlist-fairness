import { Link } from "react-router";
import ProfileStat from "./ProfileStat";
import useQuery from "../../utils/api/useQuery";
import * as Public from 'spotifair';
import { msToMin } from "../../utils/unitConvert";
import { useProtectedAuth } from "../../utils/AuthContext";
import { toSpotifyLink } from "../../utils/spotifyLink";

function ProfileStats() {
    const { data: fetchedStats, error, isLoading } = useQuery('/user/stats');

    // TODO: Loading and error states
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error getting stats...</div>

    const userStats = fetchedStats as Public.UserStats;

    // TODO: Deal with nonexistent top playlist and track
    const topPlaylist = userStats.playlists.top!;
    const topTrack = userStats.tracks.top!;
    return (
        <div className="w-full text-sm md:text-base lg:text-lg">
            <ProfileStat category="Total playlists" tip={`${userStats.playlists.synced.toLocaleString()} synced`}>
                {userStats.playlists.total.toLocaleString()}
            </ProfileStat>
            <StatDivider />
            <ProfileStat category="Top playlist" tip={`${msToMin(topPlaylist.totalMs).toLocaleString()} minutes`}>
                <Link to={`/u/${topPlaylist.id}`} className="hover:brightness-70">{topPlaylist.name}</Link>
            </ProfileStat>
            <StatDivider />
            <ProfileStat category="Total listens" tip={`${msToMin(userStats.listens.totalMs).toLocaleString()} minutes`}>
                {userStats.listens.plays.toLocaleString()}
            </ProfileStat>
            <StatDivider />
            {/* TODO: Add number of playlists that it's on */}
            <ProfileStat category="Top track" tip={`${topTrack.plays} listens`}>
                <a href={toSpotifyLink(topTrack.spotifyUri, 'track')} target='_blank' className="hover:brightness-70">{topTrack.name}</a>
            </ProfileStat>
        </div>
    )
}

function StatDivider() {
    return (
        <hr className="
        text-background-300
        bg-background-200
        h-[2px]
        my-[2px]
        md:h-[3px]
        md:my-0.5
        " />
    );
}

export default ProfileStats;