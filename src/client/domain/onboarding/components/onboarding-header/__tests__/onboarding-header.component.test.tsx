import React from 'react';
import { testService } from '@test/client';
import { OnboardingHeader } from '@client/onboarding';

describe('Auth | Components | <OnboardingHeader />', () => {
  it('should render correctly', () => {
    const { getByText } = testService.render(<OnboardingHeader>The onboarding header</OnboardingHeader>);

    expect(getByText('The onboarding header')).toBeTruthy();
  });
});
