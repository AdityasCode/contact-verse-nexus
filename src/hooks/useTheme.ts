
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, updateUserMetadata } = useAuth();

  useEffect(() => {
    // Check for saved theme preference in user metadata first
    const userTheme = user?.user_metadata?.theme;
    if (userTheme) {
      setTheme(userTheme);
    } else {
      // Fall back to localStorage and system preference
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemPreference;
      setTheme(initialTheme);
    }
  }, [user]);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Also save to localStorage as fallback
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, updateUserMetadata };
}
