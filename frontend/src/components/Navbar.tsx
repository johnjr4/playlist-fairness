import { NavLink } from "react-router";
import ProfileMenu from "./ProfileMenu";

function Navbar() {

    return (
        <div className="h-16 z-20 px-4 py-1.5 w-full fixed bg-background-800 text-textPrimary flex justify-between items-center shadow-xl">
            <NavLink to='/u' className={({ isActive }) =>
                isActive ? 'underline' : undefined
            }>
                Home Page
            </NavLink>
            <div className="flex items-center gap-4">
                <ProfileMenu />
            </div>
        </div>
    )
}

export default Navbar;