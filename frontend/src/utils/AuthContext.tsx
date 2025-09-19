// AuthContext.jsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe } from './api/authFetch';
import * as Public from 'spotifair';

interface AuthContextType {
  // TODO: Change me!
  user: Public.User | null,
  loading: boolean,
  setUser: (user: Public.User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}