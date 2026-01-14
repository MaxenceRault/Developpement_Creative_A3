"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const { currentTheme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(0);
  const rotateY = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const springRotate = useSpring(rotateY, {
    stiffness: 40,
    damping: 15,
    mass: 2,
  });

  const lastX = useRef(0);
  const lastTime = useRef(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = performance.now();
    const dt = now - lastTime.current;
    const dx = e.clientX - lastX.current;

    const isInsideZone =
      e.clientX > windowWidth * 0.3 && e.clientX < windowWidth * 0.7;

    if (dt > 0 && isInsideZone) {
      const velocity = dx / dt;
      rotateY.set(rotateY.get() + velocity * 20);
    }

    lastX.current = e.clientX;
    lastTime.current = now;
  };

  const textDua = " DUA LIPA • RADICAL OPTIMISM • DUA LIPA • RADICAL OPTIMISM •";
  const textDua3 = " DUA LIPA •";
  const textFuture = " FUTURE NOSTALGIA • HOUDINI • TRAINING SEASON • ILLUSION •";

  return (
    <header
      className="relative h-screen w-full flex items-center justify-center bg-pop-turquoise overflow-hidden select-none transition-colors duration-700"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none scale-150">
        <div className={`h-64 ${currentTheme.primary} flex items-center overflow-hidden -rotate-6 w-[140vw] -mb-16 z-0 transition-colors duration-500`}>
          <div className="animate-marquee whitespace-nowrap flex">
            <span className={`${currentTheme.textOnPrimary} font-black text-[12rem] italic uppercase leading-none`}>
              {textDua3}{textDua3}{textDua3}{textDua3}{textDua3}
            </span>
          </div>
        </div>

        <div className={`h-64 ${currentTheme.secondary} flex items-center overflow-hidden rotate-3 w-[140vw] z-20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-colors duration-500`}>
          <div className="animate-marquee-reverse whitespace-nowrap flex">
            <span className={`${currentTheme.textOnSecondary} font-black text-[12rem] italic uppercase leading-none`}>
              {textFuture}{textFuture}
            </span>
          </div>
        </div>

        <div className={`h-64 ${currentTheme.tertiary} flex items-center overflow-hidden -rotate-2 w-[140vw] -mt-12 z-10 transition-colors duration-500`}>
          <div className="animate-marquee whitespace-nowrap flex">
            <span className={`${currentTheme.textOnTertiary} font-black text-[12rem] italic uppercase leading-none`}>
              {textDua}{textDua}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-30" style={{ perspective: "2500px" }}>
        <motion.div
          style={{
            rotateY: springRotate,
            transformStyle: "preserve-3d",
          }}
          className="relative w-96 h-96 md:w-[700px] md:h-[700px]"
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/images/Dualipa.png"
                alt="Dua Lipa"
                fill
                className="object-contain scale-[2.5] drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-center"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <h2 
              className="font-black italic text-8xl md:text-[11rem] uppercase leading-[0.7] tracking-tighter"
              style={{ 
                WebkitTextStroke: `5px white`,
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" 
              }}
            >
              NEW<br />ALBUM<br />OUT<br />NOW
            </h2>
          </div>
        </motion.div>
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

      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </header>
  );
}