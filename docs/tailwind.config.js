const colors = require('tailwindcss/colors');
const defaults = require('tailwindcss/defaultConfig');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,tsx}',
    './pages/**/*.{md,mdx}',
    './theme.config.{js,tsx}'
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
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      slate: {
        ...colors.slate,
        850: 'hsl(222deg 47% 16%)'
      },
      primary: '#5fc3e7'
    }
  }
};
