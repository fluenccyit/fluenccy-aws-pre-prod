import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { tenantDbUpdaters } from '@server/tenant';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_TENANT } from './tenant.mocks';

describe('@server/tenant | tenantDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updateTenant', () => {
    const { updateTenant } = tenantDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "tenant"');
        done();
      });

      updateTenant(MOCK_TENANT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updateTenant(MOCK_TENANT)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
