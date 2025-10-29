import React, { ReactNode, memo } from 'react';
import { GqlSupportedCurrency } from '@graphql';
import { FlagIcon, Text, utilService } from '@client/common';

type Props = {
  children: ReactNode;
  currency: GqlSupportedCurrency;
  amount: number;
  heading: string;
};

export const VarianceBreakdownCurrencySection = memo(({ children, currency, amount, heading }: Props) => (
  <>
    <Text className="text-lg mb-2" isBlock>
      {heading}
    </Text>
    <div className="flex items-center mb-2">
      <FlagIcon className="mr-2" currency={currency} />
      <Text className="mr-1" isBlock>
        {currency}:
      </Text>
      <Text className="font-bold" isBlock>
        {utilService.formatCurrencyAmount(amount, currency)}
      </Text>
    </div>
    <Text className="text-xs" variant="gray" isBlock>
      {children}
    </Text>
  </>
));
