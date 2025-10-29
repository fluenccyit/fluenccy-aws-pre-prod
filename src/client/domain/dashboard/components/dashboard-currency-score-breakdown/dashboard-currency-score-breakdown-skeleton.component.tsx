import React, { memo } from 'react';
import { Card, CardContent, TextSkeleton } from '@client/common';

export const DashboardCurrencyScoreBreakdownSkeleton = memo(({ isLoading }: { isLoading?: boolean }) => {
  return (
    <>
      <div className="w-full">
        <Card>
          <CardContent className="px-10 pt-6 pb-10">
            <TextSkeleton className="w-24 h-4 mb-6" isLoading={isLoading} />
            <div className="flex justify-center my-6 md:my-12 h-64 md:h-80 flex-col items-center">
              <TextSkeleton className="w-24 h-2 mb-4" isLoading={isLoading} />
              <TextSkeleton className="w-28 h-8 mb-8" isLoading={isLoading} />
              <TextSkeleton className="w-20 h-2 mb-4" isLoading={isLoading} />
              <TextSkeleton className="w-16 h-6 mb-4" isLoading={isLoading} />
            </div>
            <div className="py-4 border-b flex justify-between items-center">
              <TextSkeleton className="w-16 h-4" isLoading={isLoading} />
              <TextSkeleton className="w-28 h-4" isLoading={isLoading} />
              <TextSkeleton className="w-16 h-4" isLoading={isLoading} />
            </div>
            <TextSkeleton className="w-full h-8 mt-6 md:mt-16" isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
});
