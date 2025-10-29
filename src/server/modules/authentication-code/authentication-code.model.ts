import { BaseDbo } from '@server/common';

export type AuthenticationCodeDbo = BaseDbo & {
  email: string;
  code:string;
  username:string;
};
