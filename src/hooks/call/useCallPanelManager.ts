
import { useState } from 'react';

export const useCallPanelManager = () => {
  const [isLoading] = useState(false);
  
  return {
    isLoading
  };
};
