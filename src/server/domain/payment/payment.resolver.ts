import { parseISO } from 'date-fns';
import { IResolverObject } from 'apollo-server-express';
import { GqlPaymentsInput } from '@graphql';
import { paymentResource } from '@server/payment';
import { permissionService } from '@server/common';

const Query: IResolverObject = {
  async payments(rt, { input }: GqlArgs<GqlPaymentsInput>, { token }: GqlContext) {
    const { tenantId } = input;
    await permissionService.canAccessTenant({ token, tenantId });

    return await paymentResource.queryPayment({
      ...input,
      dateFrom: parseISO(input.dateFrom),
      dateTo: parseISO(input.dateTo),
    });
  },
};

export const paymentResolvers = { Query };
