import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import gradientClasses from '../styling/gradient.module.css'
import navbarClasses from '../styling/navbarBased.module.css';

function MainLayout() {
    return (
        <div className={`min-h-dvh h-full flex flex-col text-textPrimary`}>
            <header className="relative">
                <Navbar />
            </header>
            <main
                className={`flex-grow ${gradientClasses.bgGradient} ${navbarClasses['content-margin']}`}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;