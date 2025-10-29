import { apolloService } from '@client/common';
import { queryUser, QUERY_USER } from '@client/user';
import { MOCK_USER } from './user.mock';

describe('Account | GraphQL | queryAccount', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { user: MOCK_USER } }));

  it('should query the user', async () => {
    const result = await queryUser();

    expect(apolloService.query).toBeCalledWith({ query: QUERY_USER });
    expect(result).toEqual(MOCK_USER);
  });
});
