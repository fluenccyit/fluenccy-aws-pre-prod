/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv-json')();

import '@testing-library/jest-dom';

process.env.ENVIRONMENT = 'jest';

window.__FLUENCCY_APP_CONFIG__ = {
  ENVIRONMENT: 'jest',
  FIREBASE_API_KEY: 'MOCK_FIREBASE_API_KEY',
  FIREBASE_APP_ID: 'MOCK_FIREBASE_APP_ID',
  FIREBASE_AUTH_DOMAIN: 'MOCK_FIREBASE_AUTH_DOMAIN',
  FIREBASE_MESSAGING_SENDER_ID: 123456789,
  FIREBASE_PROJECT_ID: 'MOCK_FIREBASE_PROJECT_ID',
  FIREBASE_STORAGE_BUCKET: 'MOCK_FIREBASE_STORAGE_BUCKET',
  INTERCOM_APP_ID: '',
  SEGMENT_KEY: 'MOCK_SEGMENT_KEY',
};

// Mocking lottie to always return an empty string as the View so our unit tests can run.
jest.mock('lottie-react', () => {
  return {
    useLottie() {
      return {
        View: '',
      };
    },
  };
});

