import { parseISO } from 'date-fns';
import { IResolverObject } from 'apollo-server-express';
import { GqlInvoicesInput } from '@graphql';
import { invoiceResource } from '@server/invoice';
import { permissionService } from '@server/common';

const Query: IResolverObject = {
  async invoices(rt, { input }: GqlArgs<GqlInvoicesInput>, { token }: GqlContext) {
    const { tenantId } = input;
    await permissionService.canAccessTenant({ token, tenantId });

    return await invoiceResource.queryInvoice({
      ...input,
      dateTo: parseISO(input.dateTo),
    });
  },
};

export const invoiceResolvers = { Query };
