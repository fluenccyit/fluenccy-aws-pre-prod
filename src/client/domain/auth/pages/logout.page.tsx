import React, { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES, useAuth } from '@client/auth';
import { FluenccyLoader, Page, PageContent, Text } from '@client/common';

export const LogoutPage = memo(() => {
  const history = useHistory();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();

      history.push(AUTH_ROUTES.login);
    })();
  }, []);

  return (
    <Page>
      <PageContent className="min-h-screen" hasHeader={false} isCentered>
        <div>
          <FluenccyLoader />
          <Text className="text-center" isBlock>
            Logging you out...
          </Text>
        </div>
      </PageContent>
    </Page>
  );
});
