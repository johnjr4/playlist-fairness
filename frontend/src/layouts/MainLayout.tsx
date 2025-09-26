import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import gradientClasses from '../styling/gradient.module.css'

function MainLayout() {

    return (
        <div className={`min-h-screen flex flex-col text-textPrimary`}>
            <header>
                <Navbar />
            </header>
            <main className={`relative mt-16 flex-grow ${gradientClasses.bgGradient}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;