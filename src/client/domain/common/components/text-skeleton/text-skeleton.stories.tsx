import React from 'react';
import { TextSkeleton } from './text-skeleton.component';

export default {
  title: 'Components/TextSkeletons',
  component: TextSkeleton,
};

export const Index = () => (
  <>
    <div>
      <TextSkeleton className="mr-2" />
    </div>
    <div className="mt-2">
      <TextSkeleton className="mr-2" isLoading={false} />
    </div>
  </>
);
