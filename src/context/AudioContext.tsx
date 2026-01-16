'use client';

import React, { createContext, useContext, useState } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  // On passe d'une Ref à un état réel pour déclencher la mise à jour
  analyser: AnalyserNode | null; 
  setAnalyser: (node: AnalyserNode | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  return (
    <AudioContext.Provider value={{ 
      isPlaying, 
      setIsPlaying, 
      analyser, // Maintenant c'est un état réactif
      setAnalyser 
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