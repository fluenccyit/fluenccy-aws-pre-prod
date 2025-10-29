import React, { memo } from 'react';
import { ErrorPanel, Page, PageContent } from '@client/common';

export const FiveHundredPage = memo(() => (
  <Page>
    <PageContent className="min-h-screen" hasHeader={false} isCentered>
      <ErrorPanel />
    </PageContent>
  </Page>
));
