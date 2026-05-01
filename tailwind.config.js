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
        primary: '#F8E71C',
        'primary-shadow': '#C4B800',
        accent: '#F8E71C',
        background: '#0D0D0D',
        surface: '#1A1A1A',
        surface2: '#242424',
        border: 'rgba(255,255,255,0.1)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#999999',
        'text-muted': '#555555',
        green: '#00C853',
        yellow: '#F8E71C',
        red: '#FF4444',
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
