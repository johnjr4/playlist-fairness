import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import gradientClasses from '../styling/gradient.module.css'
import { useLayoutEffect, useRef, useState } from "react";

function MainLayout() {
    const navbarRef = useRef<HTMLElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);

    // Like useEffect, but runs before browser painting
    useLayoutEffect(() => {
        function updateNavbarHeight() {
            if (navbarRef.current) {
                setNavbarHeight(navbarRef.current.clientHeight);
            }
        }

        updateNavbarHeight(); // initial measurement

        window.addEventListener('resize', updateNavbarHeight);
        return () => window.removeEventListener('resize', updateNavbarHeight);
    }, []);



    return (
        <div className={`min-h-screen flex flex-col text-textPrimary`}>
            <header className="relative">
                <Navbar ref={navbarRef} />
            </header>
            <main
                className={`flex-grow ${gradientClasses.bgGradient}`}
                style={{ marginTop: navbarHeight }}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;