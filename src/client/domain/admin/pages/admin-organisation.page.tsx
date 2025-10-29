import { AUTH_ROUTES } from '@client/auth';
import { uiVar, APOLLO_ERROR_MESSAGE, useQueryLocalCommon, PageContent, Page } from '@client/common';
import { LocalAdminOrganisationType, organisationVar, queryOrganisationById } from '@client/organisation';
import { loggerService } from '@client/common';
import React, { memo, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AdminErrorPage, AdminOrganisationContent, AdminOrganisationControls } from '..';
import { usePollOrganisationById } from '../hooks';

export const AdminOrganisationPage = memo(() => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const { ui } = useQueryLocalCommon();

  usePollOrganisationById(orgId);

  useEffect(() => {
    (async () => {
      try {
        const organisation = await queryOrganisationById({ id: orgId });
        organisationVar(organisation as LocalAdminOrganisationType);
        uiVar('ready');
      } catch (error) {
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
          return;
        }

        loggerService.error(error);

        // @TODO: import this from ERROR_MESSAGE constant once moved from server into shared
        if (error.message === 'Organisation does not exist.') {
          uiVar('not-found');
          return;
        }

        uiVar('error');
      }
    })();
    return () => {
      organisationVar(null);
    };
  }, []);

  if (ui === 'error') {
    return <AdminErrorPage />;
  }

  if (ui === 'not-found') {
    return <AdminErrorPage state="not-found" />;
  }

  return (
    <Page>
      <PageContent hasPadding={false} className="h-full">
        <AdminOrganisationControls />
        <AdminOrganisationContent />
      </PageContent>
    </Page>
  );
});
