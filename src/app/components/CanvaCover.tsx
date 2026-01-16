"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";

const GLYPHS_PATHS = {
    bolt: "M 40,10 L 30,50 L 50,50 L 40,90 L 70,40 L 50,40 L 60,10 Z",
    star: "M 50,10 L 60,40 L 95,40 L 65,60 L 75,90 L 50,70 L 20,90 L 35,60 L 5,40 L 40,40 Z",
    vinyl: "M 50,10 A 40,40 0 1,0 50,90 A 40,40 0 1,0 50,10 M 50,30 A 20,20 0 1,1 50,70 A 20,20 0 1,1 50,30 M 50,45 A 5,5 0 1,0 50,55 A 5,5 0 1,0 50,45",
    headphones: "M 20,60 Q 20,15 50,15 Q 80,15 80,60 L 85,60 V 85 H 70 V 60 L 75,60 Q 75,25 50,25 Q 25,25 25,60 L 30,60 V 85 H 15 V 60 Z",
    banana: "M 80,20 Q 60,20 40,40 Q 20,60 20,80 Q 40,85 60,65 Q 85,45 80,20 Z",
    radio: "M 10,35 H 90 V 65 H 10 Z M 20,42 H 55 V 58 H 20 Z M 65,42 H 80 V 48 H 65 Z M 65,52 H 80 V 58 H 65 Z"
};

const PALETTE = ["#00FFCC", "#FFFF00", "#FF00FF", "#FFFFFF", "#00CCFF", "#000000"];

