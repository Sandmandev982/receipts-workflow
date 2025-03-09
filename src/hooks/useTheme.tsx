
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to safely check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Use a default theme if localStorage is not available
  const getInitialTheme = () => {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light'; // Default theme if localStorage is not available
  };

  const [theme, setThemeState] = useState<string>(getInitialTheme());

  useEffect(() => {
    try {
      if (isLocalStorageAvailable()) {
        localStorage.setItem('theme', theme);
      }
      
      // Apply theme class to document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      
      // Set data-theme attribute for components that might use it
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={theme}
        enableSystem={false}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
