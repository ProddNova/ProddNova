import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        urban: {
          900: '#09090b',
          800: '#111217',
          700: '#1b1d26',
          500: '#2c3140',
          300: '#97a3bd',
          100: '#e2e8f0'
        },
        accent: '#22d3ee'
      }
    }
  },
  plugins: []
};

export default config;
