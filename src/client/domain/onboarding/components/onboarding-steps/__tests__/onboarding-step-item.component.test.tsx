import React from 'react';
import { testService } from '@test/client';
import { OnboardingStepItem } from '@client/onboarding';

describe('Auth | Components | <OnboardingStepItem />', () => {
  it('should apply the correct styles if `isComplete` is true', () => {
    const { container } = testService.render(<OnboardingStepItem label="Create account" isComplete />);

    expect(container.firstChild).toHaveClass('text-gray-900');
    expect(container.firstChild?.firstChild).toHaveClass('bg-green-500');
  });

  it('should apply the correct styles if `isComplete` is false', () => {
    const { container } = testService.render(<OnboardingStepItem label="Create account" />);

    expect(container.firstChild).toHaveClass('text-gray-450');
    expect(container.firstChild?.firstChild).toHaveClass('bg-white');

    expect(container.firstChild).toHaveClass('font-normal');
  });

  it('should apply the correct styles if `isActive` is true', () => {
    const { container } = testService.render(<OnboardingStepItem label="Create account" isActive />);

    expect(container.firstChild?.firstChild).toHaveClass('border-green-500');
  });

  it('should apply the correct styles if `isActive` is false', () => {
    const { container } = testService.render(<OnboardingStepItem label="Create account" />);

    expect(container.firstChild?.firstChild).toHaveClass('border-gray-400');
    expect(container.firstChild).toHaveClass('font-normal');
  });
});
