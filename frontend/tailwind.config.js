/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#EA580C', hover: '#C2410C', light: '#FFF7ED', soft: '#FEF3E8' }
      },
      fontFamily: { sans: ['DM Sans', 'system-ui', 'sans-serif'] },
      fontSize: { '2xs': '0.65rem' }
    }
  },
  plugins: []
}
