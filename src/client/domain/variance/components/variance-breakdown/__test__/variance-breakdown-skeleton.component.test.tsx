import React from 'react';
import { testService } from '@test/client';
import { VarianceBreakdownSkeleton } from '@client/variance';

describe('Dashboard | Components | <VarianceBreakdownSkeleton />', () => {
  it('should render correctly', () => {
    const { container } = testService.render(<VarianceBreakdownSkeleton />);

    expect(container.firstChild).toBeTruthy();
  });
});
