import React from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
        <h2 className="text-lg font-bold text-text-light dark:text-text-dark">
          {title}
        </h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default FormSection;