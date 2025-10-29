import { GqlOrganisationBuildPlanAnswerId, GqlOrganisationBuildPlanQuestionId, GqlOrganisationSyncStatus } from '@graphql';
import CurrencyScoreOnboardingImg from "@assets/images/currency_score.png";
import InvoiceManagerOnboardingImg from "@assets/images/invoice_manager.png"

export const ONBOARDING_STEP_LABELS = ['Create account', '2 Factor Auth', 'Connect Xero', 'Questions', 'Import Csv'] as const;
export type OnboardingStepLabelType = typeof ONBOARDING_STEP_LABELS[number];

export const ONBOARDING_SYNC_STATUS_ORDER: { [key in GqlOrganisationSyncStatus]: number } = {
  pullingInvoicesAndPayments: 1,
  calculatingTransactionDetails: 2,
  calculatingTransactionDetailsComplete: 2,
  calculatingCurrencyScores: 3,
  synced: 4,

  // Error states are not considered.
  calculatingTransactionDetailsError: 0,
  calculatingCurrencyScoresError: 0,
  syncError: 0,
};

type OnboardingAnswerModel = {
  id: GqlOrganisationBuildPlanAnswerId;
  label: string;
  value: number;
};

type OnboardingQuestionModel = {
  id: GqlOrganisationBuildPlanQuestionId;
  heading: string;
  question: string;
  answers: OnboardingAnswerModel[];
};

export const ONBOARDING_QUESTIONNAIRE: OnboardingQuestionModel[] = [
  {
    id: 'salesCosts',
    heading: 'Sales Costs',
    question: 'How often do you change your sales price due to cost changes?',
    answers: [
      {
        id: 'monthlyOrMore',
        label: 'Monthly or more',
        value: 10,
      },
      {
        id: 'everyCoupleOfMonths',
        label: 'Every couple of months',
        value: 5,
      },
      {
        id: 'quarterlyOrLess',
        label: 'Quarterly or less',
        value: -7,
      },
    ],
  },
  {
    id: 'profitMargin',
    heading: 'Profit Margin',
    question: 'What is your gross profit margin?',
    answers: [
      {
        id: 'lessThanTenPercent',
        label: 'Less than 10%',
        value: 7,
      },
      {
        id: 'tenToThirtyPercent',
        label: '10% - 30%',
        value: 5,
      },
      {
        id: 'moreThanThirtyPercent',
        label: 'More than 30%',
        value: 1,
      },
    ],
  },
  {
    id: 'sensitivity',
    heading: 'Sensitivity to Fluctuations',
    question: 'How much would the currency have to drop in the next 3 months to cause you concern?',
    answers: [
      {
        id: 'fifteenPercent',
        label: '-15%',
        value: 10,
      },
      {
        id: 'tenPercent',
        label: '-10%',
        value: 7,
      },
      {
        id: 'fivePercent',
        label: '-5%',
        value: 5,
      },
    ],
  },
  {
    id: 'strategy',
    heading: 'Current Strategy',
    question: 'Which of the below best describes your situation?',
    answers: [
      {
        id: 'highRisk',
        label: 'I want the best possible rate and sharp drops in the currency don’t worry me',
        value: 15,
      },
      {
        id: 'certainty',
        label: 'I want full certainty of what my foreign invoices will cost me in local terms and don’t mind missing out if the rate moves higher',
        value: 8,
      },
      {
        id: 'balanced',
        label: 'I want to achieve the best result in the long term, balancing reducing risk with benefiting from a rising market',
        value: 5,
      },
    ],
  },
];


export const ONBOARDING_CURRENCY_SCORE = {
  currencyScore: {
    title: 'Currency Score',
    subTitle: 'Upnderstand how your bussiness is performing against the industry benchmark, and how you could save.',
    icon: CurrencyScoreOnboardingImg
  },
  invoiceManager: {
    title: 'Invoice Manager',
    subTitle: 'Invoice Manager empowers you to upload, manage, and plan for savings on international invoices.',
    icon: InvoiceManagerOnboardingImg
  },
  title: 'Give us your data and we will take care of the rest',
};
