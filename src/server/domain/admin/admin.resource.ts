import fs from 'fs';
import path from 'path';
import { join } from 'lodash';
import { MailDataRequired } from '@sendgrid/mail';
import { sharedUtilService } from '@shared/common';
import { userDbCreators, userService } from '@server/user';
import { GqlAdminCreateSuperuserInput, GqlAdminInviteUsersInput } from '@graphql';
import { authService, emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';

const { DOMAIN } = process.env;

const INVITATION_DECK_PATH = path.resolve(__dirname, '../../assets/invitation-deck.pdf');

const resource = 'AdminResource';
class AdminResource {
  async inviteUsers({ emails }: GqlAdminInviteUsersInput) {
    const logParam = { resource, method: 'inviteUsers' };

    try {
      const invitationDeckContent = fs.readFileSync(INVITATION_DECK_PATH, { encoding: 'base64' });
      const messages: MailDataRequired[] = [];

      await sharedUtilService.asyncForEach(emails, async (email) => {
        loggerService.info('Checking if we already have an account.', { ...logParam, email });

        const firebaseUser = await authService.getFirebaseUserEmail(email);

        if (firebaseUser) {
          loggerService.info('Account already exists. Skipping.', { ...logParam, email });
          return;
        }

        loggerService.info('Preparing Fluenccy invite.', { ...logParam, email });
        messages.push({
          to: email,
          from: 'Fluenccy <hello@fluenccy.com>',
          templateId: SENDGRID_TEMPLATE_IDS.betaInvitation,
          hideWarnings: true,
          // @ts-ignore-next-line
          dynamic_template_data: { email, href: `${DOMAIN}/sign-up` },
          attachments: [
            {
              filename: 'welcome-to-fluenccy.pdf',
              type: 'application/pdf',
              content: invitationDeckContent,
            },
          ],
        });
      });

      loggerService.info('Sending email(s).', { ...logParam, messageCount: messages.length });
      await emailService.send(messages);
      loggerService.info('Email(s) sent.', logParam);

      return true;
    } catch (error) {
      loggerService.error('Failed to send Fluenncy invites.', { ...logParam, emails: join(emails, ', ') });

      return false;
    }
  }

  async createSuperUser({ email, firstName, lastName }: GqlAdminCreateSuperuserInput) {
    const logParam = { resource, method: 'createSuperUser', email, firstName, lastName };

    try {
      loggerService.info('Checking if we already have a superuser account.', logParam);

      const firebaseUser = await authService.getFirebaseUserEmail(email);

      if (firebaseUser) {
        loggerService.info('Account already exists. Skipping.', logParam);
        return true;
      }

      const userId = sharedUtilService.generateUid('usr_');
      loggerService.info('Creating Firebase user.', logParam);
      const { uid: firebaseUid } = await authService.createUser({
        email,
        displayName: userService.getUserDisplayName({ firstName, lastName }),
        password: userId,
      });
      loggerService.info('Firebase user created.', { ...logParam, firebaseUid });

      loggerService.info('Creating Fluenccy user.', logParam);
      await userDbCreators.createUser({
        id: userId,
        firebaseUid,
        firstName,
        lastName,
        role: 'superuser',
        accountId: null,
        tokenSet: null,
      });
      loggerService.info('Fluenccy user created.', { ...logParam, userId });

      return true;
    } catch (error) {
      loggerService.error('Failed to create Fluenccy superuser.', { ...logParam, stackTrace: JSON.stringify(error) });
      return false;
    }
  }
}

export const adminResource = new AdminResource();
