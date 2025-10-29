import React from 'react';
import { testService } from '@test/client';
import { FlagIcon } from '@client/common';

describe('Common | Components | <FlagIcon />', () => {
  it('should render correctly when the `jpy` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'JPY'} />);

    expect(getByTestId('JPY')).toBeTruthy();
  });

  it('should render correctly when the `jpy` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'USD'} />);

    expect(getByTestId('USD')).toBeTruthy();
  });

  it('should render correctly when the `jpy` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'NZD'} />);

    expect(getByTestId('NZD')).toBeTruthy();
  });

  it('should render correctly when the `jpy` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'GBP'} />);

    expect(getByTestId('GBP')).toBeTruthy();
  });

  it('should render correctly when the `aud` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'AUD'} />);

    expect(getByTestId('AUD')).toBeTruthy();
  });

  it('should render correctly when the `jpy` currency is passed', () => {
    const { getByTestId } = testService.render(<FlagIcon currency={'EUR'} />);

    expect(getByTestId('EUR')).toBeTruthy();
  });
});
