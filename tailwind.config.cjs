module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        estheric: {
          50: '#f8fafc',
          100: '#eef2ff',
          200: '#e0e7ff',
          300: '#c7d2fe',
          400: '#a5b4fc',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065'
        },
        coral: {
          500: '#ff6b6b'
        },
        neutralbg: '#f6f8fb'
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        estheric: '0 6px 18px rgba(46,16,101,0.08)'
      }
    },
  },
  plugins: [],
}
