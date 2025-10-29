import React from 'react';

export const EmptyContainer = ({ title = 'No records' }) => (
  <div className={`flex justify-center text-gray-600 py-6 border-2 border-dashed items-center h-48`}>
    <div>{title}</div>
  </div>
);
