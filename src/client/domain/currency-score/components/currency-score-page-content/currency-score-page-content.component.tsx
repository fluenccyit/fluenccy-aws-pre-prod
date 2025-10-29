import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { Card, PageContent, TAILWIND_SCREEN_LG, useWindowWidth } from '@client/common';
import { useIsOrganisationTokenInactive } from '@client/organisation';

type Props = {
  children?: ReactNode;
};

export const CurrencyScorePageContent = memo(({ children }: Props) => {
  const { windowWidth } = useWindowWidth();
  const isTokenInactive = useIsOrganisationTokenInactive();
  const isLargeScreen = windowWidth >= TAILWIND_SCREEN_LG;
  const classes = cn({
    'min-h-screen flex': isLargeScreen,
  });

  return (
    <PageContent className={classes} hasPadding={false} hasBanner={isTokenInactive}>
      {isLargeScreen ? <>{children}</> : <Card className="m-3">{children}</Card>}
    </PageContent>
  );
});
