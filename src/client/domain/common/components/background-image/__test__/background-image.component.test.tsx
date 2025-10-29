import React from 'react';
import { testService } from '@test/client';
import { BackgroundImage } from '@client/common';

describe('Common | Components | <BackgroundImage />', () => {
  it('should render correctly', () => {
    const { container } = testService.render(<BackgroundImage src="mock-image-path" />);

    expect(container.firstChild).toHaveStyle('backgroundImage: url(mock-image-path)');
  });
});
