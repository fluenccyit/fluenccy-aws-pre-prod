import React from 'react';
import { testService } from '@test/client';
import { VarianceBreakdownCurrencySection } from '@client/variance';

describe('Dashboard | Components | <VarianceBreakdownCurrencySection />', () => {
  it('should render correctly', () => {
    const { getByText } = testService.render(
      <VarianceBreakdownCurrencySection currency="NZD" amount={12345.67} heading="Mock Heading">
        Render me
      </VarianceBreakdownCurrencySection>
    );

    expect(getByText('Mock Heading')).toBeTruthy();
    expect(getByText('$12,345.67')).toBeTruthy();
    expect(getByText('Render me')).toBeTruthy();
  });
});
