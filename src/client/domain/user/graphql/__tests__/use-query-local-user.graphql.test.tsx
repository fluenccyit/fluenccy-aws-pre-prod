import React from 'react';
import { testService } from '@test/client';
import { userVar, useQueryLocalUser } from '@client/user';
import { MOCK_USER } from './user.mock';

const MockComponent = () => {
  const { user } = useQueryLocalUser();

  return (
    <>
      <div>{user?.id}</div>
      <div>{user?.firstName}</div>
      <div>{user?.lastName}</div>
      <div>{user?.role}</div>
    </>
  );
};

describe('User | GraphQL | useQueryLocalUser', () => {
  beforeAll(() => {
    userVar({ ...MOCK_USER, email: 'mock-email' });
  });

  it('should query the local user state', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText(MOCK_USER.id)).toBeTruthy();
    expect(getByText(MOCK_USER.firstName)).toBeTruthy();
    expect(getByText(MOCK_USER.lastName)).toBeTruthy();
    expect(getByText(MOCK_USER.role)).toBeTruthy();
  });
});
