const defaultConfig = require('tailwindcss/defaultConfig');
const { TAILWIND_THEME } = require('./src/client/domain/common/constants/tailwind.constant');

module.exports = {
  darkMode: false,
  theme: {
    screen: TAILWIND_THEME.screens,
    container: TAILWIND_THEME.container,
    colors: TAILWIND_THEME.colors,
    fontFamily: {
      mono: [TAILWIND_THEME.fontFamily.mono, ...defaultConfig.theme.fontFamily.mono],
      sans: [TAILWIND_THEME.fontFamily.sans, ...defaultConfig.theme.fontFamily.sans],
      serif: [TAILWIND_THEME.fontFamily.serif, ...defaultConfig.theme.fontFamily.serif],
      helvetica: [TAILWIND_THEME.fontFamily.helvetica, ...defaultConfig.theme.fontFamily.sans],
    },
    extend: {
      ...TAILWIND_THEME.extend,
      outline: {
        blue: ['4px solid #0000ff', '2px'],
      }
    },
    zIndex: TAILWIND_THEME.zIndex,
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'checked'],
      borderColor: ['checked'],
      borderRadius: ['first', 'last'],
      borderWidth: ['first', 'last'],
      margin: ['first', 'last'],
      padding: ['first', 'last'],
      ringColor: ['focus'],
      textColor: ['active'],
      display: ["group-hover"]
    },
  },
  plugins: [require('@tailwindcss/ui')],
};
