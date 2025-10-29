import React from 'react';
import { testService } from '@test/client';
import { uiVar, useQueryLocalCommon } from '@client/common';

const MockComponent = () => {
  const { ui } = useQueryLocalCommon();

  return <div>{ui}</div>;
};

describe('Common | GraphQL | useQueryLocalCommon', () => {
  it('should query the default local ui state', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('loading')).toBeTruthy();
  });

  it('should query the `ready` local ui state if set', () => {
    uiVar('ready');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('ready')).toBeTruthy();
  });

  it('should query the `loading` local ui state if set', () => {
    uiVar('loading');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('loading')).toBeTruthy();
  });

  it('should query the `saving` local ui state if set', () => {
    uiVar('saving');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('saving')).toBeTruthy();
  });

  it('should query the `error` local ui state if set', () => {
    uiVar('error');

    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('error')).toBeTruthy();
  });
});
