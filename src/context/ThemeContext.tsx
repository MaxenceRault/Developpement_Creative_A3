"use client";
import React, { createContext, useContext, useState } from 'react';

// Vos thèmes basés sur les morceaux de Dua Lipa
export const THEMES = {
  DEFAULT: { bg: 'bg-pop-pink', text: 'text-pop-yellow', accent: 'pop-blue' },
  LEVITATING: { bg: 'bg-pop-blue', text: 'text-pop-pink', accent: 'pop-yellow' },
  HOUDINI: { bg: 'bg-pop-yellow', text: 'text-pop-blue', accent: 'pop-pink' },
};

const ThemeContext = createContext({
  theme: THEMES.DEFAULT,
  setTheme: (theme: any) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(THEMES.DEFAULT);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`${theme.bg} ${theme.text} min-h-screen transition-colors duration-700`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);