'use client'

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

interface LiveRegionContextType {
  announce: (message: string) => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | undefined>(undefined);

export const useLiveRegion = () => {
  const context = useContext(LiveRegionContext);
  if (context === undefined) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider');
  }
  return context;
};

interface LiveRegionProviderProps {
  children: ReactNode;
}

export const LiveRegionProvider: React.FC<LiveRegionProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>("");
  const [key, setKey] = useState<number>(0); // Change key to force re-render/re-announce

  const announce = useCallback((newMessage: string) => {
    setMessage(newMessage);
    setKey(prevKey => prevKey + 1); // Update key to trigger announcement
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Visually hidden live region */}
      <div 
        key={key} // Change key forces screen reader to re-read even if message is same
        className="sr-only" // Tailwind class for visually hidden
        role="status" 
        aria-live="polite" 
        aria-atomic="true" // Ensures the whole message is read
      >
        {message}
      </div>
    </LiveRegionContext.Provider>
  );
}; 
