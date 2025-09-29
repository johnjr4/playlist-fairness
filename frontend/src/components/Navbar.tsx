import ProfileMenu from "./ProfileMenu";
import gradientClasses from '../styling/gradient.module.css';
import NavbarLink from "./ui/NavbarLink";

function Navbar({ ref }: { ref: React.Ref<HTMLElement> }) {

    return (
        <nav className={`fixed top-0 w-full flex justify-between items-center shadow-md
            h-10 sm:h-12 md:h-14 lg:h-16
            z-20
            px-1 lg:px-2 py-1.5
            text-xs sm:text-sm md:text-base
            ${gradientClasses.navGradient} text-textPrimary`}
            ref={ref}
        >
            <NavbarLink to='/u/playlists'>
                Home Page
            </NavbarLink>
            <div className="flex items-center gap-4 bg-background-700">
                <ProfileMenu />
            </div>
        </nav>
    )
}

export default Navbar;