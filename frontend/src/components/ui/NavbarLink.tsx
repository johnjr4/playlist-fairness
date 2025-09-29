import { NavLink, type To } from "react-router";
import hoverClasses from '../../styling/hovereffect.module.css'
import linkClasses from '../../styling/link.module.css'

interface NavbarLinkProps {
    children: React.ReactNode,
    to: To,
}

const activeLinkStyle = `text-textPrimary ${linkClasses.fakeBold}`;

function NavbarLink({ children, to }: NavbarLinkProps) {
    return (
        <NavLink to={to} end className={({ isActive }) =>
            `
                ${isActive ? activeLinkStyle : undefined}
                px-3 py-2 rounded-md font-semibold
                text-background-50
                ${hoverClasses.hover3D} ${hoverClasses.transition}
            `

        }>
            {children}
        </NavLink>
    );
}

export default NavbarLink;