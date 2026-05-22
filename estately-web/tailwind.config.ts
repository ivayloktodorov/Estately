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
          600: '#126b58',
          700: '#0f5a49',
          800: '#0b463a',
        },
      },
      boxShadow: {
        estate: '0 24px 70px rgba(23, 20, 17, 0.12)',
        'estate-soft': '0 14px 40px rgba(23, 20, 17, 0.08)',
      },
    },
  },
};

export default config;
