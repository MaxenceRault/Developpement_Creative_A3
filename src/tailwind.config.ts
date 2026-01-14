// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // AJOUTE CECI :
  safelist: [
    'bg-pop-blue', 'bg-pop-pink', 'bg-pop-yellow',
    'text-pop-blue/30', 'text-pop-pink/30', 'text-pop-yellow/30',
    'text-pop-blue/40', 'text-pop-pink/40', 'text-pop-yellow/40',

  ],
  theme: {
    extend: {
      colors: {
        'pop-blue': '#0047AB',
        'pop-pink': '#FF1493',
        'pop-yellow': '#CCFF00',
        'pop-black': '#0a0a0a',
        'pop-green': '#32FF7E',
      },
    },
  },
};

export default config;