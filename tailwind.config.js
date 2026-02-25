/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: 'var(--bg)',
          bg2: 'var(--bg2)',
          surface: 'var(--surface)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          border: 'var(--border)',
          border2: 'var(--border2)',
          accent: 'var(--accent)',
          accentFg: 'var(--accentFg)',
          ctaBg: 'var(--ctaBg)',
          ctaText: 'var(--ctaText)',
          success: 'var(--success)',
          danger: 'var(--danger)',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'paper': '16px',
      },
      boxShadow: {
        'edge': 'var(--shadowEdge)',
        'soft': 'var(--shadowSoft)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
