import React, { memo, ReactNode, SVGProps } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { CHART_FONT_SIZE, CHART_FONT_FAMILY } from '@client/chart';

type Props = SVGProps<SVGTextElement> & {
  children: ReactNode;
  fontSize: number;
};

export const ChartText = memo(({ children, fontSize = CHART_FONT_SIZE.text3Xs, ...rest }: Props) => (
  <text fill={TAILWIND_THEME.colors.gray[500]} fontFamily={CHART_FONT_FAMILY} fontSize={fontSize} {...rest}>
    {children}
  </text>
));
