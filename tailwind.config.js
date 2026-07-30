/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../gvtech-design/dist/**/*.{js,mjs}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#F7F4EE',
          200: '#EFEAE1',
          300: '#E5E0D8',
          400: '#D5CEC2',
          900: '#2C302E',
        },
        ink: {
          primary: '#2C302E',
          muted: '#5A605C',
          light: '#8E9490',
          stamp: '#C84B31',
        },
        chip: {
          mustard: '#E5A93C',
          sage: '#6A9C78',
          terracotta: '#D96B43',
          navy: '#3B5998',
          purple: '#8B6B9C',
          rose: '#C97A8B',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
