"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const GLYPHS_PATHS = {
    bolt: "M 40,10 L 30,50 L 50,50 L 40,90 L 70,40 L 50,40 L 60,10 Z",
    star: "M 50,10 L 60,40 L 95,40 L 65,60 L 75,90 L 50,70 L 20,90 L 35,60 L 5,40 L 40,40 Z",
    vinyl: "M 50,10 A 40,40 0 1,0 50,90 A 40,40 0 1,0 50,10 M 50,30 A 20,20 0 1,1 50,70 A 20,20 0 1,1 50,30 M 50,45 A 5,5 0 1,0 50,55 A 5,5 0 1,0 50,45",
    headphones: "M 20,60 Q 20,15 50,15 Q 80,15 80,60 L 85,60 V 85 H 70 V 60 L 75,60 Q 75,25 50,25 Q 25,25 25,60 L 30,60 V 85 H 15 V 60 Z",
    banana: "M 80,20 Q 60,20 40,40 Q 20,60 20,80 Q 40,85 60,65 Q 85,45 80,20 Z",
    radio: "M 10,35 H 90 V 65 H 10 Z M 20,42 H 55 V 58 H 20 Z M 65,42 H 80 V 48 H 65 Z M 65,52 H 80 V 58 H 65 Z"
};

const PALETTE = ["#00FFCC", "#FFFF00", "#FF00FF", "#FFFFFF", "#00CCFF", "#000000"];

interface Atom {
    path: Path2D;
    x: number;
    y: number;
    s: number;
    r: number;
    f: string;
}

export default function GenerativePopCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRunning, setIsRunning] = useState(false);
    const isRunningRef = useRef(false);
    const [surface, setSurface] = useState("#FF0055");
    const atomsRef = useRef<Atom[]>([]);
    const lastTick = useRef<number>(0);
    const generationSpeed = 400;

    const paths = useRef<Record<string, Path2D>>({});
    const loopRef = useRef<(time: number) => void>();
    
    useEffect(() => {
        Object.entries(GLYPHS_PATHS).forEach(([key, d]) => {
            paths.current[key] = new Path2D(d);
        });
    }, []);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    const createAtom = useCallback(() => {
        const keys = Object.keys(GLYPHS_PATHS);
        const type = keys[Math.floor(Math.random() * keys.length)];
        return {
            path: paths.current[type],
            x: Math.random() * 500,
            y: Math.random() * 500,
            s: Math.random() * 1.5 + 0.5,
            r: Math.random() * Math.PI * 2,
            f: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        };
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = surface;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        atomsRef.current.forEach((atom) => {
            ctx.save();
            ctx.translate(atom.x, atom.y);
            ctx.rotate(atom.r);
            ctx.scale(atom.s, atom.s);
            ctx.translate(-50, -50); 
            ctx.fillStyle = atom.f;
            ctx.fill(atom.path);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.stroke(atom.path);
            ctx.restore();
        });
    }, [surface]);

    const loop = useCallback((time: number) => {
        if (!isRunningRef.current) return;

        if (time - lastTick.current > generationSpeed) { 
            atomsRef.current = [...atomsRef.current.slice(-25), createAtom()];
            lastTick.current = time;
        }
        
        draw();
        requestAnimationFrame(loopRef.current!);
    }, [createAtom, draw]);

    useEffect(() => {
        loopRef.current = loop;
    }, [loop]);

    useEffect(() => {
        if (isRunning) {
            requestAnimationFrame(loopRef.current!);
        }
    }, [isRunning]);

    useEffect(() => { draw(); }, [draw]);

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row items-center justify-center p-8 gap-10 font-black uppercase italic" id="cover-section">
            
            <div className="relative shadow-2xl">
                <canvas 
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="border-2 border-white/10 bg-white cursor-pointer"
                    onClick={() => setIsRunning(!isRunning)}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <h1 className="text-8xl md:text-[110px] text-center leading-[0.8] tracking-tighter"
                            style={{ color: "#FFF", WebkitTextStroke: "3px black", filter: "drop-shadow(6px 6px 0px black)" }}>
                        DUA<br/>LIPA
                    </h1>
                </div>
            </div>

            <div className="w-72 bg-black border border-white/10 p-6 flex flex-col gap-8 text-white">
                <div className="space-y-3">
                    <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-full py-4 border font-bold text-sm tracking-widest transition-all ${isRunning ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white'}`}
                    >
                        {isRunning ? "PAUSE" : "COMMENCER"}
                    </button>
                </div>

                <div className="space-y-3">
                    <span className="text-[10px] tracking-[0.3em] text-white/40 font-sans italic">COULEUR DE FOND</span>
                    <div className="grid grid-cols-3 gap-2">
                        {["#FF0055", "#00CCFF", "#FFFF00", "#111", "#EEE", "#00FFCC"].map(c => (
                            <button 
                                key={c} 
                                onClick={() => {setSurface(c); atomsRef.current = []; draw();}} 
                                className={`h-8 border border-white/10 transition-transform ${surface === c ? 'scale-110 border-white' : 'hover:border-white/50'}`} 
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => {atomsRef.current = []; draw();}}
                    className="w-full py-2 text-[9px] tracking-widest text-white/20 hover:text-white border-t border-white/5 pt-4 font-sans italic"
                >
                    RÉINITIALISER
                </button>
            </div>
            <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 z-40 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <svg 
          width="60" 
          height="30" 
          viewBox="0 0 60 30" 
          fill="none" 
          stroke="white" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-100 drop-shadow-lg"
        >
          <path d="M5 5L30 25L55 5" />
        </svg>
      </motion.div>
        </div>
    );
}
