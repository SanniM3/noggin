import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette - bold arcade-inspired
        noggin: {
          bg: 'var(--noggin-bg)',
          surface: 'var(--noggin-surface)',
          surfaceHover: 'var(--noggin-surface-hover)',
          border: 'var(--noggin-border)',
          text: 'var(--noggin-text)',
          textMuted: 'var(--noggin-text-muted)',
          primary: 'var(--noggin-primary)',
          primaryHover: 'var(--noggin-primary-hover)',
          accent: 'var(--noggin-accent)',
        },
        // Rule colors - colorblind-safe
        rule: {
          bookend: '#2563eb',      // Blue
          middle: '#ea580c',       // Orange
          initials: '#059669',     // Emerald
          neither: '#dc2626',      // Red
          association: '#7c3aed',  // Violet
          dissociation: '#0891b2', // Cyan
          describe: '#c026d3',     // Fuchsia
        },
        // Feedback colors
        feedback: {
          correct: '#22c55e',
          warning: '#f59e0b',
          incorrect: '#ef4444',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'letter': ['12rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'letter-sm': ['8rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      animation: {
        'flip-in': 'flipIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 0.6s ease-out',
        'shake': 'shake 0.5s ease-out',
        'float-up': 'floatUp 1s ease-out forwards',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '70%': { boxShadow: '0 0 0 20px rgba(34, 197, 94, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        confetti: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 30px rgba(var(--noggin-primary-rgb), 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
