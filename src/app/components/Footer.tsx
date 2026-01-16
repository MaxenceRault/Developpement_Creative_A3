"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EXAMPLE_COVERS = [
  "/images/pop-cover (10).png",
  "/images/pop-cover (11).png",
  "/images/pop-cover (12).png",
  "/images/pop-cover (13).png",
  "/images/pop-cover (14).png",
  "/images/pop-cover (15).png",
  "/images/pop-cover (16).png",
  "/images/pop-cover (17).png",
  "/images/pop-cover (18).png",
  "/images/pop-cover (19).png",
];

export default function Footer() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const canvas1 = canvasRef1.current;
    const canvas2 = canvasRef2.current;
    const ctx1 = canvas1?.getContext("2d");
    const ctx2 = canvas2?.getContext("2d");
    if (!canvas1 || !canvas2 || !ctx1 || !ctx2) return;

    const mid = Math.ceil(EXAMPLE_COVERS.length / 2);
    const set1Sources = EXAMPLE_COVERS.slice(0, mid);
    const set2Sources = EXAMPLE_COVERS.slice(mid);

    const loadImages = (sources: string[]) =>
      sources.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });

    const images1 = loadImages(set1Sources);
    const images2 = loadImages(set2Sources);

    let offset1 = 0;
    let offset2 = 0;

    const speed = 1.2;
    const itemSize = 180;
    const gap = 40;
    const totalW = itemSize + gap;

    const drawStrip = (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      imgSet: HTMLImageElement[],
      offset: number,
      direction: "left" | "right"
    ) => {
      const w = canvas.width;
      const h = canvas.height;
      const loopWidth = imgSet.length * totalW;

      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#333";
      const holeShift = offset % 30;
      for (let i = -30; i < w + 60; i += 30) {
        const xHole = direction === "left" ? i - holeShift : i + holeShift - 30;
        ctx.fillRect(xHole, 5, 15, 15);
        ctx.fillRect(xHole, h - 20, 15, 15);
      }

      const numRepeats = 3;
      
      for (let r = 0; r < numRepeats; r++) {
        imgSet.forEach((img, i) => {
          let x: number;
          const basePos = (r * loopWidth) + (i * totalW);

          if (direction === "left") {
            x = basePos - (offset % loopWidth);
          } else {
            x = basePos + (offset % loopWidth) - (loopWidth * 1.5);
          }

          if (x > -totalW && x < w + totalW) {
            ctx.fillStyle = "white";
            ctx.fillRect(x - 5, 30, itemSize + 10, itemSize + 10);
            if (img.complete) {
              ctx.drawImage(img, x, 35, itemSize, itemSize);
            } else {
              ctx.fillStyle = "#222";
              ctx.fillRect(x, 35, itemSize, itemSize);
            }
          }
        });
      }
    };

    let rafId: number;
    const animate = () => {
      offset1 += speed;
      offset2 += speed;

      drawStrip(ctx1, canvas1, images1, offset1, "left");
      drawStrip(ctx2, canvas2, images2, offset2, "right");

      rafId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas1.width = window.innerWidth;
      canvas2.width = window.innerWidth;
      canvas1.height = 250;
      canvas2.height = 250;
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <footer className="w-full bg-black py-16 overflow-hidden border-t-8 border-pop-yellow relative" id="footer-section">
      <div className="mb-8 px-10">
        <h3 className="text-pop-yellow font-black italic text-5xl uppercase tracking-tighter leading-none">
          GALERIE DES COVERS
        </h3>
        <p className="text-white/40 font-bold uppercase text-sm mt-2">
          Explorer les créations • Remixez les vôtres
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <canvas ref={canvasRef1} className="w-full h-62.5" />
        <canvas ref={canvasRef2} className="w-full h-62.5" />
      </div>

      <div className="mt-16 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="cursor-pointer group"
          onClick={scrollToTop}
        >
          <div className="flex flex-col items-center">
            <span className="text-pop-yellow font-black text-[11px] tracking-[0.3em] mb-3 group-hover:text-white transition-colors">
              BACK TO TOP
            </span>
            <svg width="40" height="20" viewBox="0 0 60 30" fill="none" className="rotate-180">
              <path d="M5 5L30 25L55 5" stroke="#CCFF00" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 5L30 25L55 5" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>

        <div className="bg-pop-yellow text-black font-black px-8 py-2 uppercase italic text-sm -rotate-2 shadow-[4px_4px_0px_0px_white]">
          SOUS IWID 2026 ©
        </div>
      </div>
    </footer>
  );
}
