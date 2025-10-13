// AuthContext.jsx
import { createContext, useContext } from 'react';
import type * as Public from 'spotifair';

interface AuthContextType {
  // TODO: Change me!
  user: Public.User | null,
  loading: boolean,
  setUser: (user: Public.User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// Get a non-null user when already inside a ProtectedRoute (for type convenience)
export function useProtectedAuth() {
  const { user, setUser } = useAuth();
  if (!user) {
    throw new Error("useProtectedAuth must be used within a ProtectedRoute");
  }
  return { user, setUser };
}