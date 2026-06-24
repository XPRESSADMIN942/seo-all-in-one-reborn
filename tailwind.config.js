/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Example primary color, adjust as needed based on original
        secondary: '#1e293b', // Example secondary
        'base-100': '#f3f4f6',
        'base-content': '#1f2937',
        'subtle-border': '#e5e7eb',
      }
    },
  },
  plugins: [],
}
