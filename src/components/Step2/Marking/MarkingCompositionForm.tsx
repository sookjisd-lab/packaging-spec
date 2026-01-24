import React from 'react';
import { FormGroup, Checkbox, RadioGroup, Dropdown, TextInput, NumberInput } from '../../common';
import type { 
  MarkingComposition, 
  ManagementNumberType, 
  CosmaxNumberFormat,
  ExpiryDateFormat,
  ManufactureDateFormat,
  ExpiryBasis 
} from '../../../types';
import {
  EXPIRY_DATE_FORMAT_LABELS,
  MANUFACTURE_DATE_FORMAT_LABELS,
  EXPIRY_BASIS_LABELS,
} from '../../../types';

interface MarkingCompositionFormProps {
  composition: MarkingComposition;
  onChange: (updates: Partial<MarkingComposition>) => void;
}

const managementNumberOptions = [
  { value: 'cosmax' as ManagementNumberType, label: '코스맥스관리번호' },
  { value: 'client' as ManagementNumberType, label: '고객사관리번호' },
];

const cosmaxFormatOptions = [
  { value: 'ABC' as CosmaxNumberFormat, label: 'ABC' },
  { value: 'LOT_ABC' as CosmaxNumberFormat, label: 'LOT ABC' },
];

const expiryDateOptions = Object.entries(EXPIRY_DATE_FORMAT_LABELS).map(([value, label]) => ({
  value: value as ExpiryDateFormat,
  label,
}));

const manufactureDateOptions = Object.entries(MANUFACTURE_DATE_FORMAT_LABELS).map(([value, label]) => ({
  value: value as ManufactureDateFormat,
  label,
}));

const expiryBasisOptions = Object.entries(EXPIRY_BASIS_LABELS).map(([value, label]) => ({
  value: value as ExpiryBasis,
  label,
}));

