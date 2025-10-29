import React from 'react';
import { VictoryAxisProps, VictoryChartProps, VictoryPortal } from 'victory';
import { CHART_HEIGHT, TAILWIND_THEME } from '@client/common';
import { CHART_FONT_FAMILY, ChartMonthYearLabels, CHART_STYLE, CHART_FONT_SIZE } from '@client/chart';

type GetChartAttrsParam = {
  xDomainPadding?: number;
  yDomainPadding?: number;
  width: number;
  isDoubleAxes?: boolean;
};

type DomainTuple = [number, number];
type DomainType = { x?: DomainTuple; y: DomainTuple } | { x: DomainTuple; y?: DomainTuple } | DomainTuple;

type GetYAxisAttrsParam = {
  domain: DomainType;
  isGrid?: boolean;
  isRight?: boolean;
};

type GetXAxisAttrsParam = {
  hoverIndex?: number;
};

// Because Victory doesn't seem to allow us to create custom React components around the `VictoryChart` or `VictoryAxis` components, we have pulled
// out the common attributes to a service, and inject those attributes to the Victory components directly. It's not 100% reusable components, but it's
// the best we can do without being able to create a React component.
class ChartService {
  getChartAttrs = ({ xDomainPadding = 0, yDomainPadding = 0, width, isDoubleAxes = false }: GetChartAttrsParam): VictoryChartProps => ({
    domainPadding: { y: yDomainPadding, x: xDomainPadding },
    padding: {
      top: CHART_STYLE.xAxisHeight,
      bottom: 20,
      left: CHART_STYLE.yAxisWidth,
      right: isDoubleAxes ? CHART_STYLE.yAxisWidth : 0,
    },
    height: CHART_HEIGHT,
    width: width,
    style: { parent: { fontFamily: CHART_FONT_FAMILY } },
  });

  getYAxisAttrs = ({ domain, isGrid, isRight }: GetYAxisAttrsParam): VictoryAxisProps => {
    const yAxisAttrs: VictoryAxisProps = {
      crossAxis: false,
      dependentAxis: true,
      domain,
      orientation: isRight ? 'right' : 'left',
      style: {
        axis: { stroke: TAILWIND_THEME.colors.transparent },
        axisLabel: { color: TAILWIND_THEME.colors.gray[500], fontFamily: CHART_FONT_FAMILY },
        tickLabels: {
          fill: TAILWIND_THEME.colors.gray[500],
          fontSize: CHART_FONT_SIZE.text2Xs,
          fontFamily: CHART_FONT_FAMILY,
        },
      },
    };

    if (isGrid && yAxisAttrs.style) {
      yAxisAttrs.style.grid = { stroke: TAILWIND_THEME.colors.gray[200] };
    }

    return yAxisAttrs;
  };

  getXAxisAttrs = ({ hoverIndex }: GetXAxisAttrsParam): VictoryAxisProps => ({
    orientation: 'top',
    style: { axis: { stroke: 'transparent' } },
    tickLabelComponent: (
      <VictoryPortal>
        <ChartMonthYearLabels hoverIndex={hoverIndex} />
      </VictoryPortal>
    ),
  });
}

export const chartService = new ChartService();
