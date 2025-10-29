import React from 'react';
import { testService } from '@test/client';
import { ErrorPanel } from '@client/common';

describe('Common | Components | <ErrorPanel />', () => {
  it('should render correctly by default', () => {
    const { getByText } = testService.render(<ErrorPanel />);

    expect(getByText(`Oh, that wasn't meant to happen.`)).toBeTruthy();
    expect(getByText(`Try reloading the page. If that doesn't work please get in touch.`)).toBeTruthy();
    expect(getByText(`Contact support`)).toBeTruthy();
  });

  it('should render correctly with the `not-found` variant', () => {
    const { getByText } = testService.render(<ErrorPanel state="not-found" />);

    expect(getByText(`Looks like that page doesn't exist.`)).toBeTruthy();
    expect(getByText(`Try another URL, or click the button below.`)).toBeTruthy();
    expect(getByText(`Go to the currency score`)).toBeTruthy();
  });
});
