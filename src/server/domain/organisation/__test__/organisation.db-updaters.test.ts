import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { organisationDbUpdaters } from '@server/organisation';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_ORGANISATION_DBO } from './organisation.mocks';

describe('@server/organisation | organisationDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updateOrganisation', () => {
    const { updateOrganisation } = organisationDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "organisation"');
        done();
      });

      updateOrganisation(MOCK_ORGANISATION_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updateOrganisation(MOCK_ORGANISATION_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
