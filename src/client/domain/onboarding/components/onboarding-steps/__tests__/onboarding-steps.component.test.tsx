import React from 'react';
import { testService } from '@test/client';
import { OnboardingSteps, ONBOARDING_STEP_LABELS } from '@client/onboarding';

describe('Auth | Components | <OnboardingSteps />', () => {
  it('should render correctly when the first label is active', () => {
    const { getAllByText } = testService.render(<OnboardingSteps activeLabel={ONBOARDING_STEP_LABELS[0]} />);
    const activeLabel = getAllByText(ONBOARDING_STEP_LABELS[0]);

    expect(activeLabel.length).toBe(2);
  });

  it('should render correctly when the second label is active', () => {
    const { getAllByText } = testService.render(<OnboardingSteps activeLabel={ONBOARDING_STEP_LABELS[1]} />);
    const activeLabel = getAllByText(ONBOARDING_STEP_LABELS[1]);

    expect(activeLabel.length).toBe(2);
  });

  it('should render correctly when the third label is active', () => {
    const { getAllByText } = testService.render(<OnboardingSteps activeLabel={ONBOARDING_STEP_LABELS[2]} />);
    const activeLabel = getAllByText(ONBOARDING_STEP_LABELS[2]);

    expect(activeLabel.length).toBe(2);
  });
});
