import React, { memo } from 'react';
import { Header, TheHeaderNavLinks, TheHeaderActions } from '@client/common';

type Props = {
  hasNoNavLinks?: boolean;
};

export const TheHeader = memo(({ hasNoNavLinks }: Props) => (
  <Header>
    <div className="flex items-center justify-between w-full">
      <TheHeaderNavLinks hasNoNavLinks={hasNoNavLinks} />
      <TheHeaderActions hasNoNavLinks={hasNoNavLinks} />
    </div>
  </Header>
));
