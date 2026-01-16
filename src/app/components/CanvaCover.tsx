"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
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
    radio: drawRadio
};

const PALETTE = ["#00FFCC", "#FFFF00", "#FF00FF", "#FFFFFF", "#00CCFF", "#000000"];

interface Sticker {
    drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, f: string, r: number) => void;
    x: number;
    y: number;
    s: number;
    r: number;
    f: string;
}

export default function GenerativePopCanvas() {
    const { analyser, isPlaying, setIsPlaying } = useAudio() || {};
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [surface, setSurface] = useState("#FF0055");
    const [waveColor, setWaveColor] = useState("#CCFF00");
    const [textColor, setTextColor] = useState("#FFFFFF");
    
    const stickersRef = useRef<Sticker[]>([]);
    const lastTick = useRef<number>(0);
    const barCount = 30;
    const lastWaveData = useRef<number[]>(new Array(barCount).fill(0));
    const generationSpeed = 400;

    const scrollToFooter = () => {
        const footer = document.getElementById('footer-section');
        footer?.scrollIntoView({ behavior: 'smooth' });
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

        stickersRef.current.forEach((sticker) => {
            sticker.drawFn(ctx, sticker.x, sticker.y, sticker.s, sticker.f, sticker.r);
        });

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.fillStyle = textColor;
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

        const gap = 6; 
        const barWidth = (canvas.width - (barCount - 1) * gap) / barCount;
        const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
        if (analyser && isPlaying) analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = waveColor;
        for (let i = 0; i < barCount; i++) {
            const val = (isPlaying && analyser) ? (dataArray[i * 3 + 10] || 0) * 0.8 : lastWaveData.current[i];
            lastWaveData.current[i] = val;
            const barHeight = 6 + (val / 255) * 200;
            ctx.beginPath();
            ctx.roundRect(i * (barWidth + gap), canvas.height - barHeight, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
            ctx.fill();
        }
    }, [surface, waveColor, textColor, analyser, isPlaying]);

    useEffect(() => {
        let animationId: number;
        const loop = (time: number) => {
            if (isRunning && time - lastTick.current > generationSpeed) {
                stickersRef.current = [...stickersRef.current.slice(-20), createSticker()];
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
                <canvas ref={canvasRef} width={500} height={500} className="border-8 border-white bg-white shadow-[0_0_60px_rgba(255,255,255,0.2)]" />
                
                <div className="w-80 bg-[#111] border-4 border-white p-6 flex flex-col gap-5 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
                    <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-sans">STICKERS</span>
                        <button onClick={() => setIsRunning(!isRunning)} className={`w-full py-3 border-4 font-black text-xs transition-all ${isRunning ? 'bg-pop-yellow text-black border-black' : 'bg-transparent border-white/20 hover:border-white'}`}>
                            {isRunning ? "STOPPER STICKERS" : "AJOUTER STICKERS"}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-sans">MUSIQUE</span>
                        <button onClick={async () => { if(!isPlaying && analyser && 'context' in analyser && 'state' in analyser.context && analyser.context.state === 'suspended') await (analyser.context as AudioContext).resume(); setIsPlaying?.(!isPlaying); }} className={`w-full py-3 border-4 font-black text-xs transition-all ${isPlaying ? 'bg-[#FF00FF] text-white border-black' : 'bg-transparent border-white/20 hover:border-white'}`}>
                            {isPlaying ? "PAUSE" : "COMMENCER"}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-sans">FOND</span>
                        <div className="grid grid-cols-6 gap-1">
                            {["#FF0055", "#00CCFF", "#FFFF00", "#111", "#EEE", "#00FFCC"].map(c => (
                                <button key={c} onClick={() => {setSurface(c); stickersRef.current = [];}} className={`h-8 border-2 ${surface === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-sans">COULEUR TITRE</span>
                        <div className="grid grid-cols-6 gap-1">
                            {PALETTE.map(c => <button key={c} onClick={() => setTextColor(c)} className={`h-8 border-2 ${textColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-sans">COULEUR VAGUE</span>
                        <div className="grid grid-cols-6 gap-1">
                            {PALETTE.map(c => <button key={c} onClick={() => setWaveColor(c)} className={`h-8 border-2 ${waveColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
                        </div>
                    </div>
                    <button onClick={() => { const a = document.createElement('a'); a.download = 'dua-lipa-cover.png'; a.href = canvasRef.current!.toDataURL(); a.click(); }} className="w-full py-4 bg-white text-black font-black text-xs hover:bg-pop-yellow transition-transform active:scale-95">TÉLÉCHARGER VOTRE COVER</button>
                </div>
            </div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute bottom-10 cursor-pointer" onClick={scrollToFooter}>
                <svg width="60" height="30" viewBox="0 0 60 30"><path d="M5 5L30 25L55 5" stroke="#CCFF00" strokeWidth="12" strokeLinecap="round" fill="none" /><path d="M5 5L30 25L55 5" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" /></svg>
            </motion.div>
        </section>
    );
}
