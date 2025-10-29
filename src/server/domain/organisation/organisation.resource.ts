import { filter, find, map, sortBy } from 'lodash';
import { ApolloError } from 'apollo-server-express';
import { accountResource } from '@server/account';
import { sharedUtilService } from '@shared/common';
import { UserDbo, userResource } from '@server/user';
import { xeroQueue, xeroService } from '@server/xero';
import { currencyScoreQueue } from '@server/currency-score';
import { ERROR_MESSAGE, loggerService, utilService } from '@server/common';
import { tenantDbGetters, TenantDbo, tenantDbUpdaters, tenantResource } from '@server/tenant';
import { GqlOrganisation, GqlUpdateOrganisationInput, GqlOrganisationTokenStatus } from '@graphql';
import { organisationDbDeleters, organisationDbGetters, OrganisationDbo, organisationDbUpdaters } from '@server/organisation';

type UpdateOrganisationParam = GqlUpdateOrganisationInput & {
  currencyScores?: OrganisationDbo['currencyScores'];
  syncStatus?: OrganisationDbo['syncStatus'];
  initialSyncComplete?: OrganisationDbo['initialSyncComplete'];
  tokenUserId?: OrganisationDbo['tokenUserId'];
};

type GetOrganisationTokenStatusParam = {
  organisationDbo: OrganisationDbo;
  tenantDbo: TenantDbo;
  primaryUserDbo: UserDbo | null;
};

const resource = 'OrganisationResource';
class OrganisationResource {
  async queryOrganisation(): Promise<GqlOrganisation[]> {
    loggerService.info('Query organisations.', { resource, method: 'queryOrganisation' });

    const [organisationDbos, accounts, tenants, users] = await Promise.all([
      organisationDbGetters.queryOrganisation(),
      accountResource.queryAccount(),
      tenantResource.queryTenant(),
      userResource.queryUser(),
    ]);

    const organisations = map(organisationDbos, ({ id, tenantId, accountId, tokenUserId, ...rest }) => {
      const tenant = find(tenants, { id: tenantId });
      const account = find(accounts, { id: accountId });
      const primaryUser = tokenUserId ? find(users, { id: tokenUserId }) : null;
      const tokenStatus: GqlOrganisationTokenStatus = 'active';

      return { id, account, tenant, primaryUser, tokenStatus, tradeCurrencies: [], ...rest };
    });

    return filter(organisations, (organisation) => {
      return Boolean(organisation.tenant) && Boolean(organisation.account);
    }) as GqlOrganisation[];
  }

  async queryOrganisationByToken(token: string, paymentType?: string): Promise<GqlOrganisation[]> {
    loggerService.info('Query organisations by token.', { resource, method: 'queryOrganisationByToken' });

    const { role } = await userResource.getUserByToken(token);
    let accountId = "";

    if (role !== 'superdealer') {
      accountId = (await accountResource.getAccountByToken(token)).id;
    }

    return this.queryOrganisationByAccountId(accountId, paymentType);
  }

  async queryOrganisationByAccountId(accountId: string, paymentType?: string): Promise<GqlOrganisation[]> {
    const logParam = { resource, method: 'queryOrganisationByAccountId', accountId };

    loggerService.info('Query organisations by account id.', logParam);

    return await this.processOrganisationDbos(await organisationDbGetters.queryOrganisationByAccountId(accountId), paymentType);
  }

  async queryOrganisationByTenantId(tenantId: string, paymentType?: string): Promise<GqlOrganisation[]> {
    const logParam = { resource, method: 'queryOrganisationByTenantId', tenantId };

    loggerService.info('Query organisations by tenant id.', logParam);

    return await this.processOrganisationDbos(await organisationDbGetters.queryOrganisationByTenantId(tenantId), paymentType);
  }

