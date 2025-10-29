import { IResolverObject } from 'apollo-server-express';
import { GqlByTenantIdInput } from '@graphql';
import { tenantResource } from '@server/tenant';
import { permissionService } from '@server/common';

const Query: IResolverObject = {
  async currenciesByTenant(rt, { input }: GqlArgs<GqlByTenantIdInput>, { token }: GqlContext) {
    const { tenantId, paymentType = "" } = input;
    await permissionService.canAccessTenant({ token, tenantId });

    return await tenantResource.queryCurrencyByTenantId(tenantId, paymentType);
  },
};

export const tenantResolvers = { Query };
