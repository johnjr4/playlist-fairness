// AuthContext.jsx
import { createContext, useContext } from 'react';
import * as Public from 'spotifair';

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