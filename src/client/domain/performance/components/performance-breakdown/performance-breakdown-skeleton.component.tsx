import React, { memo } from 'react';
import { PERFORMANCE_MONTHS } from '@client/performance';
import { ChartBreakdownContainer } from '@client/chart';
import { Card, CardContent, TextSkeleton, CardSeparator } from '@client/common';
import { Border } from 'victory';

type Props = {
  isLoading?: boolean;
};

export const PerformanceBreakdownSkeleton = memo(({ isLoading = true, horizontal = false }: Props) => (
  <ChartBreakdownContainer months={ horizontal ? '' : PERFORMANCE_MONTHS} isFullWidth={horizontal} className={horizontal ? "pl-0 flex" : ""} style={{width: '100%'}}>
    <Card style={{width: '100%'}}>
      <CardContent className={`${horizontal ? "flex items-center justify-around py-2" : "p-6"}`}>
        {!horizontal && <>
          <div className="flex justify-between mt-2">
            <TextSkeleton className="h-3 w-16" isLoading={isLoading} />
            <TextSkeleton className="h-3 w-24" isLoading={isLoading} />
          </div>

          <div className="flex justify-between mt-2">
            <TextSkeleton className="h-3 w-16" isLoading={isLoading} />
            <TextSkeleton className="h-3 w-24" isLoading={isLoading} />
          </div>

          <CardSeparator hasCarat />

          <TextSkeleton className="mb-3 h-3 w-36" isLoading={isLoading} />
          <TextSkeleton className="mb-3 h-3 w-24" isLoading={isLoading} />

          <TextSkeleton className="mb-1.5 h-3 w-full" isLoading={isLoading} />
          <TextSkeleton className="mb-5 h-3 w-32" isLoading={isLoading} />

          <TextSkeleton className="mb-3 h-3 w-36" isLoading={isLoading} />
          <TextSkeleton className="mb-5 h-3 w-24" isLoading={isLoading} />

          <TextSkeleton className="mb-3 h-3 w-36" isLoading={isLoading} />
          <TextSkeleton className="h-3 w-24" isLoading={isLoading} />

          <CardSeparator hasCarat />
        </>}
        <div className={ horizontal ? "flex justify-between flex-col px-3" : "flex justify-between"}>
          <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
          <TextSkeleton className="mb-3 h-3 w-12" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mt-1 mb-3 h-3 w-24" isLoading={isLoading} />

        <div className={ horizontal ? "flex justify-between flex-col px-3" : "flex justify-between"}>
          <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
          <TextSkeleton className="mb-3 h-3 w-12" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mt-1 mb-3 h-3 w-24" isLoading={isLoading} />

        <div className={ horizontal ? "flex justify-between flex-col px-3" : "flex justify-between"}>
          <TextSkeleton className="mb-3 h-3 w-32" isLoading={isLoading} />
          <TextSkeleton className="mb-3 h-3 w-12" isLoading={isLoading} />
        </div>
        <TextSkeleton className="mt-1 mb-3 h-3 w-24" isLoading={isLoading} />

        <div className="flex items-center">
          <TextSkeleton className="h-5 w-8 mr-3" isLoading={isLoading} />
          <TextSkeleton className="h-3 w-32" isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  </ChartBreakdownContainer>
));
