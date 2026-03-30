/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#252535',
        },
        accent: {
          cyan: '#00f0ff',
          purple: '#a855f7',
          red: '#ef4444',
          yellow: '#eab308',
          green: '#22c55e',
        }
      },
      animation: {
        'pulse-emergency': 'pulseEmergency 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseEmergency: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)', borderColor: 'rgba(239, 68, 68, 0.8)' },
          '50%': { boxShadow: '0 0 40px rgba(239, 68, 68, 0.9)', borderColor: 'rgba(239, 68, 68, 1)' },
        },
        glow: {
          '0%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
