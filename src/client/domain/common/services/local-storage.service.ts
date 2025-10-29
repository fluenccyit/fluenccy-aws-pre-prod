type LocalStorageKey = 'firebase-token' | 'selected-organisation-id' | 'tenant-id' | 'hideHeader' | 'selected-organisation-id-by-superdealer' | 'reports-chart-dateto' | 'reports-chart-datefrom';

class LocalStorageService {
  setItem(key: LocalStorageKey, value: string) {
    if (window?.localStorage?.setItem) {
      window.localStorage.setItem(key, value);
    }
  }

  getItem(key: LocalStorageKey) {
    return window?.localStorage?.getItem ? window.localStorage.getItem(key) : '';
  }

  removeItem(key: LocalStorageKey) {
    if (window?.localStorage?.removeItem) {
      window.localStorage.removeItem(key);
    }
  }
}

export const localStorageService = new LocalStorageService();
