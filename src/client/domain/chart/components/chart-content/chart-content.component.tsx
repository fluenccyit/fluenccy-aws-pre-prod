import React, { memo, useState } from 'react';
import { localStorageService, useQueryLocalCommon } from '@client/common';
import { PerformanceDashboard } from '@client/performance';
import { VarianceBreakdownSkeleton, VarianceDashboard } from '@client/variance';
import { ChartContainer, ChartErrorPanel, ChartLoader, useQueryLocalChart } from '@client/chart';
import { FxPurchasesDashboard } from '@client/fx-purchases';

export const ChartContent = memo(({ mode = null }) => {
  const { ui } = useQueryLocalCommon();
  const { chartType } = useQueryLocalChart();
  const [dateFrom, setDateFrom] = useState(
    localStorageService.getItem('reports-chart-datefrom') ? new Date(localStorageService.getItem('reports-chart-datefrom')) : ''
  );
  const [dateTo, setDateTo] = useState(
    localStorageService.getItem('reports-chart-dateto') ? new Date(localStorageService.getItem('reports-chart-dateto')) : ''
  );
  const [isDateChanged, setIsDateChanged] = useState(
    !!localStorageService.getItem('reports-chart-datefrom') || !!localStorageService.getItem('reports-chart-dateto')
  );

  const onChangeDateRange = (payload) => {
    setIsDateChanged(true);
    setDateFrom(payload.dateFrom);
    setDateTo(payload.dateTo);
    localStorageService.setItem('reports-chart-dateto', payload.dateTo);
    localStorageService.setItem('reports-chart-datefrom', payload.dateFrom);
  };

  const renderContent = () => {
    if (ui === 'loading') {
      return (
        <>
          <VarianceBreakdownSkeleton />
          <ChartContainer>
            <ChartLoader />
          </ChartContainer>
        </>
      );
    }

    if (ui === 'error') {
      return (
        <>
          <VarianceBreakdownSkeleton isLoading={false} />
          <ChartContainer>
            <ChartErrorPanel />
          </ChartContainer>
        </>
      );
    }

    const props = {
      onChangeDateRange,
      newDateFrom: dateFrom,
      newDateTo: dateTo,
      isDateChanged,
      mode,
    };

    if (chartType === 'variance') {
      return <VarianceDashboard endWithNonEmpty {...props} />;
    }

    if (chartType === 'performance') {
      return <PerformanceDashboard endWithNonEmpty {...props} />;
    }

    if (chartType === 'fx_purchases') {
      return <FxPurchasesDashboard endWithNonEmpty {...props} />;
    }

    return (
      <ChartContainer>
        <ChartErrorPanel state="no-data" />
      </ChartContainer>
    );
  };

  return <div className="flex bg-gray-100 h-full pt-16">{renderContent()}</div>;
});
