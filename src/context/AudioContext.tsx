'use client';

import React, { createContext, useContext, useState, useRef } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  setAnalyser: (node: AnalyserNode) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);

  const setAnalyser = (node: AnalyserNode) => {
    analyserRef.current = node;
  };

  return (
    <AudioContext.Provider value={{ isPlaying, setIsPlaying, analyserRef, setAnalyser }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio doit être utilisé à l\'intérieur d\'un AudioProvider');
  }
  return context;
};