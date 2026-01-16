"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EXAMPLE_COVERS = [
  "/images/dua-lipa-cover-2.png",
  "/images/dua-lipa-cover-3.png",
  "/images/dua-lipa-cover-4.png",
  "/images/dua-lipa-cover-5.png",
  "/images/dua-lipa-cover-6.png",
  "/images/dua-lipa-cover-7.png",
  "/images/dua-lipa-cover-8.png",
  "/images/dua-lipa-cover-9.png",
  "/images/dua-lipa-cover-10.png",
];

export default function Footer() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
  const canvases = [canvasRef1.current, canvasRef2.current];
  const contexts = canvases.map(c => c?.getContext("2d"));
  
  const mid = Math.ceil(EXAMPLE_COVERS.length / 2);
  const set1 = EXAMPLE_COVERS.slice(0, mid);
  const set2 = EXAMPLE_COVERS.slice(mid);

  const loadImages = (sources: string[]) => sources.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });

  const imagesGroup1 = loadImages(set1);
  const imagesGroup2 = loadImages(set2);

  let offset1 = 0;
  let offset2 = 0;
  const speed = 1.2;
  const itemSize = 180;
  const gap = 40;
  const totalItemWidth = itemSize + gap;

  const drawFilmStrip = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    offset: number, 
    reverse: boolean, 
    imgSet: HTMLImageElement[]
  ) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#333";
    for (let i = 0; i < width + 30; i += 30) {
    ctx.fillRect(i - (offset % 30), 5, 15, 15); 
    ctx.fillRect(i - (offset % 30), height - 20, 15, 15); 
    }

    const xStart = reverse ? (offset % totalItemWidth) - totalItemWidth : -(offset % totalItemWidth);

    for (let i = -1; i < (width / totalItemWidth) + 1; i++) {
    const x = xStart + (i * totalItemWidth);
    const imgIndex = Math.abs(Math.floor((offset + (i * totalItemWidth)) / totalItemWidth)) % imgSet.length;
    const currentImg = imgSet[imgIndex];

    ctx.fillStyle = "white";
    ctx.fillRect(x - 5, 30, itemSize + 10, itemSize + 10);
    
    if (currentImg.complete && currentImg.naturalWidth > 0) {
      ctx.drawImage(currentImg, x, 35, itemSize, itemSize);
    } else {
      ctx.fillStyle = "#222";
      ctx.fillRect(x, 35, itemSize, itemSize);
    }
    }
  };

  const animate = () => {
    offset1 += speed;
    offset2 += speed;
    if (canvases[0] && contexts[0]) drawFilmStrip(contexts[0], canvases[0].width, canvases[0].height, offset1, false, imagesGroup1);
    if (canvases[1] && contexts[1]) drawFilmStrip(contexts[1], canvases[1].width, canvases[1].height, offset2, true, imagesGroup2);
    requestAnimationFrame(animate);
  };

  const handleResize = () => {
    canvases.forEach(c => {
    if (c) {
      c.width = window.innerWidth;
      c.height = 250;
    }
    });
  };

  window.addEventListener('resize', handleResize);
  handleResize();
  const animId = requestAnimationFrame(animate);
  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', handleResize);
  };
  }, []);

  return (
  <footer className="w-full bg-black py-16 overflow-hidden border-t-8 border-[#CCFF00] relative" id="footer-section">
    <div className="mb-6 px-10">
    <h3 className="text-[#CCFF00] font-black italic text-4xl uppercase tracking-tighter">
      GALERIE DES COVERS
    </h3>
    <p className="text-white/40 font-bold uppercase text-xs">Explorer les créations • Remixez les vôtres</p>
    </div>

    <div className="flex flex-col gap-4">
    <canvas ref={canvasRef1} className="w-full h-[250px]" />
    <canvas ref={canvasRef2} className="w-full h-[250px]" />
    </div>

    <div className="mt-12 flex flex-col items-center gap-8">
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      className="cursor-pointer group"
      onClick={scrollToTop}
    >
      <div className="flex flex-col items-center">
        <span className="text-[#CCFF00] font-black text-[10px] tracking-[0.2em] mb-2 group-hover:text-white transition-colors">BACK TO TOP</span>
        <svg width="40" height="20" viewBox="0 0 60 30" fill="none" className="rotate-180">
          <path d="M5 5L30 25L55 5" stroke="#CCFF00" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 5L30 25L55 5" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>

    <div className="bg-white text-black font-black px-6 py-2 uppercase italic text-sm -rotate-2">
      Sous IWID 2026 ©
    </div>
    </div>
  </footer>
  );
}
