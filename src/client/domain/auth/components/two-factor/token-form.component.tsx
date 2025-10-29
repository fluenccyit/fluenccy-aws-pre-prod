import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { DASHBOARD_ROUTES } from '@client/dashboard';
import { useAuth, AUTH_ROUTES } from '@client/auth';
import { Button, Card, CardContent, Input, Label, Text, useCookies, useToast, FluenccyLoader, localStorageService } from '@client/common';
import axios from 'axios';

export const TokenAuthForm = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResent, setIsResent] = useState(false);
  const [isSending, setIsSending] = useState(true);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ token: '' });
  const { addToast } = useToast();
  const history = useHistory();
  const { setCookie } = useCookies();
  const { token, isAuthenticating, isAuthenticated, firebaseUser } = useAuth();

  const { email, from = '', role = '' } = history.location.state || {};

  if (!email) {
    history.push(AUTH_ROUTES.login);
    return null;
  }

  useEffect(() => {
    if (token && !!firebaseUser) {
      setIsSending(true);
      sendToken('send', () => {
        setIsSending(false);
        setIsLoading(false);
      });
    }
  }, [token, firebaseUser?.displayName]);

  useEffect(() => {
    if (!isAuthenticating && !isAuthenticated) {
      return history.push(AUTH_ROUTES.login);
    }
  }, [isAuthenticated, isAuthenticating]);

  const onChangeField = (e) => {
    const { value } = e.target;
    const v = value.substr(0, 6);
    if (v.length === 6) {
      setIsValidating(true);
      validate(v);
      return;
    }

    setFormData({ token: v });
  };

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type);
  };

  const validate = async (v) => {
    setFormError('');
    const payload = { code: v, email };
    try {
      const url = '/api/auth/verify-code';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(url, payload, { headers })
        .then(() => {
          setCookie('two-factor-auth', 'true');
          if (from === 'signup' && role !== 'superdealer') {
            history.push(ONBOARDING_ROUTES.questionnaire);
          } else {
            history.push(DASHBOARD_ROUTES.root);
          }
        })
        .catch((e) => {
          console.log(e);
          setIsValidating(false);
          openNotificationWithIcon('danger', 'Error', 'Failed to validate token.');
        });
    } catch (e) {
      console.error(e);
      setIsValidating(false);
      openNotificationWithIcon('danger', 'Error', 'Error in upading password.');
    }
  };

  const sendToken = (type, cb) => {
    try {
      const url = type === 'resend' ? '/api/auth/resend-code' : '/api/auth/send-code';
      const headers = {
        authorization: token,
      };
      const payload = { email, username: firebaseUser?.displayName || firebaseUser?.email };
      axios
        .post(url, payload, { headers })
        .then(() => {
          openNotificationWithIcon('success', '', 'Token sent to your registered email id.');
          cb();
        })
        .catch((e) => {
          console.log(e);
          cb();
          openNotificationWithIcon('danger', 'Error', 'Failed to send token.');
        });
    } catch (e) {
      console.error(e);
      cb();
      openNotificationWithIcon('danger', 'Error', 'Failed to send token.');
    }
  };

  const resendToken = (e) => {
    e.preventDefault();
    setIsResending(true);
    setIsLoading(true);
    sendToken('resend', () => {
      setIsResending(false);
      setIsResent(true);
      setIsLoading(false);
    });
  };

  return (
    <Card className="w-96 mt-6">
      <CardContent className="p-6">
        {(isSending || isResending) && (
          <FluenccyLoader
            loop={isSending || isResending}
            className="absolute z-1 w-12"
            style={{ position: 'absolute', zIndex: 1, top: '5rem', left: '50%' }}
          />
        )}
        {Boolean(formError) && (
          <Text className="text-sm mb-4" variant="danger" isBlock>
            {formError}
          </Text>
        )}
        <Text className="text-sm mb-4" variant="success" isBlock>
          {!isResent
            ? 'Enter two factor authentication code sent on your registered email.'
            : 'Enter two factor authentication code resent on your registered email.'}
        </Text>

        <div>
          <Input
            className="mb-4"
            value={formData.token}
            onChange={onChangeField}
            autoComplete="off"
            isDisabled={isValidating || isResending}
            isRequired
            placeholder="Enter token"
          />
          <Text isBlock className="flex justify-end items-center">
            <a href="#" onClick={resendToken} className="text-sm text-blue-500">
              Resend code
            </a>
          </Text>
        </div>
      </CardContent>
    </Card>
  );
};
