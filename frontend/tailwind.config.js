/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VINtegrity brand colors
        brand: {
          gold: '#E8B84C',
          orange: '#E1A04C',
          'dark-orange': '#D4784A',
          crimson: '#BE3748',
          'deep-crimson': '#8B2635',
        },
        // UI Colors
        integrity: {
          50: '#FEF9F0',
          100: '#FDF0DC',
          200: '#FBDDB5',
          300: '#F5C57A',
          400: '#E8B84C',
          500: '#D4784A',
          600: '#BE3748',
          700: '#8B2635',
          800: '#5C1A24',
          900: '#2D0D12',
        },
        // Neutral grays with warm undertone
        slate: {
          50: '#FAFAFA',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        }
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #BE3748 0%, #D4784A 50%, #E8B84C 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, rgba(190,55,72,0.1) 0%, rgba(232,184,76,0.1) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(232,184,76,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(190,55,72,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(212,120,74,0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(190, 55, 72, 0.15)',
        'brand-lg': '0 10px 40px -10px rgba(190, 55, 72, 0.2)',
        'glow': '0 0 20px rgba(232, 184, 76, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 184, 76, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 184, 76, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
