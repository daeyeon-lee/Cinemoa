/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#0f172a',
        bg0: '#0f172a',
        bg1: '#1e293b',
        bg2: '#334155',
        bg3: '#475569',
        bg4: '#64748b',
      },
    },
  },
  plugins: [],
};
