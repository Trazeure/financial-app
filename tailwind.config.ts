import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: '#FFFFFF',
        border: '#E8E5E0',
        income: '#2D6A4F',
        'income-light': '#D8EDDF',
        expense: '#C1292E',
        'expense-light': '#FADADB',
        balance: '#1B2A4A',
        accent: '#D4A373',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6560',
        'text-muted': '#A09A94',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
