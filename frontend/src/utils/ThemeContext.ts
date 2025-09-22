// AuthContext.jsx
import { createContext, useContext } from 'react';

interface ThemeContextType {
  isDarkMode: boolean
  setIsDarkMode: (darkMode: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook for easy access
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error("useTheme must be used within an ThemeProvider");
  return context;
}