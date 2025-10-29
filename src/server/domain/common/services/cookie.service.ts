import { Request } from 'express';

type CookieName = 'firebase-token';
type RequestWithUniversalCookies = Request & {
  universalCookies: {
    get: (name: CookieName) => string;
  };
};

class CookieService {
  getCookie(request: Request, name: CookieName) {
    const enhancedRequest = request as RequestWithUniversalCookies;

    if (!enhancedRequest?.universalCookies.get) {
      return '';
    }

    return enhancedRequest.universalCookies.get(name);
  }
}

export const cookieService = new CookieService();
