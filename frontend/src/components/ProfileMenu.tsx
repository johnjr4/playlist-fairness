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
        <Dropdown
            items={dropdownItems}
            hasCaret={false}
            color='bg-inherit'
            hoverColor="red"
            outerClassName="bg-background-700 h-full"
            buttonClassName="min-h-5 h-full bg-amber-300 gap-2 text-sm"
        >
            <div>{user.displayName}</div>
            <ProfilePicture size="h-full" className="outline-2 outline-gray-700" />
        </Dropdown>
    )
}

export default ProfileMenu;