import { useNavigate } from "react-router";
import { useAuth } from "../utils/AuthContext";
import { useEffect, type ReactElement } from "react";

function ProtectedRoute({ children }: { children: ReactElement }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);
    if (loading) return <div>Loading...</div>

    return user ? children : null;
}

export default ProtectedRoute;