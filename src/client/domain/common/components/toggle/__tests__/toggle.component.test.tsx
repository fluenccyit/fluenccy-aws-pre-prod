import React from 'react';
import { testService } from '@test/client';
import { Toggle } from '@client/common';

const fn = jest.fn();

describe('Common | Components | <Toggle />', () => {
  it('should render correctly and call the onChange handler when clicked', () => {
    const { getByRole } = testService.render(<Toggle onChange={fn} />);

    const component = getByRole('switch');
    component.click();

    expect(fn).toBeCalled();
  });

  it('should render correctly when disabled and not call the onChange handler when clicked', () => {
    const { getByRole } = testService.render(<Toggle onChange={fn} isDisabled />);

    const component = getByRole('switch');
    component.click();

    expect(fn).not.toBeCalled();
  });
});
