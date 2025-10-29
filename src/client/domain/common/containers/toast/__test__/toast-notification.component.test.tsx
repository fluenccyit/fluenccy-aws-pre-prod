import React from 'react';
import { testService } from '@test/client';
import { ToastNotification } from '@client/common';

describe('Common | Components | <ToastNotification />', () => {
  it('should render correctly', () => {
    const { getByText } = testService.render(<ToastNotification variant="success">Hello from toast</ToastNotification>);
    expect(getByText('Hello from toast')).toBeTruthy();
  });
});