export const MarkingCompositionForm: React.FC<MarkingCompositionFormProps> = ({
  composition,
  onChange,
}) => {
  const showExpiryOptions = composition.hasExpiryDate || composition.hasManufactureDate;

  const checkedCount = [
    composition.hasManagementNumber,
    composition.hasExpiryDate,
    composition.hasManufactureDate,
    composition.hasOther,
  ].filter(Boolean).length;

  const lineOptions = Array.from({ length: checkedCount }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}번째 줄`,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        착인 구성 항목을 선택하고, 각 항목이 몇 번째 줄에 표시될지 설정하세요.
      </p>

      {/* 관리번호 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="관리번호"
            checked={composition.hasManagementNumber}
            onChange={(checked) => onChange({ hasManagementNumber: checked })}
          />
          {composition.hasManagementNumber && checkedCount > 0 && (
            <select
              className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={composition.managementNumberLine || 1}
              onChange={(e) => onChange({ managementNumberLine: Number(e.target.value) })}
            >
              {lineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
        
        {composition.hasManagementNumber && (
          <div className="mt-3 ml-6 space-y-3">
            <RadioGroup
              name="managementNumberType"
              options={managementNumberOptions}
              value={composition.managementNumberType}
              onChange={(value) => onChange({ managementNumberType: value })}
            />
            
            {composition.managementNumberType === 'cosmax' && (
              <div className="ml-4">
                <label className="block text-sm text-gray-600 mb-1">착인 양식</label>
                <RadioGroup
                  name="cosmaxFormat"
                  options={cosmaxFormatOptions}
                  value={composition.cosmaxNumberFormat || 'ABC'}
                  onChange={(value) => onChange({ cosmaxNumberFormat: value })}
                />
              </div>
            )}
            
            {composition.managementNumberType === 'client' && (
              <div className="ml-4">
                <label className="block text-sm text-gray-600 mb-1">관리번호 설명</label>
                <TextInput
                  value={composition.clientNumberDescription || ''}
                  onChange={(value) => onChange({ clientNumberDescription: value })}
                  placeholder="고객사 관리번호 양식을 설명해주세요"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 사용기한 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="사용기한"
            checked={composition.hasExpiryDate}
            onChange={(checked) => onChange({ hasExpiryDate: checked })}
          />
          {composition.hasExpiryDate && checkedCount > 0 && (
            <select
              className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={composition.expiryDateLine || 1}
              onChange={(e) => onChange({ expiryDateLine: Number(e.target.value) })}
            >
              {lineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
        
        {composition.hasExpiryDate && (
          <div className="mt-3 ml-6">
            <label className="block text-sm text-gray-600 mb-1">사용기한 형식</label>
            <Dropdown
              options={expiryDateOptions}
              value={composition.expiryDateFormat || 'YYYYMMDD'}
              onChange={(value) => onChange({ expiryDateFormat: value })}
              showOtherInput
              otherValue={composition.expiryDateCustom}
              onOtherChange={(value) => onChange({ expiryDateCustom: value })}
              otherPlaceholder="직접 입력 (예: 사용기한 2025.12.31)"
            />
          </div>
        )}
      </div>

      {/* 제조일자 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="제조일자"
            checked={composition.hasManufactureDate}
            onChange={(checked) => onChange({ hasManufactureDate: checked })}
          />
          {composition.hasManufactureDate && checkedCount > 0 && (
            <select
              className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={composition.manufactureDateLine || 1}
              onChange={(e) => onChange({ manufactureDateLine: Number(e.target.value) })}
            >
              {lineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
        
        {composition.hasManufactureDate && (
          <div className="mt-3 ml-6">
            <label className="block text-sm text-gray-600 mb-1">제조일자 형식</label>
            <Dropdown
              options={manufactureDateOptions}
              value={composition.manufactureDateFormat || 'YYYYMMDD_MFG'}
              onChange={(value) => onChange({ manufactureDateFormat: value })}
              showOtherInput
              otherValue={composition.manufactureDateCustom}
              onOtherChange={(value) => onChange({ manufactureDateCustom: value })}
              otherPlaceholder="직접 입력 (예: 제조 2025.01.01)"
            />
          </div>
        )}
      </div>

      {/* 기타 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="기타"
            checked={composition.hasOther}
            onChange={(checked) => onChange({ hasOther: checked })}
          />
          {composition.hasOther && checkedCount > 0 && (
            <select
              className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={composition.otherLine || 1}
              onChange={(e) => onChange({ otherLine: Number(e.target.value) })}
            >
              {lineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
        
        {composition.hasOther && (
          <div className="mt-3 ml-6">
            <TextInput
              value={composition.otherDescription || ''}
              onChange={(value) => onChange({ otherDescription: value })}
              placeholder="기타 착인 내용을 입력해주세요"
            />
          </div>
        )}
      </div>

      {/* 착인 순서 미리보기 */}
      {checkedCount > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-medium text-green-800 mb-2">착인 순서 미리보기:</h5>
          <div className="text-sm text-green-700 space-y-1">
            {(() => {
              const items: { line: number; name: string }[] = [];
              if (composition.hasManagementNumber) {
                items.push({ line: composition.managementNumberLine || 1, name: '관리번호' });
              }
              if (composition.hasExpiryDate) {
                items.push({ line: composition.expiryDateLine || 1, name: '사용기한' });
              }
              if (composition.hasManufactureDate) {
                items.push({ line: composition.manufactureDateLine || 1, name: '제조일자' });
              }
              if (composition.hasOther) {
                items.push({ line: composition.otherLine || 1, name: composition.otherDescription || '기타' });
              }
              return items
                .sort((a, b) => a.line - b.line)
                .map((item, idx) => (
                  <div key={idx}>{item.line}번째 줄: {item.name}</div>
                ));
            })()}
          </div>
        </div>
      )}

      {/* 사용기한/제조일자 선택 시 추가 옵션 */}
      {showExpiryOptions && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-3">사용기한 관련 설정</h5>
          
          <FormGroup label="사용기한 기준">
            <Dropdown
              options={expiryBasisOptions}
              value={composition.expiryBasis || 'bulkManufacture'}
              onChange={(value) => onChange({ expiryBasis: value })}
            />
          </FormGroup>
          
          <FormGroup label="사용기한 개월수" className="mt-3">
            <NumberInput
              value={composition.expiryMonths || 0}
              onChange={(value) => onChange({ expiryMonths: value })}
              placeholder="36"
              suffix="개월"
              min={1}
              max={120}
            />
          </FormGroup>
        </div>
      )}

    </div>
  );
};
