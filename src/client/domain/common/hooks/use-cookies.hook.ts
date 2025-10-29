import { CookieSetOptions } from 'universal-cookie';
import { useCookies as useReactCookies } from 'react-cookie';

type CookieName = 'firebase-token' | 'fsid' | 'two-factor-auth';

export const useCookies = () => {
  const [cookies, setReactCookie, removeReactCookie] = useReactCookies(['firebase-token', 'fsid', 'two-factor-auth']);

  const getCookie = (name: CookieName) => {
    return cookies[name];
  };

  const setCookie = (name: CookieName, value: string, options?: CookieSetOptions) => {
    setReactCookie(name, value, {
      ...options,
      path: '/',
    });
  };

  const removeCookie = (name: CookieName) => {
    removeReactCookie(name);
  };

  return {
    getCookie,
    setCookie,
    removeCookie,
  };
};
