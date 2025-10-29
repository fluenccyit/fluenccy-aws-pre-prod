import { sharedUtilService } from '@shared/common';
import { apiService } from './api.service';
import { utilService } from './util.service';

export type AnalyticsEventName =
  | 'currencyscore_factors_credit'
  | 'currencyscore_factors_forecast'
  | 'currencyscore_factors_foreigncurrency'
  | 'currencyscore_factors_rate'
  | 'currencyscore_factors_risk'
  | 'currencyscore_plan_toggle'
  | 'currencyscore_plan_waitlist'
  | 'currencyscore_summary_error'
  | 'currencyscore_summary_primary'
  | 'currencyscore_summary_viewed'
  | 'currencyscore_viewed'
  | 'chart_viewed'
  | 'fx-purchases-viewed'
  | 'onboarding_connectxero_primary'
  | 'onboarding_connectxero_viewed'
  | 'onboarding_loadingstate'
  | 'onboarding_questions_1_primary'
  | 'onboarding_questions_1_viewed'
  | 'onboarding_questions_2_primary'
  | 'onboarding_questions_2_viewed'
  | 'onboarding_questions_3_primary'
  | 'onboarding_questions_3_viewed'
  | 'onboarding_questions_4_primary'
  | 'onboarding_questions_4_viewed'
  | 'onboarding_questions_primary'
  | 'onboarding_questions_viewed'
  | 'onboarding_signup_primary'
  | 'onboarding_signup_viewed'
  | 'onboarding_2factor-auth_viewed'
  | 'paymentvariance_currency_select'
  | 'paymentvariance_date_select'
  | 'paymentvariance_invoicelist_select'
  | 'paymentvariance_viewed'
  | 'performance_currency_select'
  | 'performance_viewed';

type IdentifyParam = {
  userId?: string;
  name?: string;
  email?: string;
};

type CachedTrackEvent = {
  event: AnalyticsEventName;
  additionalProperties?: Dictionary<any>;
};

class AnalyticsService {
  private _ip = '';
  private _fsid = '';
  private _userId = '';
  private _email = '';
  private _isIdentified = false;
  private _isInitialised = false;
  private _cachedTrackEvents: CachedTrackEvent[] = [];

  getBaseConfig = (additionalProperties?: Dictionary<any>) => {
    const config: Dictionary<any> = {
      anonymousId: this._fsid,
      properties: this.getBaseProperties(additionalProperties),
      context: this.getBaseContext(),
    };

    if (this._userId) {
      config.userId = this._userId;
    }

    return config;
  };

  getBaseProperties = (additionalProperties?: Dictionary<any>) => {
    const properties: Dictionary<any> = {
      ...additionalProperties,
      path: location.pathname,
      referrer: document.referrer,
      search: location.search,
      title: document.title,
      url: location.href,
    };

    if (this._email) {
      properties.email = this._email;
    }

    return properties;
  };

  getBaseContext = (): Dictionary => ({ ip: this._ip, user_agent: navigator.userAgent });

  init = async (fsid: string) => {
    // Get and set the IP address.
    const { ip: ipToSet } = (await apiService.get<{ ip: string }>('https://api64.ipify.org/?format=json', true)) || {};

    this._ip = ipToSet || '';
    this._fsid = fsid;
    this._isInitialised = true;
  };

  alias = async (userId: string) => {
    if (!this._isInitialised) {
      return;
    }

    await apiService.post('/analytics/alias', {
      properties: this.getBaseProperties(),
      context: this.getBaseContext(),
      previousId: this._fsid,
      userId,
    });
  };

  identify = async (param?: IdentifyParam, force?: boolean) => {
    if (!this._isInitialised || (this._isIdentified && !force)) {
      return;
    }

    const { userId, name, email } = param || {};

    if (userId) {
      this._userId = userId;
    }

    if (email) {
      this._email = email;
    }

    await apiService.post('/analytics/identify', {
      ...this.getBaseConfig(),
      traits: { name, email },
    });

    this._isIdentified = true;

    // Fire any cached track events once we've identified.
    await sharedUtilService.asyncForEach(this._cachedTrackEvents, async ({ event, additionalProperties }) => {
      await this.track(event, additionalProperties);
    });
  };

  page = async () => {
    if (!this._isIdentified) {
      return;
    }

    await apiService.post('/analytics/page', {
      ...this.getBaseConfig(),
      name: utilService.convertUrlToSentence(location.pathname) || 'Root',
    });
  };

  track = async (event: AnalyticsEventName, additionalProperties?: Dictionary<any>) => {
    if (!this._isIdentified) {
      // Cache the track event, so we can fire it right after the identify event has completed.
      this._cachedTrackEvents.push({ event, additionalProperties });
      return;
    }

    await apiService.post('/analytics/track', {
      ...this.getBaseConfig(additionalProperties),
      event,
    });
  };
}

export const analyticsService = new AnalyticsService();
