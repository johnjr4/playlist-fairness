import { Outlet } from "react-router";

function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <header>My Main Header</header>
            <main className="flex-grow">
                <Outlet/>
            </main>
        </div>
    )
}

export default MainLayout;