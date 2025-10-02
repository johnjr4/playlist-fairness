import { useNavigate } from "react-router";
import { useProtectedAuth } from "../utils/AuthContext";
import { backendAuthAxios } from "../utils/axiosInstances";
import Dropdown, { type DropdownItem } from "./ui/Dropdown";
import ProfilePicture from "./ui/ProfilePicture";

function ProfileMenu() {
    const { user, setUser } = useProtectedAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await backendAuthAxios.post<null>('/logout');
        setUser(null);
    }

    const dropdownItems: DropdownItem[] = [
        { label: 'Profile', onClick: () => navigate('/u/profile') },
        { label: 'Logout', onClick: handleLogout },
    ]

    return (
        <Dropdown items={dropdownItems} hasCaret={false} color='bg-inherit' hoverColor="red">
            <div>{user.displayName}</div>
            <ProfilePicture size="w-6 md:w-10" className="outline-2 outline-gray-700" />
        </Dropdown>
    )
}

export default ProfileMenu;