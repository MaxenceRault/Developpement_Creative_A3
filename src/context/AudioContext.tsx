'use client';

import React, { createContext, useContext, useState, useRef } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  analyser: AnalyserNode | null; 
  setAnalyser: (node: AnalyserNode | null) => void;
  // ON AJOUTE CECI : une référence vers l'élément audio
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  // Création de la Ref ici
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <AudioContext.Provider value={{ 
      isPlaying, 
      setIsPlaying, 
      analyser,
      setAnalyser,
      audioRef // On expose la ref pour que le lecteur audio puisse s'y brancher
    }}>
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