/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ice: '#F9FDFF',
        mist: '#EEF1FA',
        line: '#DFE3F1',
        navy: '#3A43A4',
        royal: '#1F55E1',
        violet: '#5A66F6',
        lime: '#41D92A',
        leaf: '#4EA531',
        ink: '#0A0A0A',
        slate: '#151A3B',
        muted: '#676E92',
        amber: '#F2A516',
        danger: '#E5484D',
      },
      fontFamily: { sans: ['Outfit', '"Neulis Neue"', 'system-ui', 'sans-serif'] },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        float: '0 18px 40px -18px rgba(31,40,110,.45)',
        soft: '0 6px 20px -10px rgba(31,40,110,.25)',
      },
    },
  },
  plugins: [],
}
