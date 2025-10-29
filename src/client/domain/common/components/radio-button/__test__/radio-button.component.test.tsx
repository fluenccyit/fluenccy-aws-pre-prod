import React from 'react';
import { testService } from '@test/client';
import { RadioButton } from '@client/common';

const fn = jest.fn();

describe('Common | Components | <RadioButton />', () => {
  it('should render correctly', () => {
    const { getByRole, getByText } = testService.render(
      <RadioButton<number> name="testing-render" value={1} onChange={(value) => fn(value)}>
        Test
      </RadioButton>
    );

    const component = getByRole('radio');
    expect(component).toBeTruthy();

    component.click();
    expect(fn).toBeCalled();

    expect(getByText('Test')).toBeTruthy();
  });

  it('should behave and render correctly when disabled', () => {
    const { getByRole } = testService.render(
      <RadioButton<number> onChange={(value) => fn(value)} name="testing-render" value={1} isDisabled>
        Test
      </RadioButton>
    );

    const component = getByRole('radio');
    expect(component).toBeTruthy();

    component.click();
    expect(fn).not.toBeCalled();
  });
});
