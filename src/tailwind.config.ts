import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pop-blue': '#0047AB',
        'pop-pink': '#FF1493',
        'pop-yellow': '#CCFF00',
        'pop-black': '#0a0a0a',
      },
      fontFamily: {
        'retro': ['var(--font-retro)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
