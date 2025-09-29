import { NavLink, type To } from "react-router";
import hoverClasses from '../../styling/hovereffect.module.css'

interface NavbarLinkProps {
    children: React.ReactNode,
    to: To,
}

const activeLinkStyle = 'underline';

function NavbarLink({ children, to }: NavbarLinkProps) {
    return (
        <NavLink to={to} className={({ isActive }) =>
            `
                ${isActive ? activeLinkStyle : undefined}
                px-3 py-2 rounded-md
                ${hoverClasses.hover3D} ${hoverClasses.transition}
            `

        }>
            {children}
        </NavLink>
    );
}

export default NavbarLink;