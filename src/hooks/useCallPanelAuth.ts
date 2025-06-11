
import { useState, useEffect } from 'react';

// Simplified auth hook specifically for CallPanel to avoid circular dependencies
export const useCallPanelAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage directly to avoid AuthContext dependency
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  return { user, isLoading };
};
