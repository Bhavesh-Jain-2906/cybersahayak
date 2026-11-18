/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vanta Black palette (pure pitch blacks & ultra-deep voids)
        vanta: {
          DEFAULT: '#000000',
          50: '#0d1527',
          100: '#0a101f',
          200: '#070c18',
          300: '#050912',
          400: '#03060c',
          500: '#020408',
          600: '#010204',
          700: '#010102',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        // Cyber Electric Blue secondary palette
        cyber: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Electric vibrant blue
          600: '#2563eb', // Royal cyber blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#081026',
        },
        // Shield dark elevation palette
        shield: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#0c1222',
          900: '#060a15',
          950: '#000000', // Pure Vanta Black
        },
      },
      boxShadow: {
        'cool-blue-xs': '0 0 10px -2px rgba(59, 130, 246, 0.3)',
        'cool-blue': '0 0 20px -2px rgba(59, 130, 246, 0.45)',
        'cool-blue-lg': '0 0 35px -5px rgba(37, 99, 235, 0.55), 0 0 15px rgba(96, 165, 250, 0.35)',
        'cool-blue-xl': '0 0 50px -5px rgba(37, 99, 235, 0.6), 0 0 25px rgba(59, 130, 246, 0.4)',
        'vanta-card': '0 10px 30px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(59, 130, 246, 0.18), 0 0 20px -5px rgba(37, 99, 235, 0.2)',
        'vanta-hover': '0 15px 35px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(59, 130, 246, 0.45), 0 0 30px -3px rgba(37, 99, 235, 0.45)',
        'vanta-composer': '0 12px 40px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 25px -4px rgba(37, 99, 235, 0.3)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Courier New',
          'monospace',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'blue-glow': 'blueGlow 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blueGlow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
