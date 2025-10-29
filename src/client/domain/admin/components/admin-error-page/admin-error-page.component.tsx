import React from 'react';
import { AdminHeader } from '@client/admin';
import { ErrorPanel, Page, PageContent } from '@client/common';

type Props = {
  state?: 'not-found';
};

export const AdminErrorPage = ({ state }: Props) => (
  <Page>
    <AdminHeader />
    <PageContent className="min-h-screen" isCentered>
      <ErrorPanel state={state} />
    </PageContent>
  </Page>
);
