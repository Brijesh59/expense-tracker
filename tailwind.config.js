/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#7C6AF7',
        accent: '#F59E6B',
        background: '#0F0F14',
        surface: '#1A1A24',
        surface2: '#242433',
        border: '#2E2E42',
        'text-primary': '#F0F0F8',
        'text-secondary': '#8888A8',
        'text-muted': '#55556A',
        green: '#4ECDC4',
        yellow: '#F7DC6F',
        red: '#FF6B6B',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
