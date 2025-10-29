import { apolloService } from '@client/common';
import { GqlByIdInput } from '@graphql';
import { queryOrganisationById, QUERY_ORGANISATION_BY_ID } from '@client/organisation';
import { MOCK_ORGANISATION } from './organisation.mock';

const MOCK_INPUT: GqlByIdInput = {
  id: 'mock-id',
};

describe('Organisation | GraphQL | queryOrganisationById', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { organisationById: MOCK_ORGANISATION } }));

  it('should query the organisation by id', async () => {
    const result = await queryOrganisationById(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({ query: QUERY_ORGANISATION_BY_ID, variables: { input: MOCK_INPUT }, fetchPolicy: 'network-only' });
    expect(result).toEqual(MOCK_ORGANISATION);
  });
});
