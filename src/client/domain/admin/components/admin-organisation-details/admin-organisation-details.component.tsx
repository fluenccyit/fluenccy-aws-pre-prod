import React, { ReactNode, useMemo } from 'react';
import { Badge, BadgeVariant, Card, CardContent, Text, TextSkeleton, useQueryLocalCommon } from '@client/common';
import { LocalAdminOrganisationType } from '@client/organisation';

type Props = {
  organisation: LocalAdminOrganisationType;
};

export const AdminOrganisationDetails = ({ organisation }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { variant, label } = useMemo<{ variant: BadgeVariant; label: string }>(() => {
    switch (organisation.syncStatus) {
      case 'pullingInvoicesAndPayments':
      case 'calculatingTransactionDetails':
      case 'calculatingTransactionDetailsComplete':
        return { variant: 'info', label: 'Syncing Xero' };
      case 'calculatingCurrencyScores':
        return { variant: 'info', label: 'Currency Score' };
      case 'calculatingTransactionDetailsError':
        return { variant: 'danger', label: 'Syncing Xero Error' };
      case 'calculatingCurrencyScoresError':
        return { variant: 'danger', label: 'Currency Score Error' };
      case 'syncError':
        return { variant: 'danger', label: 'Unknown Error' };
      case 'synced':
        return { variant: 'success', label: 'Synced' };
      default:
        return { variant: 'gray', label: '-' };
    }
  }, [organisation]);

  const renderOrganisationDetailsCardRow = ({ rowTitle, rowValue }: { rowTitle: string; rowValue: ReactNode }) => {
    return (
      <div className="flex justify-between mb-2 last:mb-0">
        {ui === 'loading' && <TextSkeleton className="w-full h-5" />}
        {ui === 'ready' && (
          <>
            <Text className="inline-block text-sm font-bold">{rowTitle}</Text>
            <div>{rowValue}</div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Text className="text-lg font-bold">Details</Text>
      <Card data-testid="flnc-breakdown-payment-variance" className="mt-2 mb-6">
        <CardContent className="p-4">
          {renderOrganisationDetailsCardRow({
            rowTitle: 'Primary User',
            rowValue: <Text className="inline-block">{organisation.primaryUser?.firstName || '-'}</Text>,
          })}
          {/* {renderOrganisationDetailsCardRow({
            rowTitle: 'Hedge Margin',
            rowValue: <Text className="inline-block">{`${(organisation.hedgeMargin * 100).toFixed(2)}%`}</Text>,
          })} */}
          {renderOrganisationDetailsCardRow({
            rowTitle: 'Sync Status',
            rowValue: (
              <Badge variant={variant} size="sm" state="solid">
                {label}
              </Badge>
            ),
          })}
          {renderOrganisationDetailsCardRow({
            rowTitle: 'Onboarding Complete',
            rowValue: (
              <Badge variant={organisation.onboardingComplete ? 'success' : 'danger'} size="sm" state="solid">
                {`${organisation.onboardingComplete}`}
              </Badge>
            ),
          })}
          {renderOrganisationDetailsCardRow({
            rowTitle: 'Intent Registered',
            rowValue: (
              <Badge
                variant={organisation.intentRegistered ? 'success' : 'danger'}
                size="sm"
                state="solid"
              >{`${organisation.intentRegistered}`}</Badge>
            ),
          })}
        </CardContent>
      </Card>
    </>
  );
};
