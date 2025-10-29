import React, { memo } from 'react';
import { Badge, Text } from '@client/common';

export const CurrencyScoreFactorsCredit = memo(() => {
  return (
    <div className="py-8 px-4 w-full xl:py-0 xl:px-0">
      <Text className="text-lg">Credit</Text>
      <Badge className="ml-4" variant="success" state="solid">
        Coming soon
      </Badge>
      <Text className="text-sm mt-6 md:w-1/2 md:max-w-lg" variant="gray" isBlock>
        Understanding how much credit you have with the bank can improve your score by helping us to plan for your future requirements.
      </Text>
    </div>
  );
});
