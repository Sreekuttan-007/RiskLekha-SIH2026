/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate-navy': '#4B5D76',
        'dark-navy': '#26364D',
        'risklekha-orange': '#F47A20',
        'risklekha-green': '#2F944C',
        'risklekha-bg': '#F7F8FA',
        'risklekha-border': '#DCE2E8',
        'critical-red': '#D64545',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
