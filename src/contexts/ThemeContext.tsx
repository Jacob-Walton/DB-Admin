import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  themeLoaded: false,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Load theme from backend on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await invoke<string>('get_theme');
        const dark = savedTheme === 'dark';
        setIsDarkMode(dark);
        
        // Apply theme to document
        if (dark) {
          document.documentElement.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
        }
        
        setThemeLoaded(true);
      } catch (error) {
        console.error('Failed to load theme:', error);
        setThemeLoaded(true); // Set loaded even on error to avoid infinite loading state
      }
    };

    loadTheme();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Save theme preference to backend
    try {
      await invoke('set_theme', { theme: newTheme ? 'dark' : 'light' });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
