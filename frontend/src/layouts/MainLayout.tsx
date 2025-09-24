import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

function MainLayout() {

    return (
        <div className={`min-h-screen flex flex-col bg-background text-textPrimary`}>
            <header>
                <Navbar />
            </header>
            <main className={`mt-16 flex-grow`}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;