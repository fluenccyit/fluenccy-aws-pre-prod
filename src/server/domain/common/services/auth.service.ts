import admin, { app, auth, ServiceAccount } from 'firebase-admin';
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { ERROR_MESSAGE } from '@server/common';
import { loggerService } from './logger.service';

const {
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_CLIENT_ID,
  FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  FIREBASE_ADMIN_PRIVATE_KEY_ID,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
} = process.env;

type CreateUserParam = {
  displayName: string;
  email: string;
  password: string;
};

class AuthService {
  private _admin: app.App | undefined;

  init() {
    // Processing private key, so the new lines aren't escaped.
    const processedPrivateKey = FIREBASE_ADMIN_PRIVATE_KEY?.split('\\n').join('\n');

    this._admin = admin.initializeApp({
      credential: admin.credential.cert({
        type: 'service_account',
        project_id: FIREBASE_PROJECT_ID,
        private_key_id: FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: `-----BEGIN PRIVATE KEY-----\n${processedPrivateKey}\n-----END PRIVATE KEY-----\n`,
        client_email: FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      } as ServiceAccount),
    });
  }

  healthCheck = () => {
    const isHealthy = Boolean(this._admin);

    loggerService.info(`<healthCheck>`, {
      service: 'AuthService',
      healthCheck: isHealthy ? 'healthy' : 'unhealthy',
    });

    return isHealthy;
  };

  createUser({ displayName, email, password }: CreateUserParam): Promise<auth.UserRecord> {
    return new Promise((resolve, reject) => {
      if (!this._admin) {
        throw new ApolloError(ERROR_MESSAGE.firebaseNotInitialised);
      }

      this._admin.auth().createUser({ displayName, email, password }).then(resolve).catch(reject);
    });
  }

  verifyToken(token: string): Promise<auth.DecodedIdToken> {
    return new Promise((resolve, reject) => {
      if (!this._admin) {
        throw new ApolloError(ERROR_MESSAGE.firebaseNotInitialised);
      }

      this._admin
        .auth()
        .verifyIdToken(token)
        .then(resolve)
        .catch(() => reject(new AuthenticationError('Authentication failed.')));
    });
  }

  getFirebaseUserByUid(firebaseUid: string): Promise<auth.UserRecord> {
    return new Promise((resolve, reject) => {
      if (!this._admin) {
        throw new ApolloError(ERROR_MESSAGE.firebaseNotInitialised);
      }

      this._admin
        .auth()
        .getUser(firebaseUid)
        .then(resolve)
        .catch(() => reject(new ApolloError(ERROR_MESSAGE.noUser)));
    });
  }

  getFirebaseUserEmail(email: string): Promise<auth.UserRecord | null> {
    return new Promise((resolve) => {
      if (!this._admin) {
        throw new ApolloError(ERROR_MESSAGE.firebaseNotInitialised);
      }

      this._admin
        .auth()
        .getUserByEmail(email)
        .then(resolve)
        .catch(() => resolve(null));
    });
  }
}

export const authService = new AuthService();
