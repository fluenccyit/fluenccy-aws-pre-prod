import React from 'react';
import { testService } from '@test/client';
import { adminEmailVar, useQueryLocalAdmin } from '@client/admin';

const MockComponent = () => {
  const { adminEmail } = useQueryLocalAdmin();

  return <div>{adminEmail}</div>;
};

describe('Admin | GraphQL | useQueryLocalAdmin', () => {
  beforeAll(() => {
    adminEmailVar('mock-email@email.com');
  });

  it('should query the local admin email state', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText('mock-email@email.com')).toBeTruthy();
  });
});
