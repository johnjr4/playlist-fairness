import { Link } from "react-router";
import ProfileStat from "./ProfileStat";
import useQuery from "../../utils/api/useQuery";
import type * as Public from 'spotifair';
import { msToMin, msToMore } from "../../utils/unitConvert";
import { useProtectedAuth } from "../../utils/AuthContext";
import { toSpotifyLink } from "../../utils/spotifyLink";

function ProfileStats() {
    const { user } = useProtectedAuth();
    const { data: fetchedStats, error, isLoading } = useQuery<Public.UserStats>('/user/stats');

    let content;
    if (isLoading) {
        content = (
            <div className=" text-sm md:text-base lg:text-lg">
                <ProfileStat category="Total playlists" tip='... synced'>
                    ...
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Top playlist" tip='... minutes'>
                    ...
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Total listens" tip='... minutes'>
                    ...
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Top track" tip='... listens'>
                    ...
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Tracking since" tip='... ago'>
                    ...
                </ProfileStat>
            </div>
        );
    } else if (error) {
        content = (
            <>
                <div className="flex flex-col justify-around h-full w-full py-8 md:w-90 lg:w-100 opacity-50">
                    <StatDivider />
                    <StatDivider />
                    <StatDivider />
                    <StatDivider />
                </div>
                <div className="absolute inset-0 flex justify-center items-center font-semibold text-sm md:text-base lg:text-lg">
                    Error fetching profile statistics
                </div>
            </>
        );
    } else {
        const userStats = fetchedStats as Public.UserStats;

        // TODO: Deal with nonexistent top playlist and track
        const topPlaylist = userStats.playlists.top;
        const topTrack = userStats.tracks.top;

        content = (
            <div className=" text-sm md:text-base lg:text-lg">
                <ProfileStat category="Total playlists" tip={`${userStats.playlists.synced.toLocaleString()} synced`}>
                    {userStats.playlists.total.toLocaleString()}
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Top playlist" tip={`${topPlaylist ? msToMin(topPlaylist.listening.totalMs).toLocaleString() : 0} minutes`}>
                    {
                        topPlaylist
                            ? <Link to={`/u/playlists/${topPlaylist.id}`} className="hover:brightness-70">{topPlaylist.name}</Link>
                            : 'Not found'
                    }
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Total listens" tip={`${msToMin(userStats.listens.totalMs).toLocaleString()} minutes`}>
                    {userStats.listens.plays.toLocaleString()}
                </ProfileStat>
                <StatDivider />
                {/* TODO: Add number of playlists that it's on */}
                <ProfileStat category="Top track" tip={`${topTrack ? topTrack.plays : 0} listens`}>
                    {
                        topTrack
                            ? <a href={toSpotifyLink(topTrack.spotifyUri, 'track')} target='_blank' className="hover:brightness-70">{topTrack.name}</a>
                            : 'Not found'
                    }
                </ProfileStat>
                <StatDivider />
                <ProfileStat category="Tracking since" tip={`${msToMore(new Date().getTime() - new Date(user.trackingStartTime).getTime())} ago`}>
                    {new Date(user.trackingStartTime).toLocaleDateString()}
                </ProfileStat>
            </div>
        );
    }


    return (
        <div className="w-full h-59 sm:h-65 md:h-62 lg:h-72 xl:h-76 relative">
            {content}
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