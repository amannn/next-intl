function makePrimaryColor(luminance) {
  return ({opacityValue}) =>
    `hsl(var(--nextra-primary-hue) var(--nextra-primary-saturation) ${luminance}%` +
    (opacityValue ? ` / ${opacityValue})` : ')');
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,tsx,md,mdx}'],
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
        primary: {
          50: makePrimaryColor(97),
          100: makePrimaryColor(94),
          200: makePrimaryColor(86),
          300: makePrimaryColor(77),
          400: makePrimaryColor(66),
          500: makePrimaryColor(50),
          600: makePrimaryColor(45),
          700: makePrimaryColor(39),
          750: makePrimaryColor(35),
          800: makePrimaryColor(32),
          900: makePrimaryColor(24)
        }
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
