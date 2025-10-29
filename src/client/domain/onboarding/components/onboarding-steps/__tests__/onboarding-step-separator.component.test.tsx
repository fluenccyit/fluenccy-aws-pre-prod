import React from 'react';
import { testService } from '@test/client';
import { OnboardingStepSeparator } from '@client/onboarding';

describe('Auth | Components | <OnboardingStepSeparator />', () => {
  it('should apply the correct styles if `isComplete` is true', () => {
    const { container } = testService.render(<OnboardingStepSeparator isComplete />);

    expect(container.firstChild).toHaveClass('bg-green-500');
  });

  it('should apply the correct styles if `isComplete` is false', () => {
    const { container } = testService.render(<OnboardingStepSeparator />);

    expect(container.firstChild).toHaveClass('bg-gray-400');
  });
});
