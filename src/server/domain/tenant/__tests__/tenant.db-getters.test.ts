import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { tenantDbGetters } from '@server/tenant';
import { MOCK_TENANT } from './tenant.mocks';

describe('@server/tenant | tenantDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryTenant', () => {
    const { queryTenant } = tenantDbGetters;

    it('should fetch tenants from the database', async () => {
      testService.setDbResponse([MOCK_TENANT]);

      expect(await queryTenant()).toEqual([MOCK_TENANT]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryTenant()).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getTenantById', () => {
    const { getTenantById } = tenantDbGetters;

    it('should fetch tenants from the database', async () => {
      testService.setDbResponse([MOCK_TENANT]);

      expect(await getTenantById(MOCK_TENANT.id)).toEqual(MOCK_TENANT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getTenantById(MOCK_TENANT.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
