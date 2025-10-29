import React from 'react';
import { testService } from '@test/client';
import { ONBOARDING_QUESTIONNAIRE, OnboardingQuestionnaire } from '@client/onboarding';

describe('Common | Containers | <OnboardingQuestionnaire />', () => {
  it('should render the first model item by default', () => {
    const { heading, question } = ONBOARDING_QUESTIONNAIRE[0];
    const { getByText } = testService.render(<OnboardingQuestionnaire />);

    expect(getByText(heading)).toBeTruthy();
    expect(getByText(question)).toBeTruthy();
  });

  it('should render the next model item by when clicking the button', () => {
    const { heading, question } = ONBOARDING_QUESTIONNAIRE[0];
    const { heading: headingNext, question: questionNext } = ONBOARDING_QUESTIONNAIRE[1];
    const { getByText, getByRole } = testService.render(<OnboardingQuestionnaire />);

    expect(getByText(heading)).toBeTruthy();
    expect(getByText(question)).toBeTruthy();

    const button = getByRole('button');
    button.click();

    expect(getByText(headingNext)).toBeTruthy();
    expect(getByText(questionNext)).toBeTruthy();
  });
});
