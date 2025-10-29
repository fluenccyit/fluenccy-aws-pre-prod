import { GqlUser, GqlAccount } from '@graphql';
import { TokenSet } from 'openid-client';

export type UserDbo = GqlUser & {
    tokenSet: TokenSet | null;
  };

export type AccountDbo = GqlAccount;