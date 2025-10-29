import React, { FormEvent, useState, memo } from 'react';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';
import { authService, FIREBASE_AUTH_ERROR } from '@client/auth';
import { Button, Card, CardContent, Input, Label, loggerService, Page, PageContent, Text } from '@client/common';

export const ForgotPasswordPage = memo(() => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({ email: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError('');
    setIsSaving(true);

    try {
      await authService.sendResetPasswordEmail(formData.email);

      setIsSent(true);
    } catch (error) {
      if (error.code === FIREBASE_AUTH_ERROR.userNotFound) {
        setFormError('Cannot find user with that email.');
      } else {
        loggerService.error(error);
        setFormError('An unexpected error occurred.');
      }

      setIsSaving(false);
    }
  };

  return (
    <Page>
      <PageContent className="min-h-screen" hasHeader={false} isCentered>
        <div className="text-center">
          <FluenccyLogoSvg className="mx-auto" />
          <Text className="font-bold text-3xl mt-4" isBlock>
            Reset Password
          </Text>
          <Text className="mt-2 text-sm" variant="gray" isBlock>
            or
            <Button className="ml-1" variant="info" state="text" href="/login" isDisabled={isSaving} isLink>
              go back to sign in
            </Button>
          </Text>
          <Card className="w-96 mt-6">
            <CardContent className="p-6">
              {Boolean(formError) && (
                <Text className="text-sm mb-4" variant="danger" isBlock>
                  {formError}
                </Text>
              )}
              {isSent ? (
                <div>
                  <Text isBlock>Great! We&apos;ve sent you an email to reset your password.</Text>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Label>Email address</Label>
                  <Input
                    className="mb-4"
                    value={formData.email}
                    onChange={({ target }) => setFormData({ ...formData, email: target.value })}
                    type="email"
                    data-testid="flnc-email-input"
                    autoComplete="current-password"
                    isDisabled={isSaving}
                    isRequired
                  />
                  <Button className="mt-4 w-full" type="submit" data-testid="flnc-submit-button" isDisabled={isSaving} isRounded>
                    Send reset password email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </Page>
  );
});
