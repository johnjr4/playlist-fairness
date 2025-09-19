import { useEffect, useState, type ReactNode } from "react";
import * as Public from 'spotifair';
import { getMe } from './api/authFetch';
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Public.User | null>(null);         // user object or null
    const [loading, setLoading] = useState(true);   // loading during fetch

    // Fetch current user session on app load
    useEffect(() => {
        const getAuthUser = async () => {
            try {
                const user = await getMe();
                // user may be null
                setUser(user);
            } catch (err) {
                console.error("Error getting auth user:", err);
            } finally {
                setLoading(false);
            }
        }
        getAuthUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};