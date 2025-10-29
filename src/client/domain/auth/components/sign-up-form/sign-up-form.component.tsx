import React, { useState, FormEvent } from 'react';
import cn from 'classnames';
import { useHistory } from 'react-router-dom';
import { GqlSignUpInput, GqlAccountType, GqlSupportedCurrency } from '@graphql';
import { AUTH_ROUTES, useAuth } from '@client/auth';
import { useMutationAccount, ACCOUNT_TYPE_OPTIONS } from '@client/account';
import { useAnalytics, Text, Label, Input, Select, Button, Checkbox, RadioButton } from '@client/common';
import ReCAPTCHA from 'react-google-recaptcha';
import XeroLogoSVG from '@assets/svg/xero-logo.svg';
import { SUPPORTED_CURRENCIES } from '@shared/rate';

type Props = {
  className?: string;
  initialFormValues?: Partial<GqlSignUpInput>;
};

const BASE_CLASSES = ['w-full', 'px-5', 'pb-5', 'overflow-y-scroll', 'md:w-onboarding-form', 'lg:px-20', 'lg:min-w-onboarding-form'];

export const SignUpForm = ({ className, initialFormValues }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const history = useHistory();
  const { track } = useAnalytics();
  const { signUp } = useMutationAccount();
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<GqlSignUpInput>({
    firstName: initialFormValues?.firstName || '',
    lastName: initialFormValues?.lastName || '',
    email: initialFormValues?.email || '',
    accountType: 'sme',
    accountName: '',
    password: '',
    currencyCode: '',
  });

  const [captcha, setCaptcha] = useState('');

  const { login, xeroSelected, setXeroSelected } = useAuth();
  

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!!captcha) {
      setFormError('');
      setIsSaving(true);

      const { email, firstName, lastName, accountType, accountName: companyName } = formData;
      const eventProperties = { email, firstName, lastName, accountType, companyName };

      try {
        await signUp({ variables: { input: formData } });
        await track('onboarding_signup_primary', eventProperties);
        await login(formData.email, formData.password);
        history.push({ pathname: AUTH_ROUTES.twoFactor, state: { email: formData.email, from: 'signup', role: accountType } });
      } catch ({ message }) {
        track('onboarding_signup_primary', { ...eventProperties, error: message });
        setFormError(message);
        setIsSaving(false);
      }
    } else {
      setFormError('Please select captcha');
    }
  };

  const onChangeCaptcha = (value) => {
    setCaptcha(value);
  };

  const toggleCompanyProfile = (v) => setXeroSelected(!xeroSelected);

  const isValid = xeroSelected ? true : !!formData.accountName && !!formData.currencyCode;

  return (
    <form className={classes} onSubmit={handleSubmit}>
      <Text className="text-xl mb-6 mt-5 md:mt-7" isBlock>
        To see your currency performance sign up and provide your organisation details.
      </Text>
      {Boolean(formError) && (
        <Text className="text-center text-sm mb-4" variant="danger" isBlock>
          {formError}
        </Text>
      )}
      <Label>First name</Label>
      <Input
        value={formData.firstName}
        onChange={({ target }) => setFormData({ ...formData, firstName: target.value })}
        isDisabled={isSaving}
        isRequired
      />
      <Label className="mt-4">Last name</Label>
      <Input
        value={formData.lastName}
        onChange={({ target }) => setFormData({ ...formData, lastName: target.value })}
        isDisabled={isSaving}
        isRequired
      />

      <Label className="mt-4">Email</Label>
      <Input
        value={formData.email}
        onChange={({ target }) => setFormData({ ...formData, email: target.value })}
        type="email"
        autoComplete="username"
        isDisabled={isSaving}
        isRequired
      />

      <Label className="mt-4">Password</Label>
      <Input
        value={formData.password}
        onChange={({ target }) => setFormData({ ...formData, password: target.value })}
        type="password"
        autoComplete="new-password"
        isDisabled={isSaving}
        isRequired
      />
      <Label className="mt-4">I am:</Label>
      <Select
        className="mt-2"
        options={ACCOUNT_TYPE_OPTIONS}
        value={formData.accountType}
        onChange={(accountType) => {
          return setFormData({ ...formData, accountType: accountType as GqlAccountType });
        }}
        isDisabled={isSaving}
        isRequired
      />
      <div className="flex mt-3 justify-between items-center">
        <Text className="text-xl mb-2 mt-5 md:mt-7" isBlock>
          Add Organisation Details
        </Text>
      </div>

      <div className="flex flex-col justify-between">
        <RadioButton
          className="mr-2"
          onChange={() => setXeroSelected(true)}
          name="sync-with-xero"
          value={'withXero'}
          data-testid="flnc-onboarding-radio-button"
          isSelected={xeroSelected}
          displayIcon
        >
            <span className="flex inline-flex flex-shrink-0 items-center rounded-md px-2 py-2 justify-center">Sync with <XeroLogoSVG className="ml-2" /></span>
        </RadioButton>
        <RadioButton
          className="mr-2"
          onChange={() => setXeroSelected(false)}
          name="org-enter-manually"
          value={'manually'}
          data-testid="flnc-onboarding-radio-button"
          isSelected={!xeroSelected}
          displayIcon
        >
          <span className="flex inline-flex flex-shrink-0 items-center rounded-md px-2 py-2 justify-center">Enter Manually</span>
        </RadioButton>
      </div>

      {!xeroSelected && (
        <>
          <Label className="mt-4">Organisation Name</Label>
          <Input
            value={formData.accountName}
            onChange={({ target }) => setFormData({ ...formData, accountName: target.value })}
            isDisabled={isSaving}
            isRequired
          />

          <Label className="mt-4">Operational Currency</Label>
          <Select
            className="mt-2"
            options={[{ value: '', label: 'Select' }, ...SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))]}
            value={formData.currencyCode}
            onChange={(currencyCode) => {
              return setFormData({ ...formData, currencyCode: currencyCode as GqlAccountType });
            }}
            isDisabled={isSaving}
            isRequired
          />
        </>
      )}
      <div className="flex items-center justify-start mt-8 w-full text-center">
        <br />
        <ReCAPTCHA sitekey="6LcA6L8fAAAAAMU6Odui6yqlKjO2kgBllnl9dxSu" onChange={onChangeCaptcha} />
      </div>

      <Button className="text-sm mt-4" state="text" variant="info" href="/login" isDisabled={isSaving} isLink>
        Log into your account
      </Button>
      <Button className="w-full rounded-full mt-4" type="submit" isDisabled={isSaving || !captcha || !isValid}>
        Next
      </Button>
    </form>
  );
};
