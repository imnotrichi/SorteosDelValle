import React from 'react';

const Input = ({ label, type = "text", placeholder, helperText, ...props }) => {
  return (
    <label className="flex flex-col">
      <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">{label}</span>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full form-input rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-text-light/40 dark:placeholder:text-text-dark/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-11 px-3"
          {...props}
        />
        {helperText && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-light/50 dark:text-text-dark/50 pointer-events-none">
            {helperText}
          </span>
        )}
      </div>
    </label>
  );
};

export const TextArea = ({ label, placeholder, ...props }) => {
  return (
    <label className="flex flex-col">
      <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">{label}</span>
      <textarea
        placeholder={placeholder}
        className="form-textarea rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-text-light/40 dark:placeholder:text-text-dark/40 min-h-32 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors p-3"
        {...props}
      ></textarea>
    </label>
  );
};

export default Input;