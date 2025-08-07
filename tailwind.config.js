/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystical: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9ddff',
          300: '#d6c1ff',
          400: '#bc97ff',
          500: '#a16aff',
          600: '#8b3fff',
          700: '#7c2aff',
          800: '#6b21d6',
          900: '#5a1cb8',
          950: '#3b0f7a',
        },
        lunar: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        'mystical': ['Crimson Text', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mystical-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'lunar-gradient': 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
        'card-gradient': 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
      }
    },
  },
  plugins: [],
}