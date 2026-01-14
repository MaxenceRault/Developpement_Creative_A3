// src/context/ThemeContext.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';

export const THEMES = {
  HOUDINI: {
    primary: "bg-pop-blue",
    secondary: "bg-pop-pink",
    tertiary: "bg-pop-yellow",
    textOnPrimary: "text-pop-yellow/30",
    textOnSecondary: "text-pop-yellow/40",
    textOnTertiary: "text-pop-pink/40",
  },
  TRAINING: {
    primary: "bg-pop-pink",
    secondary: "bg-pop-yellow",
    tertiary: "bg-pop-blue",
    textOnPrimary: "text-pop-blue/30",
    textOnSecondary: "text-pop-blue/40",
    textOnTertiary: "text-pop-pink/40",
  }
};

const ThemeContext = createContext({
  currentTheme: THEMES.HOUDINI,
  setTheme: (theme: any) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setTheme] = useState(THEMES.HOUDINI);
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);