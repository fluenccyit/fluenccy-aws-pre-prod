import React from 'react';
import { testService } from '@test/client';
import { uiVar } from '@client/common';
import { organisationVar } from '@client/organisation';
import { ChartControls, chartCurrencyVar } from '@client/chart';
import { MOCK_ORGANISATION } from '@client/organisation/graphql/__tests__/organisation.mock';

describe('Dashboard | Components | <ChartControls />', () => {
  it('should render correctly when the local ui state is `ready`', () => {
    uiVar('ready');
    organisationVar(MOCK_ORGANISATION);
    chartCurrencyVar('USD');

    const { getByText } = testService.render(<ChartControls />);

    expect(getByText('Payables')).toBeTruthy();
    expect(getByText('Payment Variance')).toBeTruthy();
  });
});
