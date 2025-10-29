import React from 'react';
import { TAILWIND_THEME } from '@client/common';

export const CHART_AREA_GRADIENT_REFERENCE_ID = {
  blue: 'flnc-chart-area-gradient-blue',
  orange: 'flnc-chart-area-gradient-orange',
  green: 'flnc-chart-area-gradient-green',
};

export const CHART_AREA_GRADIENT_FILL = {
  blue: `url(#${CHART_AREA_GRADIENT_REFERENCE_ID.blue})`,
  orange: `url(#${CHART_AREA_GRADIENT_REFERENCE_ID.orange})`,
  green: `url(#${CHART_AREA_GRADIENT_REFERENCE_ID.green})`,
};

export const ChartAreaGradientReference = () => (
  <svg height={0} width={0} viewBox="0 0 0 0">
    <defs>
      <linearGradient id={CHART_AREA_GRADIENT_REFERENCE_ID.blue} gradientTransform="rotate(90)">
        <stop offset="0" stopColor={TAILWIND_THEME.colors.blue[400]} stopOpacity="0" />
        <stop offset="100%" stopColor={TAILWIND_THEME.colors.white} stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={CHART_AREA_GRADIENT_REFERENCE_ID.orange} gradientTransform="rotate(90)">
        <stop offset="0" stopColor={TAILWIND_THEME.colors.orange[500]} stopOpacity="0.2" />
        <stop offset="100%" stopColor={TAILWIND_THEME.colors.white} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={CHART_AREA_GRADIENT_REFERENCE_ID.green} gradientTransform="rotate(90)">
        <stop offset="0" stopColor={TAILWIND_THEME.colors.green[400]} stopOpacity="0.2" />
        <stop offset="100%" stopColor={TAILWIND_THEME.colors.white} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
