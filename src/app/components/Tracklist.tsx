'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAudio } from '@/context/AudioContext';

const tracks = [
  { id: 1, title: 'End Of An Era', file: '/tracks/End Of An Era.mp3', theme: '#0047AB' },
  { id: 2, title: 'Houdini', file: '/tracks/Houdini.mp3', theme: '#FF1493' },
  { id: 3, title: 'Training Season', file: '/tracks/Training Season.mp3', theme: '#CCFF00' },
  { id: 4, title: 'These Walls', file: '/tracks/These Walls.mp3', theme: '#FF1493' },
  { id: 5, title: 'Whatcha Doing', file: '/tracks/Whatcha Doing.mp3', theme: '#0047AB' },
  { id: 6, title: 'French Exit', file: '/tracks/French Exit.mp3', theme: '#CCFF00' },
  { id: 7, title: 'Illusion', file: '/tracks/Illusion.mp3', theme: '#FF1493' },
  { id: 8, title: 'Falling Forever', file: '/tracks/Falling Forever.mp3', theme: '#0047AB' },
  { id: 9, title: 'Anything For Love', file: '/tracks/Anything For Love.mp3', theme: '#CCFF00' },
  { id: 10, title: 'Maria', file: '/tracks/Maria.mp3', theme: '#FF1493' },
  { id: 11, title: 'Happy For You', file: '/tracks/Happy For You.mp3', theme: '#0047AB' }
];

