declare namespace NodeJS {
  export interface ProcessEnv {
    ENVIRONMENT: 'local' | 'qa' | 'staging' | 'production' | 'jest';
    PORT: string;
    DOMAIN: string;
    DEBUG_LEVEL: string;

    ENCRYPTION_SECRET: string;
    ENCRYPT_SECRET: string;

    CORALOGIX_APP_NAME: string;
    CORALOGIX_PRIVATE_KEY: string;

    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;

    FX_MARKET_API_KEY: string;

    NEW_RELIC_APP_NAME: string;
    NEW_RELIC_LICENCE_KEY: string;

    POSTGRES_HOST: string;
    POSTGRES_DATABASE: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_PORT: string;

    REDIS_TLS_URL: string;
    REDIS_URL: string;

    SEGMENT_KEY: string;

    SENDGRID_API_KEY: string;

    XERO_CLIENT_ID: string;
    XERO_CLIENT_SECRET: string;
    XERO_CONNECT_OAUTH_REDIRECT_URI: string;
    XERO_SIGN_UP_OAUTH_REDIRECT_URI: string;
    RECAPTCHA_API_KEY: string;
  }
}

// declare module '@newrelic/apollo-server-plugin';

declare module 'dotenv-json';

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}
