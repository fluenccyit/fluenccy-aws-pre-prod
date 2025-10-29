import React, { memo } from 'react';
import { ErrorPanel, Page, PageContent } from '@client/common';

export const FourOhFourPage = memo(() => (
  <Page>
    <PageContent className="min-h-screen" hasHeader={false} isCentered>
      <ErrorPanel />
    </PageContent>
  </Page>
));