export default function App() {
  const { setAnalyser, isPlaying, setIsPlaying } = useAudio() || { isPlaying: false, setIsPlaying: () => {}, setAnalyser: () => {} };
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null); // Ref pour bloquer le scroll
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- LIAISON : ÉCOUTER LE PLAY/PAUSE DE LA COVER ---
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current && tracks.length > 0) {
      audioRef.current.src = tracks[0].file;
    }
  }, []);

  const handleTrackChange = async (index: number, shouldPlay = true) => {
    if (index === currentTrackIndex && isPlaying && shouldPlay) return;
    
    const track = tracks[index];
    setCurrentTrackIndex(index);
    
    const step = 360 / tracks.length;
    const newRotation = (tracks.length - index) * step;
    setRotation(newRotation);

    if (audioRef.current) {
      audioRef.current.src = track.file;
      audioRef.current.load();
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      
      if (!analyserNodeRef.current) {
        try {
          const source = audioCtx.createMediaElementSource(audioRef.current);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          
          analyserNodeRef.current = analyser;
          
          if (setAnalyser) {
             setAnalyser(analyser); 
             console.log("Analyseur partagé au contexte !");
          }
        } catch (err) {
          console.error("Erreur connexion source:", err);
        }
      }

      if (shouldPlay) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
      }
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (!audioCtxRef.current) {
      await handleTrackChange(currentTrackIndex, false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Play failed", e);
      }
    }
  };

  // --- GESTION DU SCROLL DU DISQUE (SANS SCROLL PAGE) ---
  const handleWheelRotation = useCallback((e: WheelEvent) => {
    // Empêche le scroll de la fenêtre
    e.preventDefault(); 

    const delta = e.deltaY;
    setRotation(prev => {
      const newRotation = prev + delta * 0.25;
      
      const step = 360 / tracks.length;
      const normalizedRotation = (newRotation % 360 + 360) % 360;
      const sector = Math.round(normalizedRotation / step);
      const nextIndex = (tracks.length - sector) % tracks.length;

      if (nextIndex !== currentTrackIndex) {
        handleTrackChange(nextIndex, true);
      }
      return newRotation;
    });
  }, [currentTrackIndex]);

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return;

    // Ajout manuel avec passive: false pour autoriser preventDefault()
    wheelElement.addEventListener('wheel', handleWheelRotation, { passive: false });

    return () => {
      wheelElement.removeEventListener('wheel', handleWheelRotation);
    };
  }, [handleWheelRotation]);

  // --- CANVAS BACKGROUND ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId: number;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let freqData = new Uint8Array(0);
      if (analyserNodeRef.current) {
        freqData = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
        analyserNodeRef.current.getByteFrequencyData(freqData);
      }

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const lowFreq = freqData[5] || 0;
        const midFreq = freqData[40] || 0;
        const highFreq = freqData[80] || 0;
        
        const frequencies = [lowFreq, midFreq, highFreq];
        const themeColor = tracks[currentTrackIndex].theme;
        const centerX = canvas.width * 0.45; 
        const centerY = canvas.height * 0.5;
        
        const positions = [
          { x: centerX - 80, y: centerY - 120 }, 
          { x: centerX + 40, y: centerY },       
          { x: centerX - 60, y: centerY + 130 } 
        ];

        positions.forEach((pos, i) => {
          const freq = frequencies[i];
          const radius = 20 + (freq * 1.2);
          const opacity = Math.max(0.1, freq / 255);

          ctx.save();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = themeColor;
          ctx.globalAlpha = opacity * 0.3; 
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = 6;
          ctx.globalAlpha = opacity; 
          ctx.stroke();
          ctx.restore();
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [currentTrackIndex]);

  const activeTheme = tracks[currentTrackIndex].theme;

  return (
    <section 
      className="relative h-screen overflow-hidden flex items-center px-10 transition-colors duration-1000"
      style={{ backgroundColor: `${activeTheme}15` }} 
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* TRACKLIST CARD */}
      <div className="z-20 w-full max-w-lg bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[85vh]">
        <div className="p-6 border-b-[6px] border-black bg-[#CCFF00] flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-5xl font-black italic text-black uppercase tracking-tighter leading-none">Radical</h2>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter opacity-80">Mix</h2>
          </div>
          <button 
            onClick={togglePlay}
            className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[4px_4px_0px_0px_#000]"
          >
            {isPlaying ? (
              <div className="flex gap-1.5"><div className="w-2.5 h-7 bg-black"></div><div className="w-2.5 h-7 bg-black"></div></div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-black border-b-[14px] border-b-transparent"></div>
            )}
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-white">
          {tracks.map((track, index) => {
            const isActive = currentTrackIndex === index;
            const textColor = isActive ? (track.theme === '#CCFF00' ? '#000' : '#fff') : '#000';
            
            return (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                style={{ 
                  backgroundColor: isActive ? track.theme : '#fff',
                  color: textColor
                }}
                className={`flex items-center justify-between p-4 border-4 border-black transition-all font-black text-xl uppercase relative overflow-hidden group ${
                  isActive ? 'translate-x-4 shadow-[-8px_0px_0px_0px_#000]' : 'hover:translate-x-2'
                }`}
              >
                {!isActive && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: track.theme }} />
                )}
                <span className="relative z-10">{index + 1}. {track.title}</span>
                <span className="text-2xl relative z-10">{isActive && isPlaying ? '★' : '○'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* JOG WHEEL DISQUE */}
      <div 
        ref={wheelRef}
        style={{ transform: `rotate(${rotation}deg)` }}
        className="absolute -right-[450px] w-[1000px] h-[1000px] bg-[#0d0d0d] rounded-full border-[20px] border-white/5 flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out cursor-ns-resize"
      >
        {tracks.map((t, i) => {
          const isActive = i === currentTrackIndex;
          return (
            <div 
              key={i}
              className={`absolute font-black uppercase transition-all duration-500 ${isActive ? 'text-[#CCFF00] z-30 opacity-100' : 'text-white opacity-40'}`}
              style={{ 
                transform: `rotate(${(i * 360) / tracks.length}deg) translateX(-380px)`,
                fontSize: '1rem',
                textAlign: 'right',
                width: '350px',
                textShadow: isActive ? '0 0 15px rgba(0,0,0,0.8)' : 'none'
              }}
            >
              {t.title}
            </div>
          );
        })}

        <div 
          style={{ backgroundColor: activeTheme, transform: `rotate(${-rotation}deg)` }}
          className="w-72 h-72 rounded-full border-[15px] border-black flex flex-col items-center justify-center relative z-40 transition-colors duration-700 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]"
        >
          <div className="w-10 h-10 bg-black rounded-full mb-4 shadow-xl" />
          <span className="text-sm font-black uppercase text-black/50 tracking-widest">Lecture</span>
          <div className="absolute bottom-10 flex gap-1">
             {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1.5 h-4 bg-black/20 rounded-full ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDelay: `${i * 0.1}s` }} />
             ))}
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        crossOrigin="anonymous"
        onEnded={() => handleTrackChange((currentTrackIndex + 1) % tracks.length)} 
      />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 14px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #CCFF00; 
          border: 3px solid #000;
        }
        .custom-scrollbar {
          scrollbar-color: #CCFF00 #000;
          scrollbar-width: thick;
        }
      `}</style>
    </section>
  );
}