import { NavLink } from "react-router";
import ProfileMenu from "./ProfileMenu";
import gradientClasses from '../styling/gradient.module.css';

function Navbar() {

    return (
        <div className={`h-16 z-20 lg:px-4 py-1.5 w-full fixed top-0 ${gradientClasses.navGradient} text-textPrimary flex justify-between items-center shadow-md`}>
            <NavLink to='/u' className={({ isActive }) =>
                isActive ? 'underline' : undefined
            }>
                Home Page
            </NavLink>
            <div className="flex items-center gap-4 bg-inherit">
                <ProfileMenu />
            </div>
        </div>
    )
}

export default Navbar;