const colors = require('tailwindcss/colors');
const defaults = require('tailwindcss/defaultConfig');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.js',
    './pages/**/*.{md,mdx}',
    './theme.config.js'
  ],
  theme: {
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
    },
    fontSize: {
      ...defaults.theme.fontSize,
      '5xl': ['3rem', {lineHeight: '1.2'}]
    },
    colors: {
      ...colors,
      slate: {
        ...colors.slate,
        850: 'hsl(222deg 47% 16%)'
      },
      primary: '#5fc3e7'
    }
  }
};
