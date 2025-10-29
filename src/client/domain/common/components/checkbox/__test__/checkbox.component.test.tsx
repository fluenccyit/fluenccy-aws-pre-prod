import React from 'react';
import { testService } from '@test/client';
import { Checkbox } from '@client/common';

describe('Common | Components | <Checkbox />', () => {
  it('should render correctly', () => {
    const fn = jest.fn();
    const { getByRole } = testService.render(<Checkbox onChange={fn} />);
    const component = getByRole('checkbox');

    expect(component).toBeTruthy();

    component.click();

    expect(fn).toBeCalled();
  });
});
