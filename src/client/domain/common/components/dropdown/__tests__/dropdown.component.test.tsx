import React from 'react';
import { testService } from '@test/client';
import { Dropdown } from '@client/common';

describe('Common | Components | <Dropdown />', () => {
  it('should render hidden by default', () => {
    const { container } = testService.render(<Dropdown>Render me</Dropdown>);

    expect(container.firstChild).toBeNull();
  });

  it('should render visible when isOpen is passed', () => {
    const { container } = testService.render(<Dropdown isOpen>Render me</Dropdown>);

    expect(container.firstChild).toBeTruthy();
  });
});
