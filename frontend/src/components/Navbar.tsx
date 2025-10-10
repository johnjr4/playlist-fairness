import ProfileMenu from "./ProfileMenu";
import gradientClasses from '../styling/gradient.module.css';
import navbarClasses from '../styling/navbarBased.module.css';
import NavbarLink from "./ui/NavbarLink";

function Navbar() {

    return (
        <nav className={`fixed top-0 w-dvw flex justify-between items-center shadow-md
            ${navbarClasses['navbar']}
            z-20
            pl-1 md:pl-2
            py-1 md:py-1.5
            pr-1 md:pr-5
            text-xs sm:text-sm md:text-base
            ${gradientClasses.navGradient} text-textPrimary`}
        >
            <div>
                <NavbarLink to='/u/playlists'>
                    Home Page
                </NavbarLink>
            </div>
            <div className="h-full flex items-center gap-4">
                <ProfileMenu />
            </div>
        </nav>
    )
}

export default Navbar;