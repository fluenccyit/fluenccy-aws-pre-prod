import { apolloService } from '@client/common';
import { queryOrganisationsByToken, QUERY_ORGANISATIONS_BY_TOKEN } from '@client/organisation';
import { MOCK_ORGANISATION } from './organisation.mock';

describe('Organisation | GraphQL | queryOrganisationsByToken', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { organisationsByToken: [MOCK_ORGANISATION] } }));

  it('should query the organisations by email', async () => {
    const result = await queryOrganisationsByToken();

    expect(apolloService.query).toBeCalledWith({
      query: QUERY_ORGANISATIONS_BY_TOKEN,
      fetchPolicy: 'no-cache',
    });
    expect(result).toEqual([MOCK_ORGANISATION]);
  });
});