  async getOrganisationById(orgId: string, allowNull?: false): Promise<GqlOrganisation>;
  async getOrganisationById(orgId: string, allowNull: true): Promise<GqlOrganisation | null>;
  async getOrganisationById(orgId: string, allowNull = false, paymentType?: string) {
    loggerService.info('Getting organisation by id.', { resource, method: 'getOrganisationById', orgId });

    const organisationDbo = await this.getOrganisationDboById(orgId, allowNull as any);
    const organisation = organisationDbo ? await this.processOrganisationDbo(organisationDbo, paymentType) : null;

    if (!organisation) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noOrganisation });
    }

    return organisation;
  }

  async getOrganisationDboById(orgId: string, allowNull?: false): Promise<OrganisationDbo>;
  async getOrganisationDboById(orgId: string, allowNull: true): Promise<OrganisationDbo | null>;
  async getOrganisationDboById(orgId: string, allowNull = false) {
    loggerService.info('Getting organisation dbo by id.', { resource, method: 'getOrganisationDboById', orgId });

    const organisationDbo = await organisationDbGetters.getOrganisationById(orgId);

    if (!organisationDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noOrganisation });
    }

    return organisationDbo;
  }

  async processOrganisationDbos(organisationDbos: OrganisationDbo[], paymentType?: string): Promise<GqlOrganisation[]> {
    loggerService.info('Processing organisation dbos.', { resource, method: 'processOrganisationDbos' });

    const organisations: GqlOrganisation[] = [];

    await sharedUtilService.asyncForEach(organisationDbos, async (organisationDbo) => {
      const organisation = await this.processOrganisationDbo(organisationDbo, paymentType);

      if (organisation) {
        organisations.push(organisation);
      }
    });

    return sortBy(organisations, 'created_at');
  }

  async processOrganisationDbo(organisationDbo: OrganisationDbo, paymentType?: string): Promise<GqlOrganisation | null> {
    const { id, accountId, tenantId, tokenUserId, ...rest } = organisationDbo;
    const logParam = { resource, method: 'processOrganisationDbo', orgId: id };

    loggerService.info('Processing organisation dbo.', logParam);

    const [account, tenant, tradeCurrencies, primaryUser] = await Promise.all([
      accountResource.getAccountById(accountId, true),
      tenantResource.getTenantById(tenantId, true),
      tenantResource.queryCurrencyByTenantId(tenantId, paymentType),
      tokenUserId ? userResource.getUserDboById(tokenUserId) : null,
    ]);

    // If we can't resolve an account or tenant for the organisation, something has gone wrong, and we have an incomplete organisation. In this case,
    // we will return `null`.
    if (!account || !tenant) {
      loggerService.error('Unable to resolve the account and tenant for org.', logParam);
      return null;
    }

    const tokenStatus = await this.getOrganisationTokenStatus({ organisationDbo, tenantDbo: tenant, primaryUserDbo: primaryUser });

    return { id, account, tenant, primaryUser, tokenStatus, tradeCurrencies, ...rest };
  }

  async deleteOrganisationById(orgId: string) {
    const logParam = { resource, method: 'deleteOrganisationById', orgId };

    loggerService.info('Deleting organisation.', logParam);

    // First getting tenant id of the organisation, so we don't lose the reference when the organisation is removed from the database.
    const { tenantId } = await this.getOrganisationDboById(orgId);

    // Next we need to disconnect the organisation, so if the user tries to reconnect the org, they can.
    await this.disconnectOrganisationById(orgId);

    loggerService.info('Deleting organisation user by org id.', logParam);
    await organisationDbDeleters.deleteOrganisationUserByOrgId(orgId);

    loggerService.info('Deleting organisation from database.', logParam);
    await organisationDbDeleters.deleteOrganisationById(orgId);

    loggerService.info('Checking if there are any more organisations associated with tenant.', { ...logParam, tenantId });
    const organisationDbos = await organisationDbGetters.queryOrganisationByTenantId(tenantId);

    // If there are no other organisations that are linked to the tenant, we can remove the tenant too.
    if (!organisationDbos.length) {
      loggerService.info('Deleting orphaned tenant.', { ...logParam, tenantId });
      await tenantResource.deleteTenantById(tenantId);
    }
  }

  async disconnectOrganisationById(orgId: string) {
    const logParam = { resource, method: 'disconnectOrganisationById', orgId };

    loggerService.info('Disconnecting organisation.', logParam);

    const [organisationDbo, xeroTokenUserDbo] = await Promise.all([
      this.getOrganisationDboById(orgId),
      userResource.getOrganisationTokenUserDboByOrgId(orgId, true),
    ]);

    if (!xeroTokenUserDbo) {
      loggerService.info('No Xero token user against organisation. Bailing out.', logParam);
      return;
    }

    const { id: userId, tokenSet } = xeroTokenUserDbo;

    if (!tokenSet) {
      loggerService.info('User does not have a token set.', { ...logParam, userId });

      loggerService.info('Removing user from organisation.', logParam);
      await organisationDbDeleters.deleteOrganisationUser({ orgId, userId });

      loggerService.info('Removing token user from organisation.', logParam);
      await this.updateOrganisation({ orgId, tokenUserId: null });
      return;
    }

    loggerService.info('Refreshing token for user.', { ...logParam, userId });
    const xeroClient = xeroService.getClient();
    const newTokenSet = await xeroService.getRefreshedTokenSet(xeroClient, tokenSet, { orgId, userId });

    loggerService.info('Updating token against user.', { ...logParam, userId });
    await userResource.updateUser({ userId, tokenSet: newTokenSet });

    if (newTokenSet) {
      loggerService.info('Fetching Xero tenants associated with token.', logParam);
      const tenants = await xeroClient.updateTenants();
      const tenantToDisconnect = find(tenants, ({ tenantId }) => tenantId === organisationDbo.tenantId);

      if (tenantToDisconnect) {
        loggerService.info('Disconnecting Xero Tenant.', { ...logParam, tenantId: tenantToDisconnect.id });
        await xeroClient.disconnect(tenantToDisconnect.id);
      } else {
        loggerService.info('Could not find tenant to disconnect. Continuing.', logParam);
      }
    } else {
      loggerService.info('Could not refresh Xero token, so could not fetch tenants to disconnect. Continuing.', logParam);
    }

    loggerService.info('Removing user from organisation.', logParam);
    await organisationDbDeleters.deleteOrganisationUser({ orgId, userId });

    loggerService.info('Removing token user from organisation.', logParam);
    await this.updateOrganisation({ orgId, tokenUserId: null });
  }

  async resyncOrganisationById(orgId: string): Promise<GqlOrganisation> {
    const logParam = { resource, method: 'resyncOrganisationById', orgId };

    loggerService.info('Resyncing organisation.', logParam);

    const organisationDbo = await organisationDbGetters.getOrganisationById(orgId);
    const tenantDbo = organisationDbo ? await tenantDbGetters.getTenantById(organisationDbo.tenantId) : null;

    if (!organisationDbo || !tenantDbo) {
      throw new ApolloError(ERROR_MESSAGE.noOrganisation);
    }

    loggerService.info('Removing lastSynced from associated tenant.', logParam);
    await tenantDbUpdaters.updateTenant({ ...tenantDbo, lastSynced: null });

    loggerService.info('Setting organisation sync status to <pullingInvoicesAndPayments>.', logParam);
    await this.updateOrganisation({ orgId, syncStatus: 'pullingInvoicesAndPayments' });

    await xeroQueue.add(organisationDbo);

    return await this.getOrganisationById(orgId);
  }

  async refreshOrganisationTokenById(orgId: string): Promise<GqlOrganisation> {
    const logParam = { resource, method: 'refreshOrganisationTokenById', orgId };

    loggerService.info('Refreshing organisation token.', logParam);

    const xeroTokenUserDbo = await userResource.getOrganisationTokenUserDboByOrgId(orgId);

    if (!xeroTokenUserDbo?.tokenSet) {
      throw new ApolloError(ERROR_MESSAGE.noToken);
    }

    const { id: userId, tokenSet } = xeroTokenUserDbo;

    loggerService.info('Refreshing token for user.', { ...logParam, userId });
    const xeroClient = xeroService.getClient();
    const newTokenSet = await xeroService.getRefreshedTokenSet(xeroClient, tokenSet, { orgId, userId });

    if (!newTokenSet) {
      loggerService.error('Failed to refresh token for user.', { ...logParam, userId });
      throw new ApolloError(ERROR_MESSAGE.tokenExpired);
    }

    loggerService.info('Updating token against user.', { ...logParam, userId });
    await userResource.updateUser({ userId, tokenSet: newTokenSet });

    return await this.getOrganisationById(orgId);
  }

  async recalculateOrganisationCurrencyScoresById(orgId: string): Promise<GqlOrganisation> {
    const logParam = { resource, method: 'recalculateOrganisationCurrencyScoresById', orgId };

    loggerService.info('Recalculating organisation currency scores.', logParam);

    const organisationDbo = await organisationDbGetters.getOrganisationById(orgId);
    const tenantDbo = organisationDbo ? await tenantDbGetters.getTenantById(organisationDbo.tenantId) : null;

    if (!organisationDbo || !tenantDbo) {
      throw new ApolloError(ERROR_MESSAGE.noOrganisation);
    }

    await currencyScoreQueue.add(organisationDbo);

    return await this.getOrganisationById(orgId);
  }

  async updateOrganisation({ orgId, ...args }: UpdateOrganisationParam) {
    const logParam = { resource, method: 'updateOrganisation', orgId, args: JSON.stringify(args) };

    loggerService.info('Updating organisation.', logParam);

    const organisationDbo = await this.getOrganisationDboById(orgId);

    utilService.patchObject(organisationDbo, 'syncStatus', args.syncStatus);
    utilService.patchObject(organisationDbo, 'initialSyncComplete', args.initialSyncComplete);
    utilService.patchObject(organisationDbo, 'buildPlanScore', args.buildPlanScore);
    utilService.patchObject(organisationDbo, 'buildPlanAnswers', args.buildPlanAnswers);
    utilService.patchObject(organisationDbo, 'currencyScores', args.currencyScores);
    utilService.patchObject(organisationDbo, 'hedgeMargin', args.hedgeMargin);
    utilService.patchObject(organisationDbo, 'intentRegistered', args.intentRegistered);
    utilService.patchObject(organisationDbo, 'onboardingComplete', args.onboardingComplete);
    utilService.patchObject(organisationDbo, 'variableProbability', args.variableProbability);

    await organisationDbUpdaters.updateOrganisation(organisationDbo);

    return await this.getOrganisationById(orgId);
  }

  getOrganisationTokenStatus = async ({
    organisationDbo,
    tenantDbo,
    primaryUserDbo,
  }: GetOrganisationTokenStatusParam): Promise<GqlOrganisationTokenStatus> => {
    const logParam = {
      resource,
      method: 'getOrganisationTokenStatus',
      orgId: organisationDbo.id,
      userId: primaryUserDbo?.id,
      tenantId: tenantDbo.id,
    };

    loggerService.info('Getting organisation token status.', logParam);

    if (!primaryUserDbo?.tokenSet) {
      loggerService.info('No primary user or token set. Organisation token status is disconnected.', logParam);
      return 'disconnected';
    }

    try {
      const { id: orgId } = organisationDbo;
      const { id: userId, tokenSet } = primaryUserDbo;

      loggerService.info('Refreshing user token.', logParam);
      const xeroClient = xeroService.getClient();
      const newTokenSet = await xeroService.getRefreshedTokenSet(xeroClient, tokenSet, { orgId, userId });

      loggerService.info('Updating token against user.', logParam);
      await userResource.updateUser({ userId: primaryUserDbo.id, tokenSet: newTokenSet });

      const xeroTenants = await xeroClient.updateTenants();

      return find(xeroTenants, ({ tenantId }) => tenantDbo.id === tenantId) ? 'active' : 'disconnected';
    } catch {
      // If we were unable to connect to Xero, we can assume the token has expired, or has disconnected. In this case, remove the token from the user
      // in the database.

      loggerService.info('Unable to connect to Xero using token set. Removing token set from user.', logParam);
      await userResource.updateUser({ userId: primaryUserDbo.id, tokenSet: null });

      return 'disconnected';
    }
  };
}

export const organisationResource = new OrganisationResource();
