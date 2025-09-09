/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        galmuri: ['Galmuri11', 'Galmuri9', 'Galmuri7', 'monospace'],
        'led-counter-7': ['LED Counter 7', 'sans-serif'],
      },
      colors: {
        'Brand1-Primary': '#f53b3b',
        'Brand1-Secondary': '#d43333',
        'Brand1-Tertiary': '#a62828',
        'Brand1-Strong': '#ff5454',

        'Brand2-Primary': '#2CD8CE',
        'Brand2-Secondary': '#20ACA4',
        'Brand2-Tertiary': '#167873',
        'Brand2-Strong': '#71E5DE',

        primary: '#f8fafc', // slate50
        secondary: '#cbd5e1', // slate300
        tertiary: '#94a3b8', // slate400
        subtle: '#64748b', // slate500
        inverse: '#0f172a', // slate900

        'BG-0': '#0f172a',
        'BG-1': '#1e293b',
        'BG-2': '#334155',
        'BG-3': '#475569',
        'BG-4': '#64748b',
        'BG-Inverse': '#F8FAFC',
        'BG-Dimmed': '#000000', // 투명도 설정정

        'stroke-1': '#94A3B8',
        'stroke-2': '#64748b',
        'stroke-3': '#475569',
        'stroke-4': '#0F172A',
        'stroke-subtle': '#94A3B8',
        'stroke-Strong': '#F8FAFC',
        'stroke-Inverse': '#0F172A',
      },
    },
  },
  plugins: [],
};
