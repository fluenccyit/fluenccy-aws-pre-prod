import React from 'react';
import { ErrorPanel, Page, PageContent, TheHeader } from '@client/common';

type Props = {
  hasNoNavLinks?: boolean;
};

export const AppErrorPage = ({ hasNoNavLinks }: Props) => (
  <Page>
    <TheHeader hasNoNavLinks={hasNoNavLinks} />
    <PageContent className="min-h-screen" isCentered>
      <ErrorPanel />
    </PageContent>
  </Page>
);
