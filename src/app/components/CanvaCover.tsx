"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const GLYPHS = {
    bolt: "M 40,10 L 30,50 L 50,50 L 40,90 L 70,40 L 50,40 L 60,10 Z",
    star: "M 50,10 L 60,40 L 95,40 L 65,60 L 75,90 L 50,70 L 20,90 L 30,55 L 5,40 L 40,40 Z",
    vinyl: "M 50,10 A 40,40 0 1,0 50,90 A 40,40 0 1,0 50,10 M 50,30 A 20,20 0 1,1 50,70 A 20,20 0 1,1 50,30 M 50,45 A 5,5 0 1,0 50,55 A 5,5 0 1,0 50,45",
    headphones: "M 20,60 Q 20,15 50,15 Q 80,15 80,60 L 85,60 V 85 H 70 V 60 L 75,60 Q 75,25 50,25 Q 25,25 25,60 L 30,60 V 85 H 15 V 60 Z",
    ring: "M 50,15 A 35,35 0 1,0 50,85 A 35,35 0 1,0 50,15 M 50,25 A 25,25 0 1,1 50,75 A 25,25 0 1,1 50,25"
};

const PALETTE = ["#00FFCC", "#FFFF00", "#FF00FF", "#FFFFFF", "#00CCFF", "#000000"];

interface Atom {
    id: string;
    d: string;
    x: number;
    y: number;
    s: number;
    r: number;
    f: string;
}

export default function GenerativePopStudio() {
    const [atoms, setAtoms] = useState<Atom[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [surface, setSurface] = useState("#FF0055");
    
    const frameRef = useRef<number>();
    const lastTick = useRef<number>(0);

    const createAtom = useCallback(() => {
        const keys = Object.keys(GLYPHS);
        return {
            id: crypto.randomUUID(),
            d: GLYPHS[keys[Math.floor(Math.random() * keys.length)] as keyof typeof GLYPHS],
            x: Math.random() * 100,
            y: Math.random() * 100,
            s: Math.random() * 90 + 60,
            r: Math.random() * 360,
            f: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        };
    }, []);

    const loop = (time: number) => {
        if (time - lastTick.current > 200) { 
            setAtoms(prev => [...prev.slice(-25), createAtom()]);
            lastTick.current = time;
        }
        frameRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        if (isRunning) frameRef.current = requestAnimationFrame(loop);
        else if (frameRef.current) cancelAnimationFrame(frameRef.current);
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [isRunning, createAtom]);

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row items-center justify-center p-8 gap-10 font-black uppercase italic">
            
            <div 
                className="relative w-full max-w-[500px] aspect-square border-2 border-white/10 bg-white overflow-hidden shadow-2xl cursor-pointer"
                style={{ backgroundColor: surface }}
                onClick={() => setIsRunning(!isRunning)}
            >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:15px_15px]" />

                {atoms.map(a => (
                    <div 
                        key={a.id} 
                        className="absolute transition-all duration-700" 
                        style={{ 
                            left: `${a.x}%`, top: `${a.y}%`, width: a.s, height: a.s, 
                            transform: `translate(-50%, -50%) rotate(${a.r}deg)` 
                        }}
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path d={a.d} fill={a.f} stroke="black" strokeWidth="4" strokeLinejoin="round" />
                        </svg>
                    </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <h1 className="text-8xl md:text-[110px] text-center leading-[0.8] tracking-tighter"
                            style={{ color: "#FFF", WebkitTextStroke: "3px black", filter: "drop-shadow(6px 6px 0px black)" }}>
                        DUA<br/>LIPA
                    </h1>
                </div>
            </div>

            <div className="w-72 bg-black border border-white/10 p-6 flex flex-col gap-8 text-white">
                <div className="space-y-3">
                    <span className="text-[10px] tracking-[0.3em] text-white/40 font-sans italic">ÉTAT DU MOTEUR</span>
                    <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-full py-4 border font-bold text-sm tracking-widest transition-all ${isRunning ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white'}`}
                    >
                        {isRunning ? "PAUSE GÉNÉRATION" : "EXÉCUTER BOUCLE"}
                    </button>
                </div>

                <div className="space-y-3">
                    <span className="text-[10px] tracking-[0.3em] text-white/40 font-sans italic">COULEUR SURFACE</span>
                    <div className="grid grid-cols-3 gap-2">
                        {["#FF0055", "#00CCFF", "#FFFF00", "#111", "#EEE", "#00FFCC"].map(c => (
                            <button 
                                key={c} 
                                onClick={() => {setSurface(c); setAtoms([]);}} 
                                className={`h-8 border border-white/10 transition-transform ${surface === c ? 'scale-110 border-white' : 'hover:border-white/50'}`} 
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setAtoms([])}
                    className="w-full py-2 text-[9px] tracking-widest text-white/20 hover:text-white border-t border-white/5 pt-4 font-sans italic"
                >
                    PURGER SYSTÈME
                </button>
            </div>
        </div>
    );
}
