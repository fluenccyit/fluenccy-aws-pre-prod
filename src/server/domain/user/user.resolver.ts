import { IResolverObject } from 'apollo-server-express';
import { userResource } from '@server/user';

const Query: IResolverObject = {
  async user(rt, args, { token }: GqlContext) {
    return await userResource.getUserByToken(token);
  },
};

export const userResolvers = { Query };
