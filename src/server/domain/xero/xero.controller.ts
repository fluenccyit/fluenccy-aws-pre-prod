import { find } from 'lodash';
import jwtDecode from 'jwt-decode';
import { Express, Request, Response } from 'express';
import { SHARED_XERO_ROUTES } from '@shared/xero';
import { sharedUtilService } from '@shared/common';
import { userDbGetters, userDbUpdaters } from '@server/user';
import { tenantDbCreators, tenantDbGetters } from '@server/tenant';
import { XERO_ROUTES, xeroQueue, xeroService, XeroTenantType } from '@server/xero';
import { authService, cookieService, ERROR_CODE, loggerService } from '@server/common';
import {
  ORGANISATION_DEFAULT_HEDGE_MARGIN,
  organisationDbCreators,
  organisationDbGetters,
  organisationDbUpdaters,
  organisationResource,
} from '@server/organisation';

type SignUpJwtDecodeResult = {
  email: string;
  given_name: string;
  family_name: string;
};

const controller = 'XeroController';
class XeroController {
  init = (app: Express) => {
    app.get(SHARED_XERO_ROUTES.connect, this.connect);
    app.get(XERO_ROUTES.connectCallback, this.connectCallback);
    app.get(SHARED_XERO_ROUTES.signUp, this.signUp);
    app.get(XERO_ROUTES.signUpCallback, this.signUpCallback);
  };

  connect = async (request: Request, response: Response) => {
    const logParam = { controller, method: 'connect' };

    response.set('Cache-Control', 'no-cache');

    // If there isn't a firebase token in the cookie, then we know the user hasn't logged in, so redirect them to the login screen. This should only
    // happen if the user tries to go directly to `/xero-connect` in the browser, and don't already have a session.
    try {
      await authService.verifyToken(cookieService.getCookie(request, 'firebase-token'));
    } catch {
      loggerService.error('User not logged in. Redirecting to login screen.', logParam);
      return response.redirect('/login');
    }

    try {
      const client = xeroService.getClient();

      loggerService.info('Building Xero consent url for connect.', logParam);
      const consentUrl = await client.buildConsentUrl();

      loggerService.info('Redirecting user to Xero connect consent url.', logParam);
      response.redirect(consentUrl);
    } catch ({ status, message }) {
      loggerService.error(message);
      response.status(status || ERROR_CODE.badRequest).redirect('/error');
    }
  };

