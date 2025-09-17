import { Outlet } from "react-router";

function AuthLayout() {
    return (
        <div>
            <header>My Auth Header</header>
            <main>
                <Outlet/>
            </main>
        </div>
    )
}

export default AuthLayout;