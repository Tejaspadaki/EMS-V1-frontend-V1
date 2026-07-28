/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A237E',
          light: '#283593',
          dark: '#121856',
        },
        secondary: {
          DEFAULT: '#3949AB',
          light: '#5C6BC0',
          dark: '#2E3B8E',
        },
        accent: {
          DEFAULT: '#00897B',
          light: '#26A69A',
          dark: '#00695C',
        },
        emsBackground: '#F5F7FA',
      },
      borderRadius: {
        lg: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
