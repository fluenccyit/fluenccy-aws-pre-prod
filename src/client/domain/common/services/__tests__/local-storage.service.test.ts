import { localStorageService } from '@client/common';

describe('@client/common | localStorageService', () => {
  afterEach(() => window.localStorage.clear());

  describe('#setItem', () => {
    const { setItem } = localStorageService;

    it('should set the passed item to local storage', () => {
      setItem('firebase-token', 'mock-value-1');

      expect(window.localStorage.getItem('firebase-token')).toEqual('mock-value-1');
    });
  });

  describe('#getItem', () => {
    const { getItem } = localStorageService;

    it('should get the currently passed item in local storage', () => {
      window.localStorage.setItem('firebase-token', 'mock-value-2');

      expect(getItem('firebase-token')).toEqual('mock-value-2');
    });
  });

  describe('#removeItem', () => {
    const { removeItem } = localStorageService;

    it('should remove the passed item from local storage', () => {
      window.localStorage.setItem('firebase-token', 'mock-value-3');

      expect(window.localStorage.getItem('firebase-token')).toEqual('mock-value-3');

      removeItem('firebase-token');

      expect(window.localStorage.getItem('firebase-token')).toEqual(null);
    });
  });
});
