export {};

declare global {
  interface Window {
    __FLUENCCY_APP_CONFIG__: {
      ENVIRONMENT: 'local' | 'qa' | 'staging' | 'production' | 'jest';
      FIREBASE_API_KEY: string;
      FIREBASE_APP_ID: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_MESSAGING_SENDER_ID: number;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      INTERCOM_APP_ID: string;
      SEGMENT_KEY: string;
    };
  }

  type Dictionary<T = string> = {
    [key: string]: T;
  };

  type DateRangeParam = {
    dateFrom: Date;
    dateTo: Date;
  };

  type GqlContext = {
    token: string;
  };

  type GqlArgs<T> = {
    input: T;
  };

  type DataTestidType =
    | 'flnc-admin-organisation-row'
    | 'flnc-admin-organisation-view-name'
    | 'flnc-breakdown-payment-variance'
    | 'flnc-breakdown-performance'
    | 'flnc-onboarding-next-button'
    | 'flnc-onboarding-radio-button'
    | 'flnc-onboarding-start-button'
    | 'flnc-chart-month'
    | 'flnc-chart-payment-variance-dots'
    | 'flnc-chart-performance-dots'
    | 'flnc-chart-years'
    | 'flnc-email-input'
    | 'flnc-forgot-password-input'
    | 'flnc-forgot-password-link'
    | 'flnc-invoice-table-row-chart'
    | 'flnc-invoice-table-row'
    | 'flnc-invoice-table-skeleton'
    | 'flnc-invoice-table'
    | 'flnc-password-input'
    | 'flnc-submit-button'
    | 'flnc-tab-payment-variance'
    | 'flnc-tab-performance';

  declare namespace Cypress {
    interface Chainable {
      assertDashboardInvoiceTable(): Chainable<any>;
      assertDashboardInvoiceTableChart(): Chainable<any>;
      assertDashboardPaymentVarianceBreakdown(): Chainable<any>;
      assertDashboardPaymentVarianceChart(): Chainable<any>;
      assertDashboardPerformanceBreakdown(): Chainable<any>;
      assertDashboardPerformanceChart(): Chainable<any>;
      dataTestid(value: DataTestidType): Chainable<Element>;
      ensureContainsMultiple(check: string[]): Chainable<any>;
      login(email: string, password: string): Chainable<any>;
      restoreLocalStorage(): Chainable<any>;
      saveLocalStorage(): Chainable<any>;
      selectFirstRadioAndClickNext(): Chainable<any>;
    }
  }
}

window.__FLUENCCY_APP_CONFIG__ = window.__FLUENCCY_APP_CONFIG__ || {};
