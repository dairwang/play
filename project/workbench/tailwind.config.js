/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E94560',
        secondary: '#0F3460',
        dark: '#1A1A2E',
        light: '#16213E',
      }
    },
  },
  plugins: [],
}
