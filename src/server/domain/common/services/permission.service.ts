import { find, some } from 'lodash';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { userResource } from '@server/user';
import { ERROR_MESSAGE } from '@server/common';
import { accountResource } from '@server/account';
import { organisationResource } from '@server/organisation';
import { loggerService } from './logger.service';

type IsSuperUserParam = {
  token: string;
};

type CanAccessByParam<Key extends string> = { [key in Key]: string } & IsSuperUserParam;

const service = 'PermissionService';
class PermissionService {
  async isSuperUser({ token }: IsSuperUserParam, allowFalse = false) {
    const logParam = { service, method: 'isSuperUser' };

    loggerService.info('Checking if the user is a superuser.', logParam);

    const user = await userResource.getUserByToken(token);

    if (user.role === 'superuser') {
      return true;
    }

    if (allowFalse) {
      return false;
    } else {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }
  }

  async canAccessOrganisation({ token, orgId }: CanAccessByParam<'orgId'>): Promise<boolean> {
    const logParam = { service, method: 'canAccessOrganisation', orgId };

    if (await this.isSuperUser({ token }, true)) {
      return true;
    }

    loggerService.info('Checking if the org can be accessed by the user in context.', logParam);
    const account = await accountResource.getAccountByToken(token);
    const organisations = await organisationResource.queryOrganisationByAccountId(account.id);
    const organisation = find(organisations, ({ id }) => id === orgId);

    if (!organisation) {
      throw new ApolloError(ERROR_MESSAGE.noOrganisation);
    }

    if (organisation.account.id !== account.id) {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }

    return true;
  }

  canAccessTenant = async ({ token, tenantId }: CanAccessByParam<'tenantId'>): Promise<boolean> => {
    const logParam = { service, method: 'canAccessTenant', tenantId };

    if (await this.isSuperUser({ token }, true)) {
      return true;
    }

    loggerService.info('Checking if the tenant can be accessed by the user in context.', logParam);
    const organisations = await organisationResource.queryOrganisationByToken(token);

    if (!organisations || !some(organisations, ({ tenant }) => tenant.id === tenantId)) {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }

    return true;
  };
}

export const permissionService = new PermissionService();
