import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { tenantDbCreators } from '@server/tenant';
import { MOCK_TENANT } from './tenant.mocks';

describe('@server/tenant | tenantDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createTenant', () => {
    const { createTenant } = tenantDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "tenant"');
        done();
      });

      createTenant(MOCK_TENANT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createTenant(MOCK_TENANT)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
