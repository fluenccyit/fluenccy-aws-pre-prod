import React, { memo, useEffect, useState } from 'react';
import numeral from 'numeral';
import { isSameDay } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { first, last, maxBy, minBy } from 'lodash';
import { VictoryChart, VictoryAxis, VictoryScatter, VictoryArea, VictoryPortal } from 'victory';
import { AUTH_ROUTES } from '@client/auth';
import { queryRates } from '@client/rate';
import { GqlSupportedCurrency } from '@graphql';
import { sharedDateTimeService } from '@shared/common';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { InvoiceTableRowChartTooltip, INVOICE_TABLE_CHART } from '@client/invoice';
import { PaymentDetails, PaymentCostVariance, sharedPaymentService } from '@shared/payment';
import { APOLLO_ERROR_MESSAGE, FluenccyLoader, TAILWIND_THEME, Text, uiVar } from '@client/common';
import { ChartAreaGradientReference, CHART_AREA_GRADIENT_FILL, CHART_FONT_FAMILY } from '@client/chart';

type Props = {
  paymentDetails: PaymentDetails;
  chartWidth: number;
};

export const InvoiceTableRowChart = memo(({ paymentDetails, chartWidth, mode }: Props) => {
  const history = useHistory();
  const { actualCost, datePaid, dateRaised } = paymentDetails;
  const { chartCurrency } = useQueryLocalChart();
  const { organisation } = useQueryLocalOrganisation();
  const [costVariance, setCostVariance] = useState<PaymentCostVariance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  let maxValue = 0;
  let minValue = 0;

  useEffect(() => {
    (async () => {
      try {
        if (!organisation || !chartCurrency) {
          setCostVariance([]);
          return;
        }

        const rates = await queryRates({
          baseCurrency: organisation.currency as GqlSupportedCurrency,
          tradeCurrency: chartCurrency,
          dateFrom: sharedDateTimeService.getUtcDateAsIsoString(paymentDetails.dateRaised),
        });

        setCostVariance(sharedPaymentService.getCostVariance({ paymentDetails, rates }));
        uiVar('ready');
        setIsLoading(false);
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          setIsError(true);
          uiVar('ready');
          setIsLoading(false);
        }
      }
    })();
  }, []);

  const renderTitle = () => (
    <Text className="text-sm font-medium mb-4 pl-3" isBlock>
      Cost Variance {chartCurrency || ''}
    </Text>
  );

  if (isLoading) {
    return (
      <td colSpan={INVOICE_TABLE_CHART.numCols} className="bg-white border-t-1 border-b-1 border-gray-500 px-4">
        {renderTitle()}
        <div className="w-full flex items-center justify-center h-36">
          <FluenccyLoader className="w-16" variant="gray" />
        </div>
      </td>
    );
  }

  // @TODO handle error state
  if (!chartCurrency || isError) {
    return null;
  }

  if (isSameDay(dateRaised, datePaid)) {
    // If the invoice was raised and paid on the same day, pad out the max and min values by 10% of the actual cost.
    maxValue = numeral(actualCost).multiply(1.1).value();
    minValue = numeral(actualCost).multiply(0.9).value();
  } else {
    // Otherwise used the highest and lowest variance returned from the response.
    maxValue = numeral(maxBy(costVariance, 'amount')?.amount || 0).value();
    minValue = numeral(minBy(costVariance, 'amount')?.amount || 0).value();
  }

  return (
    <td colSpan={8} className="bg-white border-t-1 border-b-1 border-gray-500 px-4">
      {renderTitle()}
      <VictoryChart
        domain={{ y: [minValue, maxValue] }}
        width={chartWidth}
        domainPadding={INVOICE_TABLE_CHART.domainPadding}
        height={INVOICE_TABLE_CHART.chartHeight}
        padding={INVOICE_TABLE_CHART.chartPadding}
        style={{ parent: { fontFamily: CHART_FONT_FAMILY } }}
      >
        {/** Y axis */}
        <VictoryAxis
          dependentAxis
          orientation="left"
          style={{
            grid: { stroke: TAILWIND_THEME.colors.gray[400] },
            axisLabel: { fontSize: 0, padding: 0, stroke: TAILWIND_THEME.colors.transparent },
            tickLabels: {
              fill: TAILWIND_THEME.colors.gray[500],
              fontFamily: CHART_FONT_FAMILY,
              fontSize: INVOICE_TABLE_CHART.xAxisFontSize,
              fontWeight: INVOICE_TABLE_CHART.xAxisFontWeight,
              padding: INVOICE_TABLE_CHART.xAxisPadding,
              stroke: TAILWIND_THEME.colors.transparent,
            },
            axis: { stroke: TAILWIND_THEME.colors.transparent },
          }}
        />

        {/** Area chart */}
        <VictoryArea
          data={costVariance}
          x="date"
          y="amount"
          style={{
            data: { stroke: TAILWIND_THEME.colors.blue[600], fill: CHART_AREA_GRADIENT_FILL.blue },
          }}
        />

        {/** Tooltips & start and snd dots */}
        <VictoryScatter
          data={[first(costVariance), last(costVariance)]}
          x="date"
          y="amount"
          labels={() => ''}
          labelComponent={
            <VictoryPortal>
              <InvoiceTableRowChartTooltip mode={mode} />
            </VictoryPortal>
          }
          style={{ data: { fill: TAILWIND_THEME.colors.blue[600] } }}
          size={4}
        />
      </VictoryChart>

      <ChartAreaGradientReference />
    </td>
  );
});
