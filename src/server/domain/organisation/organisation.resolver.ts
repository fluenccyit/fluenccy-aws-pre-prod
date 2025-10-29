import { ForbiddenError, IResolverObject } from 'apollo-server-express';
import { userResource } from '@server/user';
import { organisationResource } from '@server/organisation';
import { ERROR_MESSAGE, permissionService } from '@server/common';
import { GqlByEmailInput, GqlByIdInput, GqlByOrgIdInput, GqlByPaymentTypeInput, GqlOrganisation, GqlUpdateOrganisationInput } from '@graphql';

const Query: IResolverObject = {
  async organisationById(rt, { input }: GqlArgs<GqlByIdInput>, { token }: GqlContext): Promise<GqlOrganisation | null> {
    const { id } = input;
    await permissionService.isSuperUser({ token });

    return await organisationResource.getOrganisationById(id);
  },

  async organisations(rt, args, { token }: GqlContext): Promise<GqlOrganisation[]> {
    await permissionService.isSuperUser({ token });

    return await organisationResource.queryOrganisation();
  },

  // @TODO: We probably want to deprecate this method once we redo the admin screen.
  async organisationsByEmail(rt, { input }: GqlArgs<GqlByEmailInput>, { token }: GqlContext): Promise<GqlOrganisation[]> {
    const { role } = await userResource.getUserByToken(token);
    const { email } = input;

    if (role !== 'superuser') {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }

    const user = await userResource.getUserByEmail(email, true);

    if (!user?.accountId) {
      return [];
    }

    return await organisationResource.queryOrganisationByAccountId(user.accountId);
  },

  async organisationsByToken(rt, {input}: GqlArgs<GqlByPaymentTypeInput>, { token}: GqlContext): Promise<GqlOrganisation[]> {
    return await organisationResource.queryOrganisationByToken(token, input?.paymentType);
  },
};

const Mutation: IResolverObject = {
  async deleteOrganisation(rt, { input }: GqlArgs<GqlByOrgIdInput>, { token }: GqlContext): Promise<boolean> {
    const { orgId } = input;
    await permissionService.canAccessOrganisation({ token, orgId });
    await organisationResource.deleteOrganisationById(orgId);

    return true;
  },

  async disconnectOrganisation(rt, { input }: GqlArgs<GqlByOrgIdInput>, { token }: GqlContext): Promise<boolean> {
    const { orgId } = input;
    await permissionService.canAccessOrganisation({ token, orgId });
    await organisationResource.disconnectOrganisationById(orgId);

    return true;
  },

  async resyncOrganisation(rt, { input }: GqlArgs<GqlByOrgIdInput>, { token }: GqlContext): Promise<GqlOrganisation> {
    const { orgId } = input;
    await permissionService.canAccessOrganisation({ token, orgId });

    return await organisationResource.resyncOrganisationById(orgId);
  },

  async refreshOrganisationToken(rt, { input }: GqlArgs<GqlByOrgIdInput>, { token }: GqlContext): Promise<GqlOrganisation> {
    const { orgId } = input;
    await permissionService.canAccessOrganisation({ token, orgId });

    return await organisationResource.refreshOrganisationTokenById(orgId);
  },

  async recalculateOrganisationCurrencyScores(rt, { input }: GqlArgs<GqlByOrgIdInput>, { token }: GqlContext): Promise<GqlOrganisation> {
    const { orgId } = input;
    await permissionService.canAccessOrganisation({ token, orgId });

    return await organisationResource.recalculateOrganisationCurrencyScoresById(orgId);
  },

  async updateOrganisation(rt, { input }: GqlArgs<GqlUpdateOrganisationInput>, { token }: GqlContext): Promise<GqlOrganisation> {
    const { orgId } = input;
    // await permissionService.canAccessOrganisation({ token, orgId });

    return await organisationResource.updateOrganisation(input);
  },
};

export const organisationResolvers = { Query, Mutation };
