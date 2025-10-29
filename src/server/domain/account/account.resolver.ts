import { IResolverObject, UserInputError } from 'apollo-server-express';
import { GqlAccount, GqlSignUpInput, GqlUser } from '@graphql';
import { userService } from '@server/user';
import { ERROR_MESSAGE } from '@server/common';
import { accountResource } from '@server/account';

const Query: IResolverObject = {
  async account(rt, args, { token }: GqlContext): Promise<GqlAccount> {
    return await accountResource.getAccountByToken(token);
  },
};

const Mutation: IResolverObject = {
  async signUp(rt, { input }: GqlArgs<GqlSignUpInput>): Promise<GqlUser> {
    const { firstName, lastName } = input;

    if (!userService.getUserDisplayName({ firstName, lastName })) {
      throw new UserInputError(ERROR_MESSAGE.invalidUsername);
    }

    return await accountResource.createAccount(input);
  },
};

export const accountResolvers = { Query, Mutation };
