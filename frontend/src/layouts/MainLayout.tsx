import { Outlet } from "react-router";
import { useTheme } from "../utils/ThemeContext";
import Navbar from "../components/Navbar";

function MainLayout() {
    const { isDarkMode } = useTheme();

    return (
        <div className={`${isDarkMode ? 'dark' : null} min-h-screen flex flex-col bg-bgCol text-textPrimary`}>
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