import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { tenantDbDeleters } from '@server/tenant';
import { MOCK_TENANT } from './tenant.mocks';

describe('@server/tenant | tenantDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deleteTenantById', () => {
    const { deleteTenantById } = tenantDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "tenant"');
        done();
      });

      deleteTenantById(MOCK_TENANT.id);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteTenantById(MOCK_TENANT.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
