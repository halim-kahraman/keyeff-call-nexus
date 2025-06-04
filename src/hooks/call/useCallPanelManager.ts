
import { useState } from 'react';

export const useCallPanelManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    isLoading,
    setIsLoading
  };
};
