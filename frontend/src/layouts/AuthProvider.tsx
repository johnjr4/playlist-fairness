import { useEffect, useState, type ReactNode } from "react";
import * as Public from 'spotifair';
import { getMe } from '../utils/auth/authFetch';
import { AuthContext } from "../utils/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Public.User | null>(null);         // user object or null
    const [loading, setLoading] = useState(true);   // loading during fetch

    // Check if session exists already on session load
    useEffect(() => {
        const checkIfSessionExists = async () => {
            try {
                const user = await getMe();
                // user may be null, this was just an initial check
                if (user) {
                    // Don't want to set null user because it may have been set by a successful auth login
                    setUser(user);
                }
            } catch (err) {
                console.error("Error getting auth user:", err);
            } finally {
                setLoading(false);
            }
        }
        checkIfSessionExists();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};