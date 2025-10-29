import { ForbiddenError, IResolverObject } from 'apollo-server-express';
import { ERROR_MESSAGE, permissionService } from '@server/common';
import { orgEntitlementsDbGetters, orgEntitlementsDbCreators, orgEntitlementsDbUpdaters } from '@server/org-entitlements';
import { 
  GqlByOrgIdAndModeInput, 
  GqlCreateOrgEntitlementInput, 
  GqlUpdateOrgEntitlementInput,
  GqlOrgEntitlement 
} from '@graphql';

const Query: IResolverObject = {
  async orgEntitlements(rt, { input }: GqlArgs<GqlByOrgIdAndModeInput>, { token }: GqlContext): Promise<GqlOrgEntitlement[]> {
    const { orgId, mode } = input;
    await permissionService.isAuthenticated({ token });
    
    return await orgEntitlementsDbGetters.getOrgEntitlements(orgId, mode);
  },

  async orgEntitlementById(rt, { id }: { id: string }, { token }: GqlContext): Promise<GqlOrgEntitlement | null> {
    await permissionService.isAuthenticated({ token });
    
    // This would need to be implemented in the db-getters
    // For now, return null as this method doesn't exist yet
    return null;
  },

  async orgMarginPercentage(rt, { input }: GqlArgs<GqlByOrgIdAndModeInput>, { token }: GqlContext): Promise<GqlOrgEntitlement[]> {
    const { orgId, mode } = input;
    await permissionService.isAuthenticated({ token });
    
    return await orgEntitlementsDbGetters.getMarginPercentage(orgId, mode);
  },

  async orgPlanApprovalEmail(rt, { input }: GqlArgs<GqlByOrgIdAndModeInput>, { token }: GqlContext): Promise<GqlOrgEntitlement[]> {
    const { orgId, mode } = input;
    await permissionService.isAuthenticated({ token });
    
    return await orgEntitlementsDbGetters.getPlanApprovalEmail(orgId, mode);
  },
};

const Mutation: IResolverObject = {
  async createOrgEntitlement(rt, { input }: GqlArgs<GqlCreateOrgEntitlementInput>, { token }: GqlContext): Promise<GqlOrgEntitlement> {
    await permissionService.isAuthenticated({ token });
    
    await orgEntitlementsDbCreators.createOrgEntitlement(input);
    
    // Return the created entitlement by fetching it
    const entitlements = await orgEntitlementsDbGetters.getOrgEntitlements(input.orgId, 'default');
    return entitlements[0];
  },

  async updateOrgEntitlement(rt, { input }: GqlArgs<GqlUpdateOrgEntitlementInput>, { token }: GqlContext): Promise<GqlOrgEntitlement> {
    await permissionService.isAuthenticated({ token });
    
    // This would need to be implemented in the db-updaters
    // For now, throw an error as this method doesn't exist yet
    throw new Error('Update org entitlement not yet implemented in GraphQL');
  },

  async deleteOrgEntitlement(rt, { id }: { id: string }, { token }: GqlContext): Promise<boolean> {
    await permissionService.isAuthenticated({ token });
    
    // This would need to be implemented in the db-updaters
    // For now, throw an error as this method doesn't exist yet
    throw new Error('Delete org entitlement not yet implemented in GraphQL');
  },
};

export { Query, Mutation };
