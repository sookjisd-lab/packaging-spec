import React from 'react';
import { FormSection, FormGroup, Checkbox, TextInput } from '../common';
import { useFormStore } from '../../store/formStore';
import type { PackagingMaterialType } from '../../types';
import { PACKAGING_MATERIAL_LABELS } from '../../types';

const packagingMaterialTypes: PackagingMaterialType[] = [
  'zipperBag',
  'innerBox',
  'outerBox',
  'rrpBox',
  'other',
];

export const PackagingMaterialSelect: React.FC = () => {
  const { typeSelection, setPackagingMaterials } = useFormStore();
  const { packagingMaterials } = typeSelection;

  // 해당 타입이 선택되었는지 확인
  const isMaterialSelected = (type: PackagingMaterialType): boolean => {
    return packagingMaterials.some((m) => m.type === type);
  };

  // 해당 타입의 선택 순서 반환 (1부터 시작, 없으면 0)
  const getMaterialOrder = (type: PackagingMaterialType): number => {
    const index = packagingMaterials.findIndex((m) => m.type === type);
    return index >= 0 ? index + 1 : 0;
  };

  const handleMaterialToggle = (type: PackagingMaterialType, checked: boolean) => {
    if (checked) {
      setPackagingMaterials([
        ...packagingMaterials,
        { type, customName: type === 'other' ? '' : undefined },
      ]);
    } else {
      setPackagingMaterials(packagingMaterials.filter((m) => m.type !== type));
    }
  };

  // '기타' 추가 기능 (여러 개 가능)
  const otherMaterials = packagingMaterials.filter((m) => m.type === 'other');

  const handleAddOther = () => {
    setPackagingMaterials([
      ...packagingMaterials,
      { type: 'other', customName: '' },
    ]);
  };

  const handleRemoveOther = (index: number) => {
    const otherIndex = packagingMaterials.findIndex((m, i) => {
      if (m.type !== 'other') return false;
      const othersBefore = packagingMaterials.slice(0, i).filter((x) => x.type === 'other').length;
      return othersBefore === index;
    });
    
    if (otherIndex !== -1) {
      const newMaterials = [...packagingMaterials];
      newMaterials.splice(otherIndex, 1);
      setPackagingMaterials(newMaterials);
    }
  };

  const handleOtherNameChange = (index: number, customName: string) => {
    let otherCount = 0;
    setPackagingMaterials(
      packagingMaterials.map((m) => {
        if (m.type === 'other') {
          if (otherCount === index) {
            otherCount++;
            return { ...m, customName };
          }
          otherCount++;
        }
        return m;
      })
    );
  };

  // 기타 포장재의 순서 번호 계산
  const getOtherOrder = (index: number): number => {
    let count = 0;
    for (let i = 0; i < packagingMaterials.length; i++) {
      if (packagingMaterials[i].type === 'other') {
        if (count === index) {
          return i + 1;
        }
        count++;
      }
    }
    return 0;
  };

  return (
    <FormSection title={
      <span className="flex items-center gap-2">
        3. 포장재 선택
        <span className="text-sm font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
          포장순서에 맞춰서 체크
        </span>
      </span>
    }>
      <FormGroup 
        label="포장재 구성" 
        required
        helpText="외부 정보 표기가 필요한 포장재를 포장 순서에 맞춰 선택해주세요. (중복 선택 가능)"
      >
        <div className="space-y-3">
          {packagingMaterialTypes.filter((t) => t !== 'other').map((type) => {
            const isSelected = isMaterialSelected(type);
            const order = getMaterialOrder(type);
            
            return (
              <div key={type} className="flex items-center gap-3">
                <Checkbox
                  label={PACKAGING_MATERIAL_LABELS[type]}
                  checked={isSelected}
                  onChange={(checked) => handleMaterialToggle(type, checked)}
                />
                {isSelected && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {order}
                  </span>
                )}
              </div>
            );
          })}
          
          {/* 기타 항목들 */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <p className="text-sm text-gray-600 mb-2">기타 포장재</p>
            
            {otherMaterials.length === 0 ? (
              <button
                type="button"
                onClick={handleAddOther}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                기타 포장재 추가
              </button>
            ) : (
              <div className="space-y-2">
                {otherMaterials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {getOtherOrder(index)}
                    </span>
                    <TextInput
                      value={material.customName || ''}
                      onChange={(value) => handleOtherNameChange(index, value)}
                      placeholder="포장재 명칭 입력"
                      className="flex-1 max-w-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOther(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOther}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  기타 포장재 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </FormGroup>

      {/* 선택된 포장재 요약 (순서대로) */}
      {packagingMaterials.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">선택된 포장재 (포장 순서):</p>
          <div className="flex flex-wrap gap-2">
            {packagingMaterials.map((m, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-xs">
                  {index + 1}
                </span>
                {m.type === 'other' ? m.customName || '기타' : PACKAGING_MATERIAL_LABELS[m.type]}
              </span>
            ))}
          </div>
        </div>
      )}
    </FormSection>
  );
};
