import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { AuthContextType } from '@client/auth';
import { ApolloProvider } from '@apollo/client';
import { apolloService, ToastProvider } from '@client/common';
import { MockAuthProvider } from './mock-auth-provider.component';

type RenderConfigParam = {
  path?: string;
  location?: string;
  authConfig?: Partial<AuthContextType>;
};

class TestService {
  render(children: ReactNode, config: RenderConfigParam = {}) {
    const { path = '/', location = '/', authConfig } = config;

    return render(
      <MemoryRouter initialEntries={[{ pathname: location }]}>
        <ApolloProvider client={apolloService}>
          <MockAuthProvider {...authConfig}>
            <ToastProvider>
              <Route exact path={path} render={() => children} />
            </ToastProvider>
          </MockAuthProvider>
        </ApolloProvider>
      </MemoryRouter>
    );
  }

  expectToThrow(method: () => void) {
    // Even though the error is caught, it still gets printed to the console so we mock that out to avoid the wall of red text.
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => '');

    expect(() => {
      method();
    }).toThrowError();

    spy.mockRestore();
  }
}

export const testService = new TestService();
