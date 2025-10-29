import React, { FormEvent, useState, memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';
import { AUTH_ROUTES, FIREBASE_AUTH_ERROR, useAuth } from '@client/auth';
import { Button, Card, CardContent, Input, Label, Page, PageContent, Text } from '@client/common';
import ReCAPTCHA from "react-google-recaptcha";

export const LoginPage = memo(() => {
  const history = useHistory();
  const { login, logout } = useAuth();
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [captcha, setCaptcha] = useState('');
  
  // console.log('before RECAPTCHA_API_KEY')
  console.log('process.env.RECAPTCHA_API_KEY ', process.env.RECAPTCHA_API_KEY)
  // console.log('after RECAPTCHA_API_KEY')
  

  useEffect(() => {
    (async () => {
      // Logging the user out of any sessions they may be in if they come directly to the login page.
      await logout();
    })();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!!captcha) {
      setFormError('');
      setIsSaving(true);

      try {
        await login(formData.email, formData.password);

        history.push({ pathname: AUTH_ROUTES.twoFactor, state: { email: formData.email } });
      } catch ({ code }) {
        if (code === FIREBASE_AUTH_ERROR.userNotFound || code === FIREBASE_AUTH_ERROR.wrongPassword) {
          setFormError('Email or password are incorrect.');
        } else {
          setFormError('An unexpected error occurred.');
        }

        setIsSaving(false);
      }
    } else {
      setFormError('Please select captcha');
    }
  };

  const onChangeCaptcha = (value) => {
    setCaptcha(value)
  }

  return (
    <Page>
      <PageContent className="min-h-screen" hasHeader={false} isCentered>
        <div className="w-full sm:w-96 text-center">
          <FluenccyLogoSvg className="mx-auto" />
          <Text className="font-bold text-lg sm:text-3xl mt-4" isBlock>
            Sign into your account
          </Text>
          <Text className="text-sm mt-2" variant="gray" isBlock>
            Or{' '}
            <Button href={AUTH_ROUTES.signUp} state="text" variant="info" isDisabled={isSaving} isLink>
              sign up for Fluenccy
            </Button>
          </Text>
          <Card className="w-full mt-6">
            <CardContent className="p-8">
              {Boolean(formError) && (
                <Text className="text-sm mb-4" variant="danger" isBlock>
                  {formError}
                </Text>
              )}
              <form onSubmit={handleSubmit}>
                <Label>Email address</Label>
                <Input
                  className="mb-4"
                  value={formData.email}
                  onChange={({ target }) => setFormData({ ...formData, email: target.value })}
                  type="email"
                  data-testid="flnc-email-input"
                  autoComplete="username"
                  isError={Boolean(formError)}
                  isDisabled={isSaving}
                  isRequired
                />
                <Label>Password</Label>
                <Input
                  value={formData.password}
                  onChange={({ target }) => setFormData({ ...formData, password: target.value })}
                  type="password"
                  data-testid="flnc-password-input"
                  autoComplete="current-password"
                  isError={Boolean(formError)}
                  isDisabled={isSaving}
                  isRequired
                />
                <div className="flex items-center justify-end mt-4">
                  <Button
                    className="text-sm"
                    state="text"
                    variant="info"
                    href="/forgot-password"
                    data-testid="flnc-forgot-password-link"
                    isDisabled={isSaving}
                    isLink
                  >
                    Forgot your password?
                  </Button>
                </div>
                <div className="flex items-center justify-start mt-4">
                  <ReCAPTCHA
                    sitekey="6LcA6L8fAAAAAMU6Odui6yqlKjO2kgBllnl9dxSu"
                    onChange={onChangeCaptcha}
                  />
                </div>
                <Button className="mt-4 w-full" type="submit" data-testid="flnc-submit-button" isDisabled={isSaving || !captcha} isRounded>
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </Page>
  );
});
