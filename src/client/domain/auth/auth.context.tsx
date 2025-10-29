import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import firebase from 'firebase/app';
import { useIntercom } from 'react-use-intercom';
import { authService } from './auth.service';
import { clearLocalApolloCache, localStorageService, useCookies, useAnalytics } from '@client/common';

export type AuthContextType = {
  firebaseUser: firebase.User | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  xeroSelected: boolean;
  setXeroSelected: (v: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { alias, identify } = useAnalytics();
  const { update: updateIntercom } = useIntercom();
  const { setCookie, removeCookie } = useCookies();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [token, setToken] = useState<AuthContextType['token']>(null);
  const [firebaseUser, setFirebaseUser] = useState<AuthContextType['firebaseUser']>(null);
  const [xeroSelected, setXeroSelected] = useState(true);

  const identifyUser = async (firebaseUser: firebase.User) => {
    if (firebaseUser.displayName && firebaseUser.email) {
      const { uid: userId, displayName: name, email } = firebaseUser;

      updateIntercom({ name, email });
      await identify({ userId, name, email }, true);
      await alias(userId);
    }
  };

  useEffect(() => {
    authService.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        await identifyUser(firebaseUser);
        setToken(await firebaseUser.getIdToken());
      } else {
        setToken(null);
      }
      setIsAuthenticating(false);
    });

    authService.onIdTokenChanged(async () => {
      // If the token refreshes, we will store the new token in state.
      if (firebaseUser) {
        setToken(await firebaseUser.getIdToken());
      }
    });
  }, []);

  useEffect(() => {
    if (token) {
      setCookie('firebase-token', token);
      localStorageService.setItem('firebase-token', token);
    } else {
      removeCookie('firebase-token');
      localStorageService.removeItem('firebase-token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const firebaseUser = await authService.signInWithEmailAndPassword(email, password);

    setFirebaseUser(firebaseUser);
    setToken(await firebaseUser.getIdToken());
    localStorageService.removeItem('selected-organisation-id-by-superdealer');
  };

  const logout = async () => {
    await clearLocalApolloCache();
    await authService.signOut();
    setCookie('two-factor-auth', 'false');
    localStorageService.removeItem('selected-organisation-id-by-superdealer');
  };

  const value = useMemo(
    () => ({
      firebaseUser,
      isAuthenticated: Boolean(firebaseUser) && Boolean(token),
      isAuthenticating,
      login,
      logout,
      token,
      xeroSelected,
      setXeroSelected,
    }),
    [isAuthenticating, firebaseUser, token, xeroSelected]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('This component must be used within a <AuthProvider> component.');
  }

  return context;
};
