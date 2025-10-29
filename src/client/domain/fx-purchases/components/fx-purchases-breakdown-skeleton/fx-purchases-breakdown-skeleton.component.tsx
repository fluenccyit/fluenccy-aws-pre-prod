import React, { memo } from 'react';
import { ChartBreakdownContainer } from '@client/chart';
import { Card, CardContent, TextSkeleton, CardSeparator, CircularSkeleton } from '@client/common';
import { FX_PURCHASE_MONTHS } from '@client/fx-purchases/fx-purchase.constant';

type Props = {
  isLoading?: boolean;
};

export const FxPurchasesBreakdownSkeleton = memo(({ isLoading = true }: Props) => (
  <ChartBreakdownContainer months={FX_PURCHASE_MONTHS}>
    <Card>
      <CardContent className="p-6">
        <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
        <div className="flex flex-row items-center mb-3.5">
          <CircularSkeleton size="lg" className="mr-5" isLoading={isLoading} />
          <TextSkeleton className="h-3 w-32" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mr-4 h-3 w-full" isLoading={isLoading} />

        <CardSeparator hasCarat />

        <div className="flex justify-between mb-5">
          <div>
            <TextSkeleton className="mb-3 h-3 w-24" isLoading={isLoading} />
            <TextSkeleton className="mb-3 h-6 w-40" isLoading={isLoading} />{' '}
          </div>
          <TextSkeleton className="mb-3 h-3 w-8" isLoading={isLoading} />
        </div>

        <div className="flex justify-between mb-5">
          <div>
            <TextSkeleton className="mb-3 h-3 w-24" isLoading={isLoading} />
            <TextSkeleton className="mb-3 h-6 w-40" isLoading={isLoading} />{' '}
          </div>
          <TextSkeleton className="mb-3 h-3 w-8" isLoading={isLoading} />
        </div>

        <div className="flex justify-between mb-5">
          <div>
            <TextSkeleton className="mb-3 h-3 w-24" isLoading={isLoading} />
            <TextSkeleton className="mb-3 h-6 w-40" isLoading={isLoading} />{' '}
          </div>
          <TextSkeleton className="mb-3 h-3 w-8" isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  </ChartBreakdownContainer>
));
