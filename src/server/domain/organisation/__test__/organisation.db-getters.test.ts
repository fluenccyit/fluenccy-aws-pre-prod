import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { organisationDbGetters } from '@server/organisation';
import { MOCK_ORGANISATION_DBO, MOCK_ORGANISATION_USER } from './organisation.mocks';

describe('@server/organisation | organisationDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryOrganisation', () => {
    const { queryOrganisation } = organisationDbGetters;

    it('should fetch all organisations', async () => {
      testService.setDbResponse([MOCK_ORGANISATION_DBO]);

      expect(await queryOrganisation()).toEqual([MOCK_ORGANISATION_DBO]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryOrganisation()).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#queryOrganisationByAccountId', () => {
    const { queryOrganisationByAccountId } = organisationDbGetters;

    it('should fetch all organisations', async () => {
      testService.setDbResponse([MOCK_ORGANISATION_DBO]);

      expect(await queryOrganisationByAccountId(MOCK_ORGANISATION_DBO.accountId)).toEqual([MOCK_ORGANISATION_DBO]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryOrganisationByAccountId(MOCK_ORGANISATION_DBO.accountId)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#queryOrganisationByTenantId', () => {
    const { queryOrganisationByTenantId } = organisationDbGetters;

    it('should fetch all organisations', async () => {
      testService.setDbResponse([MOCK_ORGANISATION_DBO]);

      expect(await queryOrganisationByTenantId(MOCK_ORGANISATION_DBO.tenantId)).toEqual([MOCK_ORGANISATION_DBO]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryOrganisationByTenantId(MOCK_ORGANISATION_DBO.tenantId)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getOrganisationById', () => {
    const { getOrganisationById } = organisationDbGetters;

    it('should fetch all organisations', async () => {
      testService.setDbResponse([MOCK_ORGANISATION_DBO]);

      expect(await getOrganisationById(MOCK_ORGANISATION_DBO.id)).toEqual(MOCK_ORGANISATION_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getOrganisationById(MOCK_ORGANISATION_DBO.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getOrganisationUser', () => {
    const { getOrganisationUser } = organisationDbGetters;

    it('should fetch all organisations', async () => {
      testService.setDbResponse([MOCK_ORGANISATION_USER]);

      expect(await getOrganisationUser(MOCK_ORGANISATION_USER)).toEqual(MOCK_ORGANISATION_USER);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getOrganisationUser(MOCK_ORGANISATION_USER)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
