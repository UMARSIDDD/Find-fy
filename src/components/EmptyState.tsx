import React from 'react';

const EmptyState = ({ message }:{message:string}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-gray-300 rounded-lg bg-gray-50">
      <div className="text-4xl">📭</div>
      <p className="mt-4 text-lg text-gray-700">{message}</p>
    </div>
  );
};

export default EmptyState;
