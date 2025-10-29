// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindColors = require('@tailwindcss/ui/colors');

// To avoid inline styles - and due to Tailwinds non typescript approach - we are storing the following const here, as it forms the best balance
// between number and string for chart height which requires it to be both calc'able and a css value.
// @TODO: This isn't ideal. We should come up with a more consistent way to overcome this limitation.
export const CHART_HEIGHT = 600;
export const CURRENCY_SCORE_CHART_HEIGHT = 500;
export const CURRENCY_SCORE_CHART_MOBILE_HEIGHT = 300;
export const DASHBOARD_CHART_HEIGHT = 350;
export const DASHBOARD_CHART_MIN_WIDTH = 760;

export const TAILWIND_SCREEN_SM = 640;
export const TAILWIND_SCREEN_MD = 768;
export const TAILWIND_SCREEN_LG = 1024;
export const TAILWIND_SCREEN_XL = 1280;
export const TAILWIND_SCREEN_2XL = 1536;

export const TAILWIND_THEME = {
  screens: {
    sm: `${TAILWIND_SCREEN_SM}px`,
    md: `${TAILWIND_SCREEN_MD}px`,
    lg: `${TAILWIND_SCREEN_LG}px`,
    xl: `${TAILWIND_SCREEN_XL}px`,
    '2xl': `${TAILWIND_SCREEN_2XL}px`,
  },
  container: {
    screens: {
      sm: '100%',
      md: '100%',
      lg: '1024px',
      xl: '1280px',
    },
  },
  colors: {
    transparent: 'transparent',
    black: tailwindColors.black,
    white: tailwindColors.white,
    gray: {
      50: '#FAFAFA',
      100: '#FCFCFD',
      150: '#F9F9FB',
      200: '#F0F1F8',
      300: '#DEDFEA',
      400: '#E8E9F3',
      450: '#C4C5D6',
      500: '#7D7E8D',
      550: '#49425E',
      600: '#222222',
      900: '#1C1336',
      light: '#F0F1F8'
    },
    green: {
      200: '#CFF2E1',
      300: '#70D7A5',
      400: '#40C988',
      500: '#10BC6A',
      600: '#088349',
      dark: '#10BC6A',
      light: 'rgba(16, 188, 106, 0.5)',
    },
    blue: {
      200: '#DBE2FE',
      300: '#F1F4FF',
      400: '#C3D8FF',
      500: '#4D6CFA',
      600: '#3E56C8',
    },
    red: {
      200: '#FFE1E4',
      300: '#F8B4B4',
      500: '#FF6978',
      600: '#E02424',
    },
    orange: {
      200: '#FFDBB1',
      500: '#FEA43B',
    },
    'xero-blue': '#1AB4D7',
    'xero-blue-dark': '#189CBA',
  },
  fontFamily: {
    mono: 'IBMPlexMono',
    sans: 'IBMPlex',
    serif: 'KeiseiOpti',
    helvetica: 'Helvetica'
  },
  zIndex: {
    '1': 1,
    toast: 1300,
    modal: 1200,
    dropdown: 1100,
    header: 1000,
    banner: 900,
  },
  extend: {
    height: {
      '4.5': '18px',
      'currency-advice-img': '48px',
      'currency-score-chart-mobile': `${CURRENCY_SCORE_CHART_MOBILE_HEIGHT}px`,
      'currency-score-chart': `${CURRENCY_SCORE_CHART_HEIGHT}px`,
      'dashboard-chart': `${DASHBOARD_CHART_HEIGHT}px`,
      chart: `${CHART_HEIGHT}px`,
    },
    padding: {
      26: '6.5rem',
    },
    width: {
      '4.5': '18px',
      'onboarding-form': '520px',
    },
    minWidth: {
      'chart-breakdown': '350px',
      'dashboard-breakdown': '350px',
      'dashboard-chart': `${DASHBOARD_CHART_MIN_WIDTH}px`,
      'invoice-table': '1200px',
      'onboarding-form': '520px',
      'organisation-breakdown': '350px',
      chart: '1200px',
    },
    maxWidth: {
      'chart-breakdown': '350px',
      'dashboard-breakdown': '350px',
      'dashboard-currency-score': '350px',
      'organisation-breakdown': '350px',
    },
    minHeight: {
      'factors-lg-screens': '300px',
    },
  },
};
