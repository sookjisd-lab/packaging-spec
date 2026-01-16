import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'number';
  suffix?: string;
  min?: number;
  max?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  type = 'text',
  suffix,
  min,
  max,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className="form-input"
      />
      {suffix && <span className="text-sm text-gray-600 whitespace-nowrap">{suffix}</span>}
    </div>
  );
};

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  rows = 4,
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`form-input resize-y ${className}`}
    />
  );
};

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  suffix,
  min,
  max,
  step = 1,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="form-input w-32"
      />
      {suffix && <span className="text-sm text-gray-600 whitespace-nowrap">{suffix}</span>}
    </div>
  );
};
