import { apolloService } from '@client/common';
import { queryOrganisations, QUERY_ORGANISATIONS } from '@client/organisation';
import { MOCK_ORGANISATION } from './organisation.mock';

describe('Organisation | GraphQL | queryOrganisations', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { organisations: [MOCK_ORGANISATION] } }));

  it('should query the organisations', async () => {
    const result = await queryOrganisations();

    expect(apolloService.query).toBeCalledWith({ query: QUERY_ORGANISATIONS, fetchPolicy: 'network-only' });
    expect(result).toEqual([MOCK_ORGANISATION]);
  });
});
