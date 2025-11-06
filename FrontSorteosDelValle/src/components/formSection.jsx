import React from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl">
      <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold px-6 py-4 border-b border-border-light dark:border-border-dark">
        {title}
      </h2>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
export default FormSection;