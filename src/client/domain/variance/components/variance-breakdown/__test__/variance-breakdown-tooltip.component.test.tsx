import React from 'react';
import { testService } from '@test/client';
import { VarianceBreakdownTooltip } from '@client/variance';

describe('Dashboard | Components | <VarianceBreakdownTooltip />', () => {
  it('should render correctly as the success variant', () => {
    const { getByText } = testService.render(<VarianceBreakdownTooltip variant="success">Render me</VarianceBreakdownTooltip>);

    expect(getByText('Render me')).toBeTruthy();
  });

  it('should render correctly as the danger variant', () => {
    const { getByText } = testService.render(<VarianceBreakdownTooltip variant="danger">Render me</VarianceBreakdownTooltip>);

    expect(getByText('Render me')).toBeTruthy();
  });

  it('should render correctly as the neutral variant', () => {
    const { getByText } = testService.render(<VarianceBreakdownTooltip variant="neutral">Render me</VarianceBreakdownTooltip>);

    expect(getByText('Render me')).toBeTruthy();
  });
});
