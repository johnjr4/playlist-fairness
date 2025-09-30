import { Outlet } from "react-router";
import gradientClasses from '../styling/gradient.module.css';

function AuthLayout() {
    return (
        <div className="text-textPrimary h-full">
            {/* <header>My Auth Header</header> */}
            <main className={`${gradientClasses.bgGradient} w-full h-full flex flex-col justify-center items-center`}>
                <Outlet />
            </main>
        </div>
    )
}

export default AuthLayout;