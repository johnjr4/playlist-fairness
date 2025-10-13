import { useNavigate } from "react-router";
import { useAuth } from "../utils/AuthContext";
import { useEffect, type ReactElement } from "react";
import gradientClasses from '../styling/gradient.module.css';

function ProtectedRoute({ children }: { children: ReactElement }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);
    if (loading) return (
        <div className={`${gradientClasses['bgGradient']} w-full h-full text-textPrimary flex justify-center items-center`}>
            Loading...
        </div>
    )

    return user ? children : null;
}

export default ProtectedRoute;