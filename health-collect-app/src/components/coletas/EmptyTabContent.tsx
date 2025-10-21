
import React from 'react';

interface EmptyTabContentProps {
  message: string;
}

const EmptyTabContent: React.FC<EmptyTabContentProps> = ({ message }) => {
  return (
    <div className="p-4">
      <div className="text-center p-6">
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
};

export default EmptyTabContent;
