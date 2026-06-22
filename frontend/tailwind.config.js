/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        juniper: '#6D9891',
        napa: '#AFAC9B',
        cameo: '#E0C1A5',
        geraldine: '#F69F83',
        russett: '#76575D',
        darkBg: '#E0C1A5',
        darkCard: 'rgba(255, 250, 244, 0.58)',
        darkBorder: 'rgba(118, 87, 93, 0.22)',
        accent: '#6D9891',
        accentHover: '#5F867F',
        trendUp: '#6D9891',
        trendDown: '#F69F83',
        textPrimary: '#76575D',
        textSecondary: '#6D9891',
        textMuted: '#8E8474',
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
