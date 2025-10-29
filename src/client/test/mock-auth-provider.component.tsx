import React, { ReactNode } from 'react';
import { AuthContext, AuthContextType } from '@client/auth';

type Props = Partial<AuthContextType> & {
  children: ReactNode;
};

export const MockAuthProvider = ({
  children,
  isAuthenticated = false,
  isAuthenticating = false,
  login = () => new Promise(() => ''),
  logout = () => new Promise(() => ''),
  token = null,
  firebaseUser = null,
}: Props) => (
  <AuthContext.Provider
    value={{
      isAuthenticated,
      isAuthenticating,
      login,
      logout,
      token,
      firebaseUser,
    }}
  >
    {children}
  </AuthContext.Provider>
);
