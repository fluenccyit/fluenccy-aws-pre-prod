import { SelectOption } from '@client/common';
import { GqlAccountType } from '@graphql';

export const ACCOUNT_TYPE_OPTIONS: SelectOption<GqlAccountType>[] = [
  {
    label: 'An Accountant',
    value: 'accountant',
  },
  {
    label: 'A Business Owner',
    value: 'sme',
  },
];
