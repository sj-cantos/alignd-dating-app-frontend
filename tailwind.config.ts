import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
      },
      colors: {
        main: '#88aaee',
        mainAccent: '#4d80e6',
        overlay: 'rgba(0,0,0,0.8)',
        bg: '#dfe5f2',
        text: '#000',
        darkBg: '#272933',
        darkText: '#eeefe9',
        darkBorder: '#000',
        secondaryBlack: '#212121',
      },
      borderRadius: {
        base: '5px',
      },
      boxShadow: {
        light: '4px 4px 0px 0px #000',
        dark: '4px 4px 0px 0px #000',
        "brutal": "4px 4px 0px 0px #000",
        "brutal-sm": "2px 2px 0px 0px #000",  
        "brutal-lg": "6px 6px 0px 0px #000",
        "brutal-xl": "8px 8px 0px 0px #000",
      },
      translate: {
        boxShadowX: '4px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-4px',
        reverseBoxShadowY: '-4px',
      },
      fontWeight: {
        base: '500',
        heading: '700',
      },
    },
  },
};

export default config;