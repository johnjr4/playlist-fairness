import { NavLink, Outlet } from "react-router";
import { useTheme } from "../utils/ThemeContext";
import Button from "../components/ui/Button";
import { AiFillMoon, AiFillSun } from "react-icons/ai";
import { backendAuthAxios, backendAxios } from "../utils/axiosInstances";
import { useAuth } from "../utils/AuthContext";

function MainLayout() {
    const { isDarkMode, setIsDarkMode } = useTheme();
    const { setUser } = useAuth();

    async function handleLogout() {
        await backendAuthAxios.post('/logout');
        setUser(null);
    }

    return (
        <div className={`${isDarkMode ? 'dark' : null} min-h-screen flex flex-col bg-bgCol text-textPrimary`}>
            <header className="h-14 z-20 px-4 py-1.5 w-full fixed bg-primary text-textSecondary flex justify-between items-center">
                <NavLink to='/u' className={({ isActive }) =>
                    isActive ? 'underline' : undefined
                }>
                    Home Page
                </NavLink>
                <div className="flex items-center gap-4">
                    <button className="h-10" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? <AiFillSun size={25} /> : <AiFillMoon size={25} />}
                    </button>
                    <Button variant="secondaryInvert" onClick={() => handleLogout()}>
                        Logout goes here
                    </Button>
                </div>
            </header>
            <main className={`mt-14 flex-grow`}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;