  connectCallback = async (request: Request, response: Response) => {
    const logParam = { controller, method: 'connectCallback' };

    response.set('Cache-Control', 'no-cache');

    try {
      loggerService.info('Verifying token.', logParam);

      // First we verify that there is a user record against the firebase token uid. This is so we can store the Xero token set against the user.
      const { uid } = await authService.verifyToken(cookieService.getCookie(request, 'firebase-token'));
      const user = await userDbGetters.getUserByFirebaseUid(uid);

      if (!user) {
        loggerService.error('Unable to find a user associated with firebase uid.', { ...logParam, uid });
        response.status(ERROR_CODE.badRequest).redirect('/error');
        return;
      }

      // If we receive an `access_denied` error on the query param, then we can assume the user bailed out of the OAuth flow. In this case, just
      // redirect the user back to the app.
      // @TODO: We should persist the last URL the user was on, and redirect them there.
      if (request.query.error === 'access_denied') {
        response.redirect('/');
        return;
      }

      const xeroClient = xeroService.getClient();
      await xeroClient.initialize();

      loggerService.info('Parsing token set from URL.', logParam);
      const tokenSet = await xeroService.getTokenFromUrl(xeroClient, request.url);
      const { id: userId, accountId } = user;

      if (!tokenSet || !accountId) {
        loggerService.error('Unable to parse token set.', logParam);
        response.status(ERROR_CODE.badRequest).redirect('/error');
        return;
      }

      loggerService.info('Updating existing token set against user.', { ...logParam, userId });
      await userDbUpdaters.updateUser({ ...user, tokenSet });

      const [xeroTenants, organisationDbos, tenantDbos] = await Promise.all([
        xeroClient.updateTenants() as Promise<XeroTenantType[]>,
        organisationDbGetters.queryOrganisationByAccountId(accountId),
        tenantDbGetters.queryTenant(),
      ]);

      loggerService.info('Storing Xero tenants against account.', logParam);
      await sharedUtilService.asyncForEach(xeroTenants, async ({ tenantId, tenantName, orgData }) => {
        loggerService.info('Processing tenant.', { ...logParam, tenantId });

        if (find(tenantDbos, ({ id }) => id === tenantId)) {
          loggerService.info('Already have a record of tenant. Skipping.', { ...logParam, tenantId });
        } else {
          loggerService.info('Storing tenant.', { ...logParam, tenantId });
          await tenantDbCreators.createTenant({ id: tenantId, provider: 'xero', lastSynced: null });
        }

        const organisationDbo = find(organisationDbos, ({ tenantId: tenantIdToCheck }) => tenantId === tenantIdToCheck);

        if (organisationDbo) {
          const { id: orgId } = organisationDbo;
          loggerService.info('Already have an organisation with tenant.', { ...logParam, orgId, tenantId });

          await organisationDbUpdaters.updateOrganisation({
            ...organisationDbo,
            syncStatus: 'pullingInvoicesAndPayments',
          });

          const organisationUser = await organisationDbGetters.getOrganisationUser({ orgId, userId });

          if (!organisationUser) {
            loggerService.info('Adding user to organisation.', { ...logParam, userId, orgId });

            await organisationDbCreators.createOrganisationUser({ orgId, userId });
          } else {
            loggerService.info('User already exists in organisation.', { ...logParam, userId, orgId });
          }

          loggerService.info('Setting user as the token user for organisation.', { ...logParam, userId, orgId });
          await organisationDbUpdaters.updateOrganisation({ ...organisationDbo, tokenUserId: userId });

          loggerService.info('Adding organisation to the Xero sync queue.', { ...logParam, orgId });
          await xeroQueue.add(organisationDbo);
        } else {
          const orgId = sharedUtilService.generateUid('org_');

          loggerService.info('Creating organisation for tenant.', { ...logParam, tenantId, orgId });

          const currency = orgData.baseCurrency;

          await organisationDbCreators.createOrganisation({
            id: orgId,
            tokenUserId: userId,
            name: tenantName,
            syncStatus: 'pullingInvoicesAndPayments',
            buildPlanScore: 0,
            buildPlanAnswers: [],
            currencyScores: [],
            hedgeMargin: ORGANISATION_DEFAULT_HEDGE_MARGIN,
            intentRegistered: false,
            onboardingComplete: false,
            initialSyncComplete: false,
            accountId,
            tenantId,
            currency,
          });

          loggerService.info('Adding user to organisation.', { ...logParam, userId, orgId });
          await organisationDbCreators.createOrganisationUser({ orgId, userId });

          loggerService.info('Adding organisation to the Xero sync queue.', { ...logParam, orgId });
          await xeroQueue.add(await organisationResource.getOrganisationDboById(orgId));
        }
      });

      loggerService.info('Xero connect successful. Redirecting to the app to continue onboarding.', logParam);
      response.redirect('/onboarding');
    } catch ({ status, message }) {
      loggerService.error(message);
      response.status(status || ERROR_CODE.badRequest).redirect('/error');
    }
  };

  signUp = async (request: Request, response: Response) => {
    const logParam = { controller, method: 'signUp' };

    response.set('Cache-Control', 'no-cache');

    try {
      const client = xeroService.getClient({ isSignUp: true });

      loggerService.info('Building Xero consent url for sign up.', logParam);
      const consentUrl = await client.buildConsentUrl();

      loggerService.info('Redirecting user to Xero sign up consent url.', logParam);
      response.redirect(consentUrl);
    } catch ({ status, message }) {
      loggerService.error(message);
      response.status(status || ERROR_CODE.badRequest).redirect('/error');
    }
  };

  signUpCallback = async (request: Request, response: Response) => {
    const logParam = { controller, method: 'signUpCallback' };

    response.set('Cache-Control', 'no-cache');

    try {
      // If we receive an `access_denied` error on the query param, then we can assume the user bailed out of the OAuth flow. In this case, just
      // redirect the user back to login.
      // @TODO: We should communicate this to the user somehow.
      if (request.query.error === 'access_denied') {
        response.redirect('/login');
        return;
      }

      const xeroClient = xeroService.getClient({ isSignUp: true });
      await xeroClient.initialize();

      loggerService.info('Parsing token set from URL.', logParam);
      const tokenSet = await xeroService.getTokenFromUrl(xeroClient, request.url);

      if (!tokenSet?.id_token) {
        loggerService.error('Unable to parse token set.', logParam);
        response.status(ERROR_CODE.badRequest).redirect('/error');
        return;
      }

      const { email = '', given_name = '', family_name = '' } = jwtDecode<SignUpJwtDecodeResult>(tokenSet.id_token);
      const searchParam = new URLSearchParams({ email, firstName: given_name, lastName: family_name }).toString();

      response.redirect(`/sign-up?${searchParam}`);
    } catch ({ status, message }) {
      loggerService.error(message);
      response.status(status || ERROR_CODE.badRequest).redirect('/error');
    }
  };
}

export const xeroController = new XeroController();
