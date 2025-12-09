import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Larger tap targets for tablets
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'touch': ['18px', '28px'], // Optimized for touch
      },
    },
  },
  plugins: [],
}
export default config