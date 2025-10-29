import React from 'react';
import { testService } from '@test/client';
import { PerformanceBreakdownSkeleton } from '@client/performance';

describe('Dashboard | Components | <PerformanceBreakdownSkeleton />', () => {
  it('should render correctly', () => {
    const { container } = testService.render(<PerformanceBreakdownSkeleton />);

    expect(container.firstChild).toBeTruthy();
  });
});
