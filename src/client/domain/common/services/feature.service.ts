import firebase from 'firebase/app';
import { includes, map, split, trim } from 'lodash';
import { firebaseService } from './firebase.service';

// Features must only contain letters, numbers and underscores. Special characters are not supported.
export type Feature = 'maintenance' | 'ff_markup_hidden_by_email';

type DefaultRemoteConfig = {
  [key in Feature]: 'off' | 'on' | string;
};

const DEFAULT_CONFIG: DefaultRemoteConfig = {
  maintenance: 'off',
  ff_markup_hidden_by_email: '',
};

class FeatureService {
  private _remoteConfig: firebase.remoteConfig.RemoteConfig;

  constructor() {
    this._remoteConfig = firebaseService.remoteConfig();

    // Because the default for fetching and activating remote config values is 12 hours, we won't be able to flip features in "real time", even if the
    // user refreshes the page. So to get around this, we are setting fetch refresh to 5 minutes. This isn't perfect, as if we have a lot of load
    // (I.e. a lot of users loading the app at the same time), we may get a throttling error from firebase, which will mean the user will either get
    // the default value, or the last activated value it got from the server, until they refresh the page again, and the throttling timeout has
    // expired.
    this._remoteConfig.settings.minimumFetchIntervalMillis = 300000;
    this._remoteConfig.defaultConfig = DEFAULT_CONFIG;
  }

  init = async () => {
    try {
      return this._remoteConfig.fetchAndActivate();
    } catch {
      return false;
    }
  };

  isEnabled = (feature: Feature) => {
    return this._remoteConfig.getValue(feature).asString() === 'on';
  };

  isEnabledByEmail = (feature: Feature, email: string) => {
    const emailsStr = this._remoteConfig.getValue(feature).asString();
    const emails = map(split(emailsStr, ','), trim);

    return includes(emails, email);
  };
}

export const featureService = new FeatureService();
