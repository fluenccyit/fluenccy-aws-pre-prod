import React, { useMemo, useRef, useState } from 'react';
import { TAILWIND_THEME } from '@client/common';
import { VictoryChart, VictoryBar, VictoryStack, VictoryAxis, Bar } from 'victory';
import { CHART_FONT_SIZE, CHART_FONT_FAMILY, chartService } from '@client/chart';
import { InvoiceChartTooltip } from '@client/currency-management';

type Props = {
  data: object[];
  handleBarClick: Function;
  currency: string;
  selectedDate: string;
};

const getChartLabelStyle = (maxValue = 0) => ({
  axis: { stroke: TAILWIND_THEME.colors.transparent },
  axisLabel: { color: TAILWIND_THEME.colors.gray[500], fontFamily: CHART_FONT_FAMILY },
  tickLabels: {
    fill: TAILWIND_THEME.colors.gray[500],
    fontSize: maxValue.toString().length > 7 ? 4 : 6,
    fontFamily: CHART_FONT_FAMILY,
  },
});

const SELECT_STOKE_BORDER_COLOR = {
  1: 'rgb(7 149 81)',
  2: 'rgb(10 124 70 / 50%)',
  3: 'rgb(191 191 197)',
};

export const DashboardChart = ({ chartBarClickable, isFullWidth, data = [], handleBarClick, currency, homeCurrency, mode, selectedDate }: Props) => {
  const [isHover, setIsHover] = useState(false);
  const [hoverDetails, setHoverDetails] = useState({});

  const formattedData = useMemo(() => {
    let bar1Data = [];
    let bar3Data = [];
    const xLabels = [];
    let max = 0;
    const scatterData = [];

    data.forEach((r, i) => {
      const b1 = isNaN(Number(r.Forward)) ? 0 : Number(r.Forward);
      const b3 = isNaN(Number(r.Unmanaged)) ? 0 : Number(r.Unmanaged);
      bar1Data.push({
        x: i + 1,
        y: b1,
        isLast: !b3,
        isFirst: !!b1,
        date: r.dateDue,
        text: mode === 'receivables' ? 'Wallet' : 'Currency Reserved',
      });
      bar3Data.push({ x: i + 1, y: b3, isLast: !!b3, isFirst: !b1, date: r.dateDue, text: 'No Plan' });
      xLabels.push(r.dateDue);
      const sum = b1 + b3;
      scatterData.push({ x: i + 1, y: sum - 10 });
      if (max < sum) {
        max = sum;
      }
    });

    return {
      bar1Data,
      bar3Data,
      xLabels,
      max,
      scatterData,
    };
  }, [data, currency, homeCurrency, mode]);

  const BAR_WIDTH = 6;

  return (
    <div style={{ width: '100%' }}>
      <VictoryChart domainPadding={{ x: 20 }} padding={{ bottom: 20, left: 40, right: 0, top: 10 }} height={isFullWidth ? 140 : 180}>
        <VictoryAxis tickFormat={formattedData.xLabels} orientation="bottom" style={getChartLabelStyle()} />
        <VictoryAxis
          dependentAxis
          {...chartService.getYAxisAttrs({ domain: { y: [0, formattedData.max] } })}
          style={getChartLabelStyle(formattedData.max)}
          height={540}
        />
        <VictoryStack
          colorScale={[TAILWIND_THEME.colors.green['dark'], TAILWIND_THEME.colors.gray['light']]}
          events={[
            {
              childName: 'all',
              target: 'data',
              eventHandlers: {
                onClick: (props, y) => {
                  if (chartBarClickable) {
                    handleBarClick(y.datum.date);
                  }
                },
                onMouseOver: (props, y) => {
                  setIsHover(true);
                  setHoverDetails({ props, y });
                },
                onMouseOut: (props, y) => {
                  setIsHover(false);
                  setHoverDetails({});
                },
              },
            },
          ]}
        >
          <VictoryBar
            data={formattedData.bar1Data}
            barWidth={BAR_WIDTH}
            dataComponent={<CustomBar selectedDate={selectedDate} barWidth={BAR_WIDTH} />}
          />
          <VictoryBar
            data={formattedData.bar3Data}
            barWidth={BAR_WIDTH}
            dataComponent={<CustomBar selectedDate={selectedDate} barWidth={BAR_WIDTH} />}
          />
        </VictoryStack>
      </VictoryChart>
      {isHover && <InvoiceChartTooltip {...hoverDetails} datas={data} />}
    </div>
  );
};

const CustomBar = (props) => {
  const { isFirst, isLast, date, _stack, y } = props.datum;
  const BAR_WIDTH = props.barWidth;
  let style = {
    opacity: 1,
  };

  if (props.selectedDate && date !== props.selectedDate) {
    style.opacity = 0.3;
    style.strokeWidth = y === 0 ? 0 : 0.5;
    style.stroke = SELECT_STOKE_BORDER_COLOR[_stack];
  }

  if (props.selectedDate && date === props.selectedDate) {
    style.strokeWidth = y === 0 ? 0 : 1;
    style.stroke = SELECT_STOKE_BORDER_COLOR[_stack];
  }
  if (isFirst && isLast) {
    return <Bar {...props} cornerRadius={{ bottom: BAR_WIDTH / 2, top: BAR_WIDTH / 2 }} style={{ ...props.style, ...style }} />;
  } else if (isFirst) {
    return <Bar {...props} cornerRadius={{ bottom: BAR_WIDTH / 2 }} style={{ ...props.style, ...style }} />;
  } else if (isLast) {
    return <Bar {...props} cornerRadius={{ top: BAR_WIDTH / 2 }} style={{ ...props.style, ...style }} />;
  }
  return <Bar {...props} style={{ ...props.style, ...style }} />;
};
