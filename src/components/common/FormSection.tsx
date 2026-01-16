import React from 'react';

interface FormSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`form-section ${className}`}>
      <h3 className="form-section-title">{title}</h3>
      {children}
    </div>
  );
};

interface FormGroupProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  required,
  children,
  className = '',
  helpText,
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {children}
    </div>
  );
};
