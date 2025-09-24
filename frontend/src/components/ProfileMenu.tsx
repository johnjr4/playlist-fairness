import { useProtectedAuth } from "../utils/AuthContext";
import { backendAuthAxios } from "../utils/axiosInstances";
import Dropdown, { type DropdownItem } from "./ui/Dropdown";
import ProfilePicture from "./ui/ProfilePicture";

function ProfileMenu() {
    const { user, setUser } = useProtectedAuth();

    async function handleLogout() {
        await backendAuthAxios.post('/logout');
        setUser(null);
    }

    const dropdownItems: DropdownItem[] = [
        { label: 'Logout', onClick: handleLogout }
    ]

    return (
        <Dropdown items={dropdownItems} hasCaret={false} color='bg-inherit' hoverColor="red">
            <div>{user.displayName}</div>
            <ProfilePicture />
        </Dropdown>
    )
}

export default ProfileMenu;