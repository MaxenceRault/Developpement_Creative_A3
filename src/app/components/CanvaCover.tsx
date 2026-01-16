"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";

import { drawBolt } from "./patterns/Bolt";
import { drawStar } from "./patterns/Star";
import { drawVinyl } from "./patterns/Vinyl";
import { drawHeadphones } from "./patterns/Headphones";
import { drawRadio } from "./patterns/Radio";

const GLYPHS_FUNCTIONS = {
    bolt: drawBolt,
    star: drawStar,
    vinyl: drawVinyl,
    headphones: drawHeadphones,
    radio: drawRadio,
};

const PALETTE = ["#00FFCC", "#FFFF00", "#FF00FF", "#FFFFFF", "#00CCFF", "#000000"];

interface Sticker {
    drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, f: string, r: number) => void;
    x: number; y: number; s: number; r: number; f: string;
}

interface Band {
    points: { x: number; y: number }[];
    width: number;
    color: string;
}

export default function GenerativePopCanvas() {
    const { analyser, isPlaying, setIsPlaying, audioRef, setAnalyser } = useAudio();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [isRunning, setIsRunning] = useState(false);
    const [surface, setSurface] = useState("#FF0055");
    const [waveColor, setWaveColor] = useState("#CCFF00");
    const [textColor, setTextColor] = useState("#FFFFFF");

    const stickersRef = useRef<Sticker[]>([]);
    const bandsRef = useRef<Band[]>([]);
    const lastTick = useRef<number>(0);
    const barCount = 30;
    const smoothedData = useRef<number[]>(new Array(barCount).fill(0));
    const generationSpeed = 400;

    const getHarmonizedColor = useCallback(() => {
        const hex = surface.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 128 
            ? `rgba(${r * 0.5}, ${g * 0.5}, ${b * 0.5}, 0.4)` 
            : `rgba(255, 255, 255, 0.15)`;
    }, [surface]);

    const generateNewPattern = useCallback(() => {
        const newBands: Band[] = [];
        const count = 5 + Math.floor(Math.random() * 7);
        const isVertical = Math.random() > 0.5; 
        
        for (let i = 0; i < count; i++) {
            const width = 5 + Math.random() * 45;
            let points;

            if (isVertical) {
                points = [
                    { x: Math.random() * 500, y: -100 },
                    { x: Math.random() * 500, y: Math.random() * 500 },
                    { x: Math.random() * 500, y: Math.random() * 500 },
                    { x: Math.random() * 500, y: 600 }
                ];
            } else {
                points = [
                    { x: -100, y: Math.random() * 500 }, 
                    { x: Math.random() * 500, y: Math.random() * 500 }, 
                    { x: Math.random() * 500, y: Math.random() * 500 }, 
                    { x: 600, y: Math.random() * 500 }
                ];
            }

            newBands.push({
                points,
                width, 
                color: getHarmonizedColor(),
            });
        }
        bandsRef.current = newBands;
    }, [getHarmonizedColor]);

    useEffect(() => {
        if (!audioRef?.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, audioRef]);

    const handleToggleAudioFlow = async () => {
        if (!audioRef?.current) return;
        if (!isPlaying) {
            if (!analyser) {
                const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
                const ctx = new AudioCtx();
                const node = ctx.createAnalyser();
                node.fftSize = 256;
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(node);
                node.connect(ctx.destination);
                setAnalyser(node);
                if (ctx.state === "suspended") await ctx.resume();
            }
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    const createSticker = useCallback((): Sticker => {
        const keys = Object.keys(GLYPHS_FUNCTIONS) as (keyof typeof GLYPHS_FUNCTIONS)[];
        const type = keys[Math.floor(Math.random() * keys.length)];
        return {
            drawFn: GLYPHS_FUNCTIONS[type],
            x: Math.random() * 500,
            y: Math.random() * 500,
            s: 40 + Math.random() * 80,
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

        bandsRef.current.forEach((band) => {
            ctx.beginPath();
            ctx.moveTo(band.points[0].x, band.points[0].y);
            ctx.bezierCurveTo(band.points[1].x, band.points[1].y, band.points[2].x, band.points[2].y, band.points[3].x, band.points[3].y);
            ctx.strokeStyle = band.color;
            ctx.lineWidth = band.width;
            ctx.lineCap = "round";
            ctx.stroke();
        });

        stickersRef.current.forEach((sticker) => {
            sticker.drawFn(ctx, sticker.x, sticker.y, sticker.s, sticker.f, sticker.r);
        });

        ctx.save();
        const textX = canvas.width / 2;
        const textY = canvas.height / 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round"; 

        ctx.font = "italic 900 85px Impact, sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 6;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 12;
        ctx.strokeText("DUA LIPA", textX, textY - 60);

        ctx.fillStyle = textColor;
        ctx.shadowColor = "transparent";
        ctx.fillText("DUA LIPA", textX, textY - 60);

        ctx.font = "italic 800 34px sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 8;
        ctx.strokeText("RADICAL PESSIMIST", textX, textY + 50);

        ctx.fillStyle = textColor;
        ctx.shadowColor = "transparent";
        ctx.fillText("RADICAL PESSIMIST", textX, textY + 50);
        ctx.restore();

        const gap = 4;
        const barWidth = (canvas.width - (barCount - 1) * gap) / barCount;

        if (analyser && isPlaying) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            for (let i = 0; i < barCount; i++) {
                const distFromCenter = Math.abs(i - barCount / 2);
                const audioIndex = Math.floor(distFromCenter * 1.5);
                const rawValue = dataArray[audioIndex] || 0;
                const normalized = rawValue / 255;
                const targetHeight = normalized * 140; 
                smoothedData.current[i] += (targetHeight - smoothedData.current[i]) * 0.2;
            }
        }

        ctx.fillStyle = waveColor;
        for (let i = 0; i < barCount; i++) {
            const val = smoothedData.current[i];
            if (val < 1) continue;
            const finalHeight = 6 + val;
            ctx.beginPath();
            ctx.roundRect(i * (barWidth + gap), canvas.height - finalHeight, barWidth, finalHeight, [barWidth / 2, barWidth / 2, 0, 0]);
            ctx.fill();
        }
    }, [surface, waveColor, textColor, analyser, isPlaying]);

    useEffect(() => {
        let animationId: number;
        const loop = (time: number) => {
            if (isRunning && time - lastTick.current > generationSpeed) {
                stickersRef.current = [...stickersRef.current.slice(-14), createSticker()];
                lastTick.current = time;
            }
            draw();
            animationId = requestAnimationFrame(loop);
        };
        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [isRunning, createSticker, draw]);

    return (
        <section className="relative min-h-screen bg-black flex flex-col items-center justify-center p-8 font-black uppercase italic overflow-hidden" id="cover-section">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                <canvas ref={canvasRef} width={500} height={500} className="border-8 border-white bg-white shadow-[0_0_60px_rgba(255,255,255,0.1)]" />

                <div className="w-80 bg-[#111] border-4 border-white p-6 flex flex-col gap-4 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">STICKERS</span>
                        <button onClick={() => setIsRunning(!isRunning)} className={`w-full py-2 border-4 font-black text-xs transition-all ${isRunning ? "bg-yellow-400 text-black border-black" : "bg-transparent border-white/20 hover:border-white"}`}>
                            {isRunning ? "STOP STICKERS" : "AJOUTER STICKERS"}
                        </button>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">DIFFÉRENTS PATTERNS</span>
                        <div className="flex gap-2">
                            <button onClick={generateNewPattern} className="flex-1 py-2 border-4 border-white bg-white text-black font-black text-[10px] hover:bg-pop-yellow hover:border-black transition-all">RANDOM PATTERN</button>
                            <button onClick={() => { bandsRef.current = []; stickersRef.current = []; }} className="px-3 border-4 border-white/20 hover:bg-red-500 transition-colors font-black">×</button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">ONDES AUDIO</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleToggleAudioFlow}
                                className={`flex-1 py-2 border-4 font-black text-xs transition-all ${isPlaying ? "bg-[#FF00FF] text-white border-black" : "bg-transparent border-white/20 hover:border-white"}`}
                            >
                                {isPlaying ? "PAUSE" : "LANCER ONDES ET MUSIQUE"}
                            </button>
                            <button
                                onClick={() => {
                                    smoothedData.current = new Array(barCount).fill(0);
                                    if (isPlaying) setIsPlaying?.(false);
                                }}
                                className="px-3 border-4 border-white/20 hover:bg-red-500 transition-colors font-black"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">COULEUR VAGUE</span>
                        <div className="grid grid-cols-6 gap-1">
                            {PALETTE.map((c) => <button key={c} onClick={() => setWaveColor(c)} className={`h-6 border-2 ${waveColor === c ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">FOND</span>
                        <div className="grid grid-cols-6 gap-1">
                            {["#FF0055", "#00CCFF", "#FFFF00", "#111", "#00FFCC"].map((c) => (
                                <button key={c} onClick={() => { setSurface(c); bandsRef.current = []; stickersRef.current = []; }} className={`h-6 border-2 ${surface === c ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] text-white/40 font-sans">COULEUR DU TEXTE</span>
                        <div className="grid grid-cols-6 gap-1">
                            {PALETTE.map((c) => <button key={c} onClick={() => setTextColor(c)} className={`h-6 border-2 ${textColor === c ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />)}
                        </div>
                    </div>

                    <button onClick={() => { const a = document.createElement("a"); a.download = 'pop-cover.png'; a.href = canvasRef.current!.toDataURL(); a.click(); }} className="mt-1 w-full py-3 bg-white text-black font-black text-xs hover:bg-pop-yellow transition-all active:scale-95">TÉLÉCHARGEZ VOTRE COVER</button>
                </div>
            </div>
        </section>
    );
}
