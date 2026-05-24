import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fbfaf7',
          100: '#f5f0e8',
          200: '#e9dece',
        },
        charcoal: {
          800: '#25211d',
          900: '#171411',
          950: '#0f0d0b',
        },
        estate: {
          50: '#f4f1ff',
          100: '#ebe5ff',
          200: '#d9ccff',
          300: '#bba6ff',
          600: '#6d52c8',
          700: '#1a103d',
          800: '#120a2e',
          900: '#090615',
        },
        primary: '#1a103d',
        'primary-hover': '#120a2e',
        secondary: '#8c68fd',
        accent: '#f67bc8',
        'brand-purple': '#8c68fd',
        'brand-pink': '#f67bc8',
      },
      boxShadow: {
        estate: '0 24px 70px rgba(23, 20, 17, 0.12)',
        'estate-soft': '0 14px 40px rgba(23, 20, 17, 0.08)',
      },
    },
  },
};

export default config;
