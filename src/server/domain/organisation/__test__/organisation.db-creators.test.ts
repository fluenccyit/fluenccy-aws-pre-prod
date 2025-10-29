import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { organisationDbCreators } from '@server/organisation';
import { MOCK_ORGANISATION_DBO, MOCK_ORGANISATION_USER } from './organisation.mocks';

describe('@server/organisation | organisationDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createOrganisation', () => {
    const { createOrganisation } = organisationDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "organisation"');
        done();
      });

      createOrganisation(MOCK_ORGANISATION_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createOrganisation(MOCK_ORGANISATION_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#createOrganisationUser', () => {
    const { createOrganisationUser } = organisationDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "organisation_user"');
        done();
      });

      createOrganisationUser(MOCK_ORGANISATION_USER);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createOrganisationUser(MOCK_ORGANISATION_USER)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
