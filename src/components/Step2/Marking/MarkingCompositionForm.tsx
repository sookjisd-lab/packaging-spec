import React from 'react';
import { FormGroup, Checkbox, RadioGroup, Dropdown, TextInput, NumberInput } from '../../common';
import type { 
  MarkingComposition, 
  ManagementNumberType, 
  CosmaxNumberFormat,
  ExpiryDateFormat,
  ManufactureDateFormat,
  ExpiryBasis,
  TubeMarkingSide,
} from '../../../types';
import {
  EXPIRY_DATE_FORMAT_LABELS,
  MANUFACTURE_DATE_FORMAT_LABELS,
  EXPIRY_BASIS_LABELS,
  TUBE_MARKING_SIDE_LABELS,
} from '../../../types';

interface MarkingCompositionFormProps {
  composition: MarkingComposition;
  onChange: (updates: Partial<MarkingComposition>) => void;
  isTubeEngraving?: boolean;
  isSachetOrMask?: boolean;
}

const tubeMarkingSideOptions = Object.entries(TUBE_MARKING_SIDE_LABELS).map(([value, label]) => ({
  value: value as TubeMarkingSide,
  label,
}));

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
  isTubeEngraving = false,
  isSachetOrMask = false,
}) => {
  const showExpiryOptions = composition.hasExpiryDate || composition.hasManufactureDate;

  const checkedCount = [
    composition.hasManagementNumber,
    composition.hasExpiryDate,
    composition.hasManufactureDate,
    composition.hasOther,
  ].filter(Boolean).length;

  const getNextTubeSide = (): TubeMarkingSide => {
    const existingSides: TubeMarkingSide[] = [];
    if (composition.hasManagementNumber && composition.managementNumberSide) {
      existingSides.push(composition.managementNumberSide);
    }
    if (composition.hasExpiryDate && composition.expiryDateSide) {
      existingSides.push(composition.expiryDateSide);
    }
    if (composition.hasManufactureDate && composition.manufactureDateSide) {
      existingSides.push(composition.manufactureDateSide);
    }
    if (composition.hasOther && composition.otherSide) {
      existingSides.push(composition.otherSide);
    }
    
    if (existingSides.length === 0) return 'front';
    if (!existingSides.includes('back')) return 'back';
    return 'front';
  };

  const lineOptions = Array.from({ length: checkedCount }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}번째 줄`,
  }));

  const renderPositionSelector = (
    _value: number | TubeMarkingSide | undefined,
    lineKey: keyof MarkingComposition,
    sideKey: keyof MarkingComposition
  ) => {
    if (isTubeEngraving) {
      return (
        <select
          className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          value={(composition[sideKey] as TubeMarkingSide) || 'front'}
          onChange={(e) => onChange({ [sideKey]: e.target.value as TubeMarkingSide })}
        >
          {tubeMarkingSideOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    
    return checkedCount > 0 ? (
      <select
        className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        value={(composition[lineKey] as number) || 1}
        onChange={(e) => onChange({ [lineKey]: Number(e.target.value) })}
      >
        {lineOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        {isTubeEngraving 
          ? '착인 구성 항목을 선택하고, 각 항목이 전면/후면 중 어디에 표시될지 설정하세요.'
          : '착인 구성 항목을 선택하고, 각 항목이 몇 번째 줄에 표시될지 설정하세요.'
        }
      </p>

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="관리번호"
            checked={composition.hasManagementNumber}
            onChange={(checked) => {
              if (checked) {
                onChange({ 
                  hasManagementNumber: true, 
                  managementNumberLine: isSachetOrMask ? 1 : checkedCount + 1,
                  managementNumberSide: isTubeEngraving ? getNextTubeSide() : undefined,
                });
              } else {
                onChange({ hasManagementNumber: false });
              }
            }}
          />
          {composition.hasManagementNumber && renderPositionSelector(
            isTubeEngraving ? composition.managementNumberSide : composition.managementNumberLine,
            'managementNumberLine',
            'managementNumberSide'
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

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="사용기한"
            checked={composition.hasExpiryDate}
            onChange={(checked) => {
              if (checked) {
                onChange({ 
                  hasExpiryDate: true, 
                  expiryDateLine: isSachetOrMask ? 1 : checkedCount + 1,
                  expiryDateSide: isTubeEngraving ? getNextTubeSide() : undefined,
                });
              } else {
                onChange({ hasExpiryDate: false });
              }
            }}
          />
          {composition.hasExpiryDate && renderPositionSelector(
            isTubeEngraving ? composition.expiryDateSide : composition.expiryDateLine,
            'expiryDateLine',
            'expiryDateSide'
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

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="제조일자"
            checked={composition.hasManufactureDate}
            onChange={(checked) => {
              if (checked) {
                onChange({ 
                  hasManufactureDate: true, 
                  manufactureDateLine: isSachetOrMask ? 1 : checkedCount + 1,
                  manufactureDateSide: isTubeEngraving ? getNextTubeSide() : undefined,
                });
              } else {
                onChange({ hasManufactureDate: false });
              }
            }}
          />
          {composition.hasManufactureDate && renderPositionSelector(
            isTubeEngraving ? composition.manufactureDateSide : composition.manufactureDateLine,
            'manufactureDateLine',
            'manufactureDateSide'
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

      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Checkbox
            label="기타"
            checked={composition.hasOther}
            onChange={(checked) => {
              if (checked) {
                onChange({ 
                  hasOther: true, 
                  otherLine: isSachetOrMask ? 1 : checkedCount + 1,
                  otherSide: isTubeEngraving ? getNextTubeSide() : undefined,
                });
              } else {
                onChange({ hasOther: false });
              }
            }}
          />
          {composition.hasOther && renderPositionSelector(
            isTubeEngraving ? composition.otherSide : composition.otherLine,
            'otherLine',
            'otherSide'
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

      {/* 사용기한/제조일자 선택 시 추가 옵션 */}
      {showExpiryOptions && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-3">사용기한 관련 설정</h5>
          
          <FormGroup label="사용기한 기준">
            <Dropdown
              options={expiryBasisOptions}
              value={composition.expiryBasis || ''}
              onChange={(value) => onChange({ expiryBasis: value || undefined })}
            />
          </FormGroup>
          
          <FormGroup label="사용기한 개월수" className="mt-3">
            <NumberInput
              value={composition.expiryMonths || 0}
              onChange={(value) => onChange({ expiryMonths: value })}
              placeholder="입력필요"
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
