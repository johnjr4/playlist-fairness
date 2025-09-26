import Button from "../components/ui/Button";
import ProfilePicture from "../components/ui/ProfilePicture";
import ProfileStats from "../components/ui/ProfileStats";
import { useProtectedAuth } from "../utils/AuthContext";

function ProfilePage() {
    const { user } = useProtectedAuth();

    return (
        <div className="flex flex-col mt-4 md:flex-row gap-2 md:gap-4 lg:gap-6 rounded-lg p-2mt-4 md:mt-6 lg:mt-10 mx-auto w-80 sm:w-[500px] md:w-2xl lg:w-4xl xl:w-[1000px]">
            <div className="min-w-24 md:min-w-40 lg:min-w-52 xl:min-w-60 flex flex-col items-center gap-2">
                <ProfilePicture size='w-24 sm:w-30 md:w-full' className="shadow-md lg:shadow-xl shadow-background-600" />
                <div className="text-lg md:text-xl lg:text-2xl font-semibold text-center">{'Tim Allen'}</div>
            </div>
            <div className=" flex flex-col items-end gap-2 my-2">
                <ProfileStats />
                <div className='flex justify-end gap-2 items-center'>
                    <Button variant='secondary'>
                        Log Out
                    </Button>
                    <Button variant='danger' >
                        Delete Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;