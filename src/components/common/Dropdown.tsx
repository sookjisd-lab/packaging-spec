import type { DropdownOption } from '../../types';

interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showOtherInput?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherPlaceholder?: string;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  disabled = false,
  className = '',
  showOtherInput = false,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = '직접 입력',
}: DropdownProps<T>) {
  const isOther = value === 'other';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="form-select"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {showOtherInput && isOther && onOtherChange && (
        <input
          type="text"
          value={otherValue || ''}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="form-input"
        />
      )}
    </div>
  );
}
