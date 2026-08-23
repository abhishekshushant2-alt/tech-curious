/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: '#0D1A12',
        bgElev: '#12241A',
        bgElev2: '#16291E',
        brass: '#C9A227',
        brassBright: '#E6C34A',
        copper: '#B0713F',
        silk: '#EDEAE1',
        silkDim: '#8FA396',
        line: 'rgba(201,162,39,0.14)',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
