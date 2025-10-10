import { useState } from "react";
import Button from "../components/ui/Button";
import ProfilePicture from "../components/ui/ProfilePicture";
import ProfileStats from "../components/ui/ProfileStats";
import { useProtectedAuth } from "../utils/AuthContext";
import Modal from "../components/ui/Modal";
import { backendAuthAxios, backendAxios } from "../utils/axiosInstances";
import * as Public from "spotifair";

function ProfilePage() {
    const { user, setUser } = useProtectedAuth();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleLogout() {
        await backendAuthAxios.post<null>('/logout');
        setUser(null);
    }

    async function handleDelete() {
        setIsDeleting(true);
        const deletedUser = await backendAxios.delete<Public.User>(`/user/${user.id}`);
        console.log("Deleted user");
        console.log(deletedUser);
        setIsDeleting(false);
        setUser(null);
    }

    if (isDeleting) return <div>Deleting user...</div>

    return (
        <div className="flex flex-col mt-4 md:flex-row justify-center gap-2 md:gap-4 lg:gap-6 rounded-lg p-2mt-4 md:mt-6 lg:mt-10 mx-auto w-80 sm:w-[500px] md:w-2xl lg:w-4xl xl:w-[1000px]">
            <div className="min-w-24 md:min-w-40 lg:min-w-52 xl:min-w-60 flex flex-col items-center gap-2">
                <ProfilePicture size='w-24 sm:w-30 md:w-40 lg:w-52 xl:w-60' className="shadow-md lg:shadow-xl shadow-background-600" />
                <div className="text-lg md:text-xl lg:text-2xl font-semibold text-center">{user.displayName}</div>
            </div>
            <div className=" flex flex-col items-end gap-2 my-2 md:mr-15">
                <ProfileStats />
                <div className='flex justify-end gap-2 items-center'>
                    <Button variant='secondary' onClick={() => handleLogout()} useDefaultSizing={true}>
                        Log Out
                    </Button>
                    <Button variant='danger' onClick={() => setIsDeleteModalOpen(true)} useDefaultSizing={true}>
                        Delete Profile
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                message="This will delete all data associated with your profile. Are you sure you'd like to continue?"
                secondaryMessage="Note: this will not delete anything from your Spotify account"
                onConfirm={() => handleDelete()}
            />
        </div>
    );
}

export default ProfilePage;