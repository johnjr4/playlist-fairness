import { NavLink } from "react-router";
import { useTheme } from "../utils/ThemeContext";
import { AiFillMoon, AiFillSun } from "react-icons/ai";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
    const { isDarkMode, setIsDarkMode } = useTheme();

    return (
        <div className="h-16 z-20 px-4 py-1.5 w-full fixed bg-primary text-textSecondary flex justify-between items-center">
            <NavLink to='/u' className={({ isActive }) =>
                isActive ? 'underline' : undefined
            }>
                Home Page
            </NavLink>
            <div className="flex items-center gap-4">
                <button className="h-10" onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? <AiFillSun size={25} /> : <AiFillMoon size={25} />}
                </button>
                <ProfileMenu />
            </div>
        </div>
    )
}

export default Navbar;