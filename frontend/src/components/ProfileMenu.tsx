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
            hoverColor="red"
            outerClassName="h-full"
            buttonClassName="min-h-5 h-full gap-2 text-xs md:text-sm py-0.5 md:py-1.5 px-2 md:px-3"
            optionListClassName="bg-background-700"
        >
            <div>{user.displayName}</div>
            <ProfilePicture size="h-full" className="outline-2 outline-gray-700" />
        </Dropdown>
    )
}

export default ProfileMenu;