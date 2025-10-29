import React, { memo, useEffect, useState, useMemo } from 'react';
import { find, map } from 'lodash';
import { useHistory } from 'react-router';
import { GqlOrganisationBuildPlanAnswer } from '@graphql';
import { ONBOARDING_ROUTES, ONBOARDING_QUESTIONNAIRE } from '@client/onboarding';
import { useMutationOrganisation, useQueryLocalOrganisation } from '@client/organisation';
import {
  Button,
  loggerService,
  ProgressBar,
  RadioButton,
  Text,
  ToastGenericError,
  uiVar,
  useAnalytics,
  useQueryLocalCommon,
  useToast,
} from '@client/common';
import { ONBOARDING_STEP_LABELS } from '@client/onboarding/onboarding.constant';

type HandleSubmitParam = {
  buildPlanScore: number;
  buildPlanAnswers: GqlOrganisationBuildPlanAnswer[];
};

export const OnboardingQuestionnaire = memo(() => {
  const history = useHistory();
  const { addToast } = useToast();
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const { updateOrganisation } = useMutationOrganisation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<GqlOrganisationBuildPlanAnswer[]>([]);
  const numQuestions = ONBOARDING_QUESTIONNAIRE.length;
  const isFinalQuestion = useMemo(() => currentIndex === numQuestions - 1, [currentIndex]);
  const { id: questionId, question, answers, heading } = useMemo(() => ONBOARDING_QUESTIONNAIRE[currentIndex], [currentIndex]);

  useEffect(() => {
    if (!currentIndex) {
      track('onboarding_questions_1_viewed');
    } else if (currentIndex === 1) {
      track('onboarding_questions_2_viewed');
    } else if (currentIndex === 2) {
      track('onboarding_questions_3_viewed');
    } else if (currentIndex === 3) {
      track('onboarding_questions_4_viewed');
    }
  }, [currentIndex]);

  const handleSubmit = async ({ buildPlanScore, buildPlanAnswers }: HandleSubmitParam) => {
    try {
      uiVar('saving');

      if (!organisation) {
        return;
      }

      await updateOrganisation({ variables: { input: { orgId: organisation.id, buildPlanAnswers, buildPlanScore } } });

      if (organisation.syncStatus === 'synced') {
        return history.push(ONBOARDING_ROUTES.uploadCurrencyScore);
      }
      return history.push(ONBOARDING_ROUTES.currencyScoreSummary);
    } catch (error) {
      loggerService.error(error);
      addToast(<ToastGenericError />, 'danger');
      uiVar('ready');
    }
  };

  const handleNextStepClick = () => {
    const answer = selectedAnswerId ? find(answers, ({ id }) => id === selectedAnswerId) : null;

    if (!answer) {
      return;
    }

    if (!currentIndex) {
      track('onboarding_questions_1_primary', { answer: answer.label });
    } else if (currentIndex === 1) {
      track('onboarding_questions_2_primary', { answer: answer.label });
    } else if (currentIndex === 2) {
      track('onboarding_questions_3_primary', { answer: answer.label });
    } else if (currentIndex === 3) {
      track('onboarding_questions_4_primary', { answer: answer.label });
    }

    const buildPlanScore = currentScore + answer.value;
    const buildPlanAnswers = [...currentAnswers, { questionId, answerId: answer.id }];
    setCurrentScore(buildPlanScore);
    setCurrentAnswers(buildPlanAnswers);
    setSelectedAnswerId(null);
    isFinalQuestion ? handleSubmit({ buildPlanScore, buildPlanAnswers }) : setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
      <Text className="text-2xl" variant="success">
        {(currentIndex + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}
      </Text>
      <Text variant="gray">/{numQuestions.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}</Text>
      <ProgressBar className="mt-1.5" separatorClassName="bg-white" total={numQuestions} completed={currentIndex + 1} />
      <Text className="text-md mt-7" variant="gray" isBlock>
        {heading}
      </Text>
      <Text className="text-xl font-bold mb-6" isBlock>
        {question}
      </Text>
      {map(answers, ({ id, label }, index) => (
        <RadioButton
          key={index}
          className="mt-2"
          onChange={(value) => setSelectedAnswerId(value)}
          name="onboarding-questionnaire"
          value={id}
          data-testid="flnc-onboarding-radio-button"
          isDisabled={ui === 'saving'}
          isSelected={id === selectedAnswerId}
          isRequired
        >
          {label}
        </RadioButton>
      ))}
      <div className="flex justify-end mt-6">
        <Button
          className="w-full md:w-auto"
          onClick={handleNextStepClick}
          data-testid="flnc-onboarding-next-button"
          isDisabled={!selectedAnswerId || ui === 'saving'}
          isRounded
        >
          {isFinalQuestion ? 'Show my score' : 'Next'}
        </Button>
      </div>
    </>
  );
});
