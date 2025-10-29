import React from 'react';
import { testService } from '@test/client';
import { Avatar } from '@client/common';

describe('Common | Components | <Avatar />', () => {
  it('should render correctly', () => {
    const { getByText, queryByRole } = testService.render(<Avatar>CG</Avatar>);

    expect(getByText('CG')).toBeTruthy();
    expect(queryByRole('button')).not.toBeTruthy();
  });

  it('should render as a button when passed an `onClick` handler', () => {
    const fn = jest.fn();
    const { getByRole } = testService.render(<Avatar onClick={fn}>CG</Avatar>);
    const component = getByRole('button');

    expect(component).toBeTruthy();

    component.click();

    expect(fn).toBeCalled();
  });
});
