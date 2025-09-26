import { Link } from "react-router";
import ProfileStat from "./ProfileStat";

function ProfileStats() {
    return (
        <div className="w-full text-sm md:text-base lg:text-lg">
            <ProfileStat category="Total playlists" tip="3 synced">
                20
            </ProfileStat>
            <StatDivider />
            <ProfileStat category="Top playlist" tip="2,503 minutes">
                <Link to='/u/1'>First Playlist and an Even Longer Name</Link>
            </ProfileStat>
            <StatDivider />
            <ProfileStat category="Total listens" tip="45,305 minutes">
                10,082
            </ProfileStat>
            <StatDivider />
            <ProfileStat category="Top track" tip="203 listens across 5 playlists">
                Lake Mungo and the Spiders from Mars that went to the Trolly altogether
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