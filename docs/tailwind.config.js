/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,tsx}',
    './pages/**/*.{md,mdx}',
    './theme.config.{js,tsx}'
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.69rem', {lineHeight: '1'}],
        '5xl': ['3rem', {lineHeight: '1.2'}]
      },
      colors: {
        slate: {
          850: 'hsl(222deg 47% 16%)'
        },
        primary: '#5fc3e7'
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: [
        'Monaco',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ]
    }
  }
};
