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
      fontSize: {
        h1: ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
        h2: ['1.875rem', { lineHeight: '1.3', fontWeight: '500' }],
        'h2-b': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h3-b': ['1.5rem', { lineHeight: '1.4', fontWeight: '700' }],
        h4: ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h4-b': ['1.25rem', { lineHeight: '1.4', fontWeight: '700' }],
        h5: ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'h5-b': ['1.125rem', { lineHeight: '1.5', fontWeight: '700' }],
        h6: ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'h6-b': ['1rem', { lineHeight: '1.5', fontWeight: '700' }],
        p1: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'p1-b': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        p2: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'p2-b': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        p3: ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'p3-b': ['0.75rem', { lineHeight: '1.5', fontWeight: '600' }],
        caption1: ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption1-b': ['11px', { lineHeight: '1.4', fontWeight: '600' }],
        caption2: ['10px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption2-b': ['10px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      colors: {
        'Brand1-Primary': '#E83045',
        'Brand1-Secondary': '#B92D38',
        'Brand1-Tertiary': '#942429',
        'Brand1-Strong': '#FF5768',

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
        'stroke-4': '#334155',
        'stroke-Subtle': '#94A3B8',
        'stroke-Strong': '#F8FAFC',
        'stroke-Inverse': '#0F172A',

        // shadcn/ui 색상들
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
