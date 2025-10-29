import React from 'react';
import { render } from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { IntercomProvider } from 'react-use-intercom';
import { App } from './app';
import { AuthProvider } from '@client/auth';
import { ApolloProvider } from '@apollo/client';
import { apolloService, ModalProvider, ToastProvider } from '@client/common';
// import './styles/antd.less';

const jsx = (
  <CookiesProvider>
    <BrowserRouter>
      <ApolloProvider client={apolloService}>
        <IntercomProvider appId={window.__FLUENCCY_APP_CONFIG__.INTERCOM_APP_ID}>
          <ToastProvider>
            <ModalProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ModalProvider>
          </ToastProvider>
        </IntercomProvider>
      </ApolloProvider>
    </BrowserRouter>
  </CookiesProvider>
);

render(jsx, document.getElementById('flnc-app'));
