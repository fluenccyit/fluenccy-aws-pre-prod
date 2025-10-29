import React from 'react';
import { format, parse } from 'date-fns';
import { testService } from '@test/client';
import { chartTypeVar, chartCurrencyVar, chartDateRangeVar, useQueryLocalChart } from '@client/chart';

const MockComponent = () => {
  const { chartType, chartCurrency, chartDateRange } = useQueryLocalChart();

  return (
    <>
      <div>{chartType}</div>
      <div>{chartCurrency}</div>
      <div>{chartDateRange?.dateFrom && format(chartDateRange.dateFrom, 'dd/MM/yyyy')}</div>
      <div>{chartDateRange?.dateTo && format(chartDateRange.dateTo, 'dd/MM/yyyy')}</div>
      <div>{chartDateRange?.month}</div>
      <div>{chartDateRange?.year}</div>
    </>
  );
};

describe('Chart | GraphQL | useQueryLocalChart', () => {
  it('should query the default chart type state if not set', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('variance')).toBeTruthy();
  });

  it('should query the default chart type state if not set', () => {
    chartTypeVar('performance');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('performance')).toBeTruthy();
  });

  it('should query the chart currency if set', () => {
    chartCurrencyVar('AUD');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('AUD')).toBeTruthy();
  });

  it('should query the chart date range if set', () => {
    chartDateRangeVar({
      dateFrom: parse('01/05/2021', 'dd/MM/yyyy', new Date()),
      dateTo: parse('31/05/2021', 'dd/MM/yyyy', new Date()),
      month: 'May',
      year: 2021,
    });

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('01/05/2021')).toBeTruthy();
    expect(getByText('31/05/2021')).toBeTruthy();
    expect(getByText('May')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
  });
});
