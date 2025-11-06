import React from 'react';

const Input = ({ label, type = "text", placeholder, ...props }) => {
  return (
    <label className="flex flex-col">
      <span className="text-base font-medium pb-2">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input rounded-lg bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark focus:ring-primary/50 focus:border-primary/50"
        {...props}
      />
    </label>
  );
};

export const TextArea = ({ label, placeholder, ...props }) => {
  return (
    <label className="flex flex-col">
      <span className="text-base font-medium pb-2">{label}</span>
      <textarea
        placeholder={placeholder}
        className="form-textarea rounded-lg bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark min-h-36 focus:ring-primary/50 focus:border-primary/50"
        {...props}
      ></textarea>
    </label>
  );
};

export default Input;