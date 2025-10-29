import React from 'react';
import { testService } from '@test/client';
import { DropdownContent } from '@client/common';

describe('Common | Components | <DropdownContent />', () => {
  it('should render correctly by default', () => {
    const { getByText } = testService.render(<DropdownContent>Render me</DropdownContent>);

    expect(getByText('Render me')).toBeTruthy();
  });

  it('should render as a button when passed an `onClick` handler', () => {
    const fn = jest.fn();
    const { getByRole } = testService.render(<DropdownContent onClick={fn}>Render me</DropdownContent>);
    const component = getByRole('button');

    expect(component).toBeTruthy();

    component.click();

    expect(fn).toBeCalled();
  });

  it('should render as a link when passed a `to` attribute', () => {
    const { getByRole } = testService.render(<DropdownContent to="/">Render me</DropdownContent>);
    const component = getByRole('link');

    expect(component).toBeTruthy();
  });
});
