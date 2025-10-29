import { apolloService } from '@client/common';
import { queryAccount, QUERY_ACCOUNT } from '@client/account';
import { MOCK_ACCOUNT } from './account.mock';

describe('Account | GraphQL | queryAccount', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { account: MOCK_ACCOUNT } }));

  it('should query the account', async () => {
    const result = await queryAccount();

    expect(apolloService.query).toBeCalledWith({ query: QUERY_ACCOUNT, fetchPolicy: 'network-only' });
    expect(result).toEqual(MOCK_ACCOUNT);
  });
});
