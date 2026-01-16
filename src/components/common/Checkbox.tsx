import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="form-checkbox"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
};

interface CheckboxGroupProps<T extends string = string> {
  options: Array<{ value: T; label: string }>;
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export function CheckboxGroup<T extends string = string>({
  options,
  values,
  onChange,
  disabled = false,
  className = '',
  direction = 'horizontal',
}: CheckboxGroupProps<T>) {
  const handleChange = (value: T, checked: boolean) => {
    if (checked) {
      onChange([...values, value]);
    } else {
      onChange(values.filter((v) => v !== value));
    }
  };

  return (
    <div 
      className={`flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'} ${className}`}
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={values.includes(option.value)}
          onChange={(checked) => handleChange(option.value, checked)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface RadioGroupProps<T extends string = string> {
  name: string;
  options: Array<{ value: T; label: string }>;
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioGroup<T extends string = string>({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  direction = 'horizontal',
}: RadioGroupProps<T>) {
  return (
    <div 
      className={`flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'} ${className}`}
    >
      {options.map((option) => (
        <label 
          key={option.value}
          className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value as T)}
            disabled={disabled}
            className="form-radio"
          />
          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
