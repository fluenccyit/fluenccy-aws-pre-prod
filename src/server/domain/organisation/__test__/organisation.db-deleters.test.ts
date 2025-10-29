import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { organisationDbDeleters } from '@server/organisation';
import { MOCK_ORGANISATION_DBO, MOCK_ORGANISATION_USER } from './organisation.mocks';

describe('@server/organisation | organisationDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deleteOrganisationById', () => {
    const { deleteOrganisationById } = organisationDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "organisation"');
        done();
      });

      deleteOrganisationById(MOCK_ORGANISATION_DBO.id);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteOrganisationById(MOCK_ORGANISATION_DBO.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#deleteOrganisationUser', () => {
    const { deleteOrganisationUser } = organisationDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "organisation_user"');
        done();
      });

      deleteOrganisationUser(MOCK_ORGANISATION_USER);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteOrganisationUser(MOCK_ORGANISATION_USER)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
