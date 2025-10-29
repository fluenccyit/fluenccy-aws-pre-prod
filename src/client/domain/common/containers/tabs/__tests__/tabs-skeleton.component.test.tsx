import React from 'react';
import { testService } from '@test/client';
import { TabsSkeleton } from '@client/common';

describe('Common | Containers | <TabsSkeleton />', () => {
  it('should render correctly by default', () => {
    const { container } = testService.render(<TabsSkeleton />);

    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('should render correctly when passed a false `isLoading` modifier', () => {
    const { container } = testService.render(<TabsSkeleton isLoading={false} />);

    expect(container.firstChild).not.toHaveClass('animate-pulse');
  });
});
