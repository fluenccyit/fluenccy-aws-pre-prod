import React from 'react';
import { testService } from '@test/client';
import { ChartErrorPanel } from '@client/chart';

describe('Dashboard | Components | <ChartErrorPanel />', () => {
  it('should render correctly with the error state', () => {
    const { getByText } = testService.render(<ChartErrorPanel state="error" />);

    expect(getByText(`Try reloading the page. If that doesn't work please get in touch.`)).toBeTruthy();
  });

  it('should render correctly with the no-data state', () => {
    const { getByText } = testService.render(<ChartErrorPanel state="no-data" />);

    expect(getByText(`Oh no, your Xero account is empty, upload an invoice and resync your account to see your currency position`)).toBeTruthy();
  });
});
