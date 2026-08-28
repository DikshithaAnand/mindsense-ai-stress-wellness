module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0f1a2e',
        'dark-blue': '#1a2540',
        'blue-gray': '#2d3748',
        lavender: '#e8d5f2',
        teal: '#5fc3d0',
        'text-light': '#e8e8e8'
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui']
      }
    }
  },
  plugins: []
}
