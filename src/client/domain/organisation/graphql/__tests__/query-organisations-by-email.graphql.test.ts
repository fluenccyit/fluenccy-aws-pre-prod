import { apolloService } from '@client/common';
import { GqlByEmailInput } from '@graphql';
import { queryOrganisationsByEmail, QUERY_ORGANISATIONS_BY_EMAIL } from '@client/organisation';
import { MOCK_ORGANISATION } from './organisation.mock';

const MOCK_INPUT: GqlByEmailInput = {
  email: 'mock-email',
};

describe('Organisation | GraphQL | queryOrganisationsByEmail', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { organisationsByEmail: [MOCK_ORGANISATION] } }));

  it('should query the organisations by email', async () => {
    const result = await queryOrganisationsByEmail(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({
      query: QUERY_ORGANISATIONS_BY_EMAIL,
      variables: { input: MOCK_INPUT },
    });
    expect(result).toEqual([MOCK_ORGANISATION]);
  });
});
