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
  const { setAnalyser, isPlaying, setIsPlaying, audioRef } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioRef?.current) return;
    isPlaying ? audioRef.current.play().catch(() => setIsPlaying(false)) : audioRef.current.pause();
  }, [isPlaying, setIsPlaying, audioRef]);

  useEffect(() => {
    if (audioRef?.current && tracks.length > 0) {
      audioRef.current.src = tracks[0].file;
      audioRef.current.load();
    }
  }, [audioRef]);

  const handleTrackChange = useCallback(async (index: number, shouldPlay = true) => {
    if (index === currentTrackIndex && isPlaying && shouldPlay) return;
    setCurrentTrackIndex(index);
    const step = 360 / tracks.length;
    setRotation((tracks.length - index) * step);

    if (audioRef?.current) {
      audioRef.current.src = tracks[index].file;
      if (!audioCtxRef.current) {
        const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      if (!analyserNodeRef.current) {
        const source = audioCtx.createMediaElementSource(audioRef.current);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserNodeRef.current = analyser;
        if (setAnalyser) setAnalyser(analyser); 
      }
      if (shouldPlay) audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
    }
  }, [currentTrackIndex, isPlaying, audioRef, setIsPlaying, setAnalyser]);

  const togglePlay = async () => {
    if (!audioCtxRef.current) { await handleTrackChange(currentTrackIndex, true); return; }
    setIsPlaying(!isPlaying);
  };

  const handleWheelRotation = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setRotation(prev => {
      const newRotation = prev + e.deltaY * 0.25;
      const step = 360 / tracks.length;
      const normalizedRotation = (newRotation % 360 + 360) % 360;
      const nextIndex = (tracks.length - Math.round(normalizedRotation / step)) % tracks.length;
      if (nextIndex !== currentTrackIndex) handleTrackChange(nextIndex, true);
      return newRotation;
    });
  }, [currentTrackIndex, handleTrackChange]);

  useEffect(() => {
    const wheel = wheelRef.current;
    wheel?.addEventListener('wheel', handleWheelRotation, { passive: false });
    return () => wheel?.removeEventListener('wheel', handleWheelRotation);
  }, [handleWheelRotation]);

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
        const themeColor = tracks[currentTrackIndex].theme;
        
        const centerX = canvas.width * 0.45; 
        const centerY = canvas.height * 0.5;
        
        const frequencies = [freqData[5] || 0, freqData[40] || 0, freqData[80] || 0];
        const positions = [
          { x: centerX - 60, y: centerY - 140 }, 
          { x: centerX + 80, y: centerY }, 
          { x: centerX - 40, y: centerY + 150 }
        ];

        positions.forEach((pos, i) => {
          const freq = frequencies[i];
          const radius = 15 + (freq * 2.0);
          ctx.save();
          ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = themeColor; ctx.globalAlpha = (freq / 255) * 0.35; ctx.fill();
          ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = themeColor; ctx.lineWidth = 8; ctx.globalAlpha = Math.max(0.1, freq / 255); ctx.stroke();
          ctx.restore();
        });
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [currentTrackIndex]);

  return (
    <section 
      id="tracklist-section"
      className="relative h-screen w-full overflow-hidden flex items-center px-16 transition-colors duration-1000"
      style={{ backgroundColor: `${tracks[currentTrackIndex].theme}15` }} 
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="z-20 w-full max-w-md bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[80vh]">
        <div className="p-4 border-b-[6px] border-black bg-pop-yellow flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black italic text-black uppercase tracking-tighter leading-none">Radical</h2>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter opacity-80">Mix</h2>
          </div>
          <button onClick={togglePlay} className="w-14 h-14 bg-white border-4 border-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_0px_#000]">
            {isPlaying ? (
              <div className="flex gap-1.5"><div className="w-2 h-6 bg-black"></div><div className="w-2 h-6 bg-black"></div></div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-black border-b-12 border-b-transparent"></div>
            )}
          </button>
        </div>
        
        <div className="overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar bg-white">
          {tracks.map((track, index) => {
            const isActive = currentTrackIndex === index;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                style={{ backgroundColor: isActive ? track.theme : '#fff', color: isActive ? (track.theme === '#CCFF00' ? '#000' : '#fff') : '#000' }}
                className={`flex items-center justify-between p-3 border-[3px] border-black transition-all font-black text-lg uppercase relative overflow-hidden group ${isActive ? 'translate-x-2' : 'hover:translate-x-1'}`}
              >
                {!isActive && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: track.theme }} />}
                <span className="relative z-10">{index + 1}. {track.title}</span>
                <span className="relative z-10">{isActive && isPlaying ? '★' : '○'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div 
        ref={wheelRef}
        style={{ transform: `translateY(-50%) rotate(${rotation}deg)`, right: '-400px' }}
        className="absolute top-1/2 w-200 h-200 bg-[#0d0d0d] rounded-full border-15 border-white/5 flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out cursor-ns-resize"
      >
        {tracks.map((t, i) => (
          <div 
            key={i}
            className={`absolute font-black uppercase transition-all duration-500 ${i === currentTrackIndex ? 'text-pop-yellow opacity-100 scale-110' : 'text-white opacity-20'}`}
            style={{ 
              transform: `rotate(${(i * 360) / tracks.length}deg) translateX(-320px)`,
              width: '300px', textAlign: 'right', fontSize: '1.2rem'
            }}
          >
            {t.title}
          </div>
        ))}

        <div 
          style={{ backgroundColor: tracks[currentTrackIndex].theme, transform: `rotate(${-rotation}deg)` }}
          className="w-64 h-64 rounded-full border-10 border-black relative z-40 transition-colors duration-700 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]"
        />
      </div>

      <audio ref={audioRef} crossOrigin="anonymous" onEnded={() => handleTrackChange((currentTrackIndex + 1) % tracks.length)} />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CCFF00; border: 2px solid #000; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #CCFF00 #000; }
      `}</style>
    </section>
  );
}
