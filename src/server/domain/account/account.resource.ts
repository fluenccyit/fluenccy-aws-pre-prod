import { UserInputError } from 'apollo-server-express';
import { sharedUtilService } from '@shared/common';
import { GqlAccount, GqlSignUpInput } from '@graphql';
import { accountDbCreators, accountDbGetters } from '@server/account';
import { userDbCreators, userResource, userService } from '@server/user';
import { authService, ERROR_MESSAGE, FIREBASE_AUTH_ERROR, loggerService, utilService } from '@server/common';
import { organisationDbCreators, organisationDbGetters, organisationDbUpdaters, ORGANISATION_DEFAULT_HEDGE_MARGIN } from '@server/organisation';
import { tenantDbCreators, tenantDbGetters } from '@server/tenant';
import { find } from 'lodash';

const resource = 'AccountResource';
class AccountResource {
  queryAccount = async () => {
    return await accountDbGetters.queryAccount();
  };

  async getAccountById(id: string, allowNull?: false): Promise<GqlAccount>;
  async getAccountById(id: string, allowNull: true): Promise<GqlAccount | null>;
  async getAccountById(id: string, allowNull = false) {
    loggerService.info('Getting account by id.', { resource, method: 'getAccountById', id });

    const account = await accountDbGetters.getAccountById(id);

    if (!account) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noAccount });
    }

    return account;
  }

  async getAccountByToken(token: string, allowNull?: false): Promise<GqlAccount>;
  async getAccountByToken(token: string, allowNull: true): Promise<GqlAccount | null>;
  async getAccountByToken(token: string, allowNull = false) {
    loggerService.info('Getting account by token.', { resource, method: 'getAccountByToken' });

    const { accountId } = await userResource.getUserByToken(token);
    const account = accountId ? await this.getAccountById(accountId, allowNull as any) : null;

    if (!account) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noAccount });
    }

    return account;
  }

  async createAccount({ email, password, firstName, lastName, accountName = '', accountType, currencyCode }: GqlSignUpInput) {
    const logParam = { resource, method: 'createAccount', email, password, firstName, lastName, accountName, accountType, currencyCode };
    let firebaseUid = '';

    loggerService.info('Creating Firebase user.', logParam);

    try {
      const firebaseUser = await authService.createUser({
        email,
        password,
        displayName: userService.getUserDisplayName({ firstName, lastName }),
      });

      firebaseUid = firebaseUser.uid;
    } catch (error) {
      if (error.code === FIREBASE_AUTH_ERROR.emailAlreadyExists) {
        throw new UserInputError(ERROR_MESSAGE.emailAlreadyExists);
      }

      throw error;
    }

    loggerService.info('Created Firebase user.', { ...logParam, firebaseUid });

    loggerService.info('Creating account.', logParam);
    const accountId = sharedUtilService.generateUid('acc_');

    await accountDbCreators.createAccount({
      id: accountId,
      name: accountName,
      type: accountType,
    });

    loggerService.info('Created account.', { ...logParam, accountId });

    loggerService.info('Creating Fluenccy user.', { ...logParam, accountId, firebaseUid });
    const userId = sharedUtilService.generateUid('usr_');

    await userDbCreators.createUser({
      id: userId,
      firebaseUid,
      accountId,
      firstName,
      lastName,
      role: 'accountowner',
      tokenSet: null,
    });

    loggerService.info('Created Fluenccy user.', { ...logParam, userId, accountId, firebaseUid });

    if (currencyCode && accountName) {
      const [organisationDbos, tenantDbos] = await Promise.all([
        organisationDbGetters.queryOrganisationByAccountId(accountId),
        tenantDbGetters.queryTenant(),
      ]);
      const tenantId = sharedUtilService.generateUid('tenant_');

      if (find(tenantDbos, ({ id }) => id === tenantId)) {
        loggerService.info('Already have a record of tenant. Skipping.', { ...logParam, tenantId });
      } else {
        loggerService.info('Storing tenant.', { ...logParam, tenantId });
        await tenantDbCreators.createTenant({ id: tenantId, provider: 'fluenccy', lastSynced: null });
      }

      const organisationDbo = find(organisationDbos, ({ tenantId: tenantIdToCheck }) => tenantId === tenantIdToCheck);

      if (organisationDbo) {
        const { id: orgId } = organisationDbo;
        loggerService.info('Already have an organisation with tenant.', { ...logParam, orgId, tenantId });

        await organisationDbUpdaters.updateOrganisation({
          ...organisationDbo,
          syncStatus: 'pullingInvoicesAndPayments',
        });

        const organisationUser = await organisationDbGetters.getOrganisationUser({ orgId, userId });

        if (!organisationUser) {
          loggerService.info('Adding user to organisation.', { ...logParam, userId, orgId });

          await organisationDbCreators.createOrganisationUser({ orgId, userId });
        } else {
          loggerService.info('User already exists in organisation.', { ...logParam, userId, orgId });
        }

        loggerService.info('Setting user as the token user for organisation.', { ...logParam, userId, orgId });
        await organisationDbUpdaters.updateOrganisation({ ...organisationDbo, tokenUserId: userId });
      } else {
        const orgId = sharedUtilService.generateUid('org_');

        loggerService.info('Creating organisation for tenant.', { ...logParam, tenantId, orgId });

        await organisationDbCreators.createOrganisation({
          id: orgId,
          tokenUserId: userId,
          name: accountName,
          syncStatus: 'synced',
          buildPlanScore: 0,
          buildPlanAnswers: [],
          currencyScores: [],
          hedgeMargin: ORGANISATION_DEFAULT_HEDGE_MARGIN,
          intentRegistered: false,
          onboardingComplete: false,
          initialSyncComplete: true,
          accountId,
          tenantId,
          currency: currencyCode,
        });

        loggerService.info('Adding user to organisation.', { ...logParam, userId, orgId });
        await organisationDbCreators.createOrganisationUser({ orgId, userId });
      }
    }

    return await userResource.getUserById(userId);
  }
}

export const accountResource = new AccountResource();
