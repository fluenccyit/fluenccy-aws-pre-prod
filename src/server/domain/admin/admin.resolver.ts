import { ForbiddenError, IResolverObject, UserInputError } from 'apollo-server-express';
import { GqlAdminCreateSuperuserInput, GqlAdminInviteUsersInput } from '@graphql';
import { adminResource } from '@server/admin';
import { ERROR_MESSAGE } from '@server/common';
import { userResource, userService } from '@server/user';

const Mutation: IResolverObject = {
  async adminInviteUsers(rt, { input }: GqlArgs<GqlAdminInviteUsersInput>, { token }: GqlContext) {
    const user = await userResource.getUserByToken(token);

    if (user.role !== 'superuser') {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }

    return await adminResource.inviteUsers(input);
  },

  async adminCreateSuperuser(rt, { input }: GqlArgs<GqlAdminCreateSuperuserInput>, { token }: GqlContext) {
    const user = await userResource.getUserByToken(token);

    if (user.role !== 'superuser') {
      throw new ForbiddenError(ERROR_MESSAGE.permission);
    }

    const { firstName, lastName } = input;
    if (!userService.getUserDisplayName({ firstName, lastName })) {
      throw new UserInputError(ERROR_MESSAGE.invalidUsername);
    }

    return await adminResource.createSuperUser(input);
  },
};

export const adminResolvers = { Mutation };
