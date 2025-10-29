import { GqlUser } from '@graphql';
import { TokenSet } from 'openid-client';

export type UserDbo = GqlUser & {
  tokenSet: TokenSet | null;
};
