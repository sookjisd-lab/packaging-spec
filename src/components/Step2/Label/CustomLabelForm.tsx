import React, { useState } from 'react';
import { Checkbox, TextInput } from '../../common';
import type { CustomLabelItem } from '../../../types';

interface CustomLabelFormProps {
  items: CustomLabelItem;
  onChange: (updates: Partial<CustomLabelItem>) => void;
  onAddOther: (value: string) => void;
  onRemoveOther: (index: number) => void;
}

const PRODUCT_INFO_FIELDS = [
  { key: 'productName', valueKey: 'productNameValue', label: '제품명' },
  { key: 'englishName', valueKey: 'englishNameValue', label: '영문명' },
  { key: 'clientProductCode', valueKey: 'clientProductCodeValue', label: '고객사제품코드' },
] as const;

export const CustomLabelForm: React.FC<CustomLabelFormProps> = ({
  items,
  onChange,
  onAddOther,
  onRemoveOther,
}) => {
  const [newOther, setNewOther] = useState('');

  const handleAddOther = () => {
    if (newOther.trim()) {
      onAddOther(newOther.trim());
      setNewOther('');
    }
  };

  const getCheckedItems = (): string[] => {
    const checkedItems: string[] = [];
    if (items.productName) checkedItems.push('제품명');
    if (items.quantity) checkedItems.push('수량');
    if (items.managementNumber) checkedItems.push('관리번호');
    if (items.expiryDate) checkedItems.push('사용기한');
    if (items.packagingDate) checkedItems.push('포장(제조)일자');
    if (items.clientProductCode) checkedItems.push('고객사제품코드');
    if (items.englishName) checkedItems.push('영문명');
    if (items.barcodeImage) checkedItems.push('바코드(이미지)');
    if (items.barcodeNumber) checkedItems.push('바코드(숫자)');
    items.others?.forEach((other) => checkedItems.push(other));
    return checkedItems;
  };

  const hasProductInfoField = items.productName || items.englishName || items.clientProductCode;
  const hasBarcode = items.barcodeImage || items.barcodeNumber;
  const showProductInfoSection = hasProductInfoField || hasBarcode;

  const checkedItems = getCheckedItems();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Checkbox
          label="제품명"
          checked={items.productName}
          onChange={(checked) => onChange({ productName: checked })}
        />
        <Checkbox
          label="수량"
          checked={items.quantity}
          onChange={(checked) => onChange({ quantity: checked })}
        />
        <Checkbox
          label="관리번호"
          checked={items.managementNumber}
          onChange={(checked) => onChange({ managementNumber: checked })}
        />
        <Checkbox
          label="사용기한"
          checked={items.expiryDate}
          onChange={(checked) => onChange({ expiryDate: checked })}
        />
        <Checkbox
          label="포장(제조)일자"
          checked={items.packagingDate}
          onChange={(checked) => onChange({ packagingDate: checked })}
        />
        <Checkbox
          label="고객사제품코드"
          checked={items.clientProductCode}
          onChange={(checked) => onChange({ clientProductCode: checked })}
        />
        <Checkbox
          label="영문명"
          checked={items.englishName}
          onChange={(checked) => onChange({ englishName: checked })}
        />
        <Checkbox
          label="바코드(이미지화)"
          checked={items.barcodeImage}
          onChange={(checked) => onChange({ barcodeImage: checked })}
        />
        <Checkbox
          label="바코드(숫자만)"
          checked={items.barcodeNumber}
          onChange={(checked) => onChange({ barcodeNumber: checked })}
        />
      </div>

      {showProductInfoSection && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">제품 정보</p>
          <div className="space-y-3">
            {PRODUCT_INFO_FIELDS.filter(field => items[field.key]).map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-600 flex-shrink-0">{field.label}:</label>
                <TextInput
                  value={items[field.valueKey] || ''}
                  onChange={(value) => onChange({ [field.valueKey]: value })}
                  placeholder={`${field.label} 입력`}
                  className="flex-1"
                />
              </div>
            ))}
            {hasBarcode && (
              <div className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-600 flex-shrink-0">바코드:</label>
                <TextInput
                  value={items.barcodeValue || ''}
                  onChange={(value) => onChange({ barcodeValue: value })}
                  placeholder="바코드 입력"
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600 mb-2">기타 항목 (중복 추가 가능)</p>
        
        {items.others && items.others.length > 0 && (
          <div className="space-y-2 mb-3">
            {items.others.map((other, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="badge-gray">{other}</span>
                <button
                  type="button"
                  onClick={() => onRemoveOther(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <TextInput
            value={newOther}
            onChange={setNewOther}
            placeholder="추가할 항목 입력"
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleAddOther}
            disabled={!newOther.trim()}
            className="btn-secondary disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>

      {/* 라벨 예시 미리보기 */}
      {checkedItems.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium mb-2">라벨 예시:</p>
          <div className="bg-white p-3 rounded border border-yellow-300 text-sm font-mono">
            {checkedItems.map((item, index) => (
              <div key={index} className="text-gray-700">
                {item}: <span className="text-gray-400">[값]</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
