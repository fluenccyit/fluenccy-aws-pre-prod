import React from 'react';
import { testService } from '@test/client';
import { accountVar, useQueryLocalAccount } from '@client/account';
import { MOCK_ACCOUNT } from './account.mock';

const MockComponent = () => {
  const { account } = useQueryLocalAccount();

  return (
    <>
      <div>{account?.id}</div>
      <div>{account?.name}</div>
      <div>{account?.type}</div>
    </>
  );
};

describe('Account | GraphQL | useQueryLocalAccount', () => {
  beforeAll(() => {
    accountVar(MOCK_ACCOUNT);
  });

  it('should query the local account state', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText(MOCK_ACCOUNT.id)).toBeTruthy();
    expect(getByText(MOCK_ACCOUNT.name as string)).toBeTruthy();
    expect(getByText(MOCK_ACCOUNT.type)).toBeTruthy();
  });
});
