import { AUTH_ROUTES } from '@client/auth';
import { APOLLO_ERROR_MESSAGE, loggerService, useInterval, useQueryLocalCommon } from '@client/common';
import { LocalOrganisationType, organisationVar, queryOrganisationById, useQueryLocalOrganisation } from '@client/organisation';
import { useHistory } from 'react-router-dom';

const POLL_TIMEOUT = 5000;

export const usePollOrganisationById = (id: string) => {
  const { organisation } = useQueryLocalOrganisation();
  const history = useHistory();
  const { ui } = useQueryLocalCommon();

  useInterval(
    async () => {
      try {
        if (!organisation) {
          return;
        }

        const latestOrganisation = await queryOrganisationById({ id });
        organisationVar(latestOrganisation as LocalOrganisationType);
      } catch (error) {
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
          return;
        }
        loggerService.error(error);
      }
    },
    ui === 'ready' ? POLL_TIMEOUT : null
  );
};