export default function GenerativePopCanvas() {
    const { analyser, isPlaying, setIsPlaying } = useAudio() || {};
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [surface, setSurface] = useState("#FF0055");
    const [waveColor, setWaveColor] = useState("#CCFF00");
    const [textColor, setTextColor] = useState("#FFFFFF"); // Nouvel état pour la couleur du titre
    
    const atomsRef = useRef<any[]>([]);
    const lastTick = useRef<number>(0);
    const barCount = 30;
    const lastWaveData = useRef<number[]>(new Array(barCount).fill(0));
    const paths = useRef<Record<string, Path2D>>({});
    
    const generationSpeed = 400;

    useEffect(() => {
        Object.entries(GLYPHS_PATHS).forEach(([key, d]) => {
            paths.current[key] = new Path2D(d);
        });
    }, []);

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

        // 1. FOND
        ctx.fillStyle = surface;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. STICKERS
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

        // 3. TEXTE DUA LIPA
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.fillStyle = textColor; // Utilisation de la couleur choisie
        ctx.lineWidth = 7;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";

        const textX = canvas.width / 2;
        const textY = canvas.height / 2;

        ctx.font = "900 70px sans-serif";
        ctx.strokeText("DUA LIPA", textX, textY - 60);
        ctx.fillText("DUA LIPA", textX, textY - 60);

        ctx.font = "italic 900 30px sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeText("RADICAL PESSIMIST", textX, textY + 40);
        ctx.fillText("RADICAL PESSIMIST", textX, textY + 40);
        ctx.restore();

        // 4. ONDE SONORE (CAPSULES)
        const gap = 6; 
        const totalGapWidth = (barCount - 1) * gap;
        const barWidth = (canvas.width - totalGapWidth) / barCount;

        let dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
        if (analyser && isPlaying) {
            analyser.getByteFrequencyData(dataArray);
        }

        ctx.fillStyle = waveColor;
        for (let i = 0; i < barCount; i++) {
            let val = 0;
            if (isPlaying && analyser) {
                val = (dataArray[i * 3 + 10] || 0) * 0.8; 
                lastWaveData.current[i] = val; 
            } else {
                val = lastWaveData.current[i];
            }

            const barHeight = 6 + (val / 255) * 200;
            const x = i * (barWidth + gap);
            const y = canvas.height - barHeight;

            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
            ctx.fill();
        }
    }, [surface, waveColor, textColor, analyser, isPlaying]);

    useEffect(() => {
        let animationId: number;
        const loop = (time: number) => {
            if (isRunning && time - lastTick.current > generationSpeed) {
                const newAtom = createAtom();
                atomsRef.current = [...atomsRef.current.slice(-20), newAtom];
                lastTick.current = time;
            }
            draw();
            animationId = requestAnimationFrame(loop);
        };
        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [isRunning, createAtom, draw]);

    const handleToggleAudio = async () => {
        if (!setIsPlaying) return;
        if (!isPlaying && analyser?.context.state === 'suspended') {
            await analyser.context.resume();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row items-center justify-center p-8 gap-10 font-black uppercase italic">
            <div className="relative">
                <canvas 
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="border-8 border-white bg-white shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                />
            </div>

            <div className="w-80 bg-[#111] border-4 border-white p-6 flex flex-col gap-5 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
                {/* 1. GENERATEUR */}
                <div className="space-y-2">
                    <span className="text-[10px] tracking-widest text-white/40 font-sans">1. GENERATEUR</span>
                    <button onClick={() => setIsRunning(!isRunning)}
                        className={`w-full py-3 border-4 font-black text-xs tracking-widest transition-all ${isRunning ? 'bg-[#CCFF00] text-black border-black' : 'bg-transparent text-white border-white/20 hover:border-white'}`}>
                        {isRunning ? "STOP STICKERS" : "START STICKERS"}
                    </button>
                </div>

                {/* 2. AUDIO */}
                <div className="space-y-2">
                    <span className="text-[10px] tracking-widest text-white/40 font-sans">2. AUDIO</span>
                    <button onClick={handleToggleAudio}
                        className={`w-full py-3 border-4 font-black text-xs tracking-widest transition-all ${isPlaying ? 'bg-[#FF00FF] text-white border-black' : 'bg-transparent text-white border-white/20 hover:border-white'}`}>
                        {isPlaying ? "FREEZE AUDIO" : "PLAY & ANALYZE"}
                    </button>
                </div>

                {/* 3. COULEUR FOND */}
                <div className="space-y-2">
                    <span className="text-[10px] tracking-widest text-white/40 font-sans">3. FOND</span>
                    <div className="grid grid-cols-6 gap-1">
                        {["#FF0055", "#00CCFF", "#FFFF00", "#111", "#EEE", "#00FFCC"].map(c => (
                            <button key={c} onClick={() => {setSurface(c); atomsRef.current = [];}} 
                                className={`h-8 border-2 ${surface === c ? 'border-white' : 'border-transparent'}`} 
                                style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>

                {/* 4. COULEUR TEXTE (NOUVEAU) */}
                <div className="space-y-2">
                    <span className="text-[10px] tracking-widest text-white/40 font-sans">4. COULEUR TITRE</span>
                    <div className="grid grid-cols-6 gap-1">
                        {PALETTE.map(c => (
                            <button key={c} onClick={() => setTextColor(c)} 
                                className={`h-8 border-2 ${textColor === c ? 'border-white' : 'border-transparent'}`} 
                                style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>

                {/* 5. COULEUR ONDE */}
                <div className="space-y-2">
                    <span className="text-[10px] tracking-widest text-white/40 font-sans">5. COULEUR ONDE</span>
                    <div className="grid grid-cols-6 gap-1">
                        {PALETTE.map(c => (
                            <button key={c} onClick={() => setWaveColor(c)} 
                                className={`h-8 border-2 ${waveColor === c ? 'border-white' : 'border-transparent'}`} 
                                style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <button onClick={() => {
                        const link = document.createElement('a');
                        link.download = `dua-lipa-cover.png`;
                        link.href = canvasRef.current!.toDataURL();
                        link.click();
                    }} className="w-full py-4 bg-white text-black font-black text-xs hover:bg-[#CCFF00] transition-transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                        DOWNLOAD .PNG
                    </button>
                </div>
            </div>
        </div>
    );
}