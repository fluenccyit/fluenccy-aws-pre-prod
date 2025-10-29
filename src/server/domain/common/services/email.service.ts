import sgMail, { MailDataRequired, MailService } from '@sendgrid/mail';
import { env } from 'process';

const { SENDGRID_API_KEY } = process.env;

export const SENDGRID_TEMPLATE_IDS = {
  betaInvitation: 'd-07d1c7b709e044b08dae42becec7315a',
  hedgingDetails: 'd-6dbfddb661d04adb9b44ac225d26f98a',
  termsheetEmail: 'd-aa1a1d5655234f329d940269d45813d1',
};

class EmailService {
  private _client: MailService | undefined;

  constructor() {
    if (SENDGRID_API_KEY) {
      sgMail.setApiKey(SENDGRID_API_KEY);

      this._client = sgMail;
    }
  }

  async send(data: MailDataRequired | MailDataRequired[]) {
    if (!this._client) {
      throw new Error('SendGrid not initialised');
    }

    if ( env.ENVIRONMENT != "local" && env.EMAIL_ENABLED == "TRUE" ) {
      return await this._client.send(data);
    } else {
      return true;
    }
  }
}

export const emailService = new EmailService();
