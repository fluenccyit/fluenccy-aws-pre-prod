import React, { memo } from 'react';
import { VARIANCE_MONTHS } from '@client/variance';
import { ChartBreakdownContainer } from '@client/chart';
import { Card, CardContent, TextSkeleton, CircularSkeleton, CardSeparator } from '@client/common';

type Props = {
  isLoading?: boolean;
};

export const VarianceBreakdownSkeleton = memo(({ isLoading = true }: Props) => (
  <ChartBreakdownContainer months={VARIANCE_MONTHS}>
    <Card>
      <CardContent className="p-6">
        <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
        <div className="flex flex-row items-center mb-3.5">
          <CircularSkeleton size="lg" className="mr-5" isLoading={isLoading} />
          <TextSkeleton className="h-3 w-32" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mr-4 h-3 w-full" isLoading={isLoading} />

        <CardSeparator hasCarat />

        <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
        <div className="flex flex-row items-center mb-3.5">
          <CircularSkeleton size="lg" className="mr-5" isLoading={isLoading} />
          <TextSkeleton className="h-3 w-32" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mr-4 mb-1.5 h-3 w-full" isLoading={isLoading} />
        <TextSkeleton className="h-3 w-32" isLoading={isLoading} />

        <CardSeparator hasCarat />

        <TextSkeleton className="mb-3 w-32 h-3" isLoading={isLoading} />
        <div className="flex flex-row mb-3">
          <TextSkeleton className="h-34 mr-5 w-3" isLoading={isLoading} />
          <div className="flex flex-col">
            <TextSkeleton className="mb-3.5 mt-2 h-3 w-16" isLoading={isLoading} />
            <TextSkeleton className="mb-4 w-44 h-3" isLoading={isLoading} />

            <TextSkeleton className="mb-3.5 w-16 h-3" isLoading={isLoading} />
            <TextSkeleton className="mb-1.5 w-44 h-3" isLoading={isLoading} />
            <TextSkeleton className="mb-4 w-32 h-3" isLoading={isLoading} />

            <TextSkeleton className="mb-3.5 w-16 h-3" isLoading={isLoading} />
            <TextSkeleton className="mb-3 w-44 h-3" isLoading={isLoading} />
          </div>
        </div>
      </CardContent>
    </Card>
  </ChartBreakdownContainer>
));
