import React from 'react';
import { FormSection, TextArea } from '../../common';
import { MarkingForm } from './MarkingForm';
import { useFormStore } from '../../../store/formStore';

export const MarkingSection: React.FC = () => {
  const { markingForms, updateMarkingForm, updateMarkingComposition, typeSelection, clientNumberScheme, setClientNumberScheme } = useFormStore();
  const { productConfig } = typeSelection;

  const getConfigDescription = (): string => {
    switch (productConfig) {
      case 'single':
        return '단품: 구성품 1개와 단상자의 착인 정보를 입력해주세요.';
      case 'unboxed':
        return '미품: 구성품 1개의 착인 정보를 입력해주세요.';
      case 'set':
        return '기획세트: 각 구성품, 단상자(있는 경우), 세트상자의 착인 정보를 입력해주세요.';
      default:
        return '';
    }
  };

  const showSyncHint = markingForms.length > 1;
  const hasClientNumber = markingForms.some(form => form.composition.managementNumberType === 'client');

  return (
    <FormSection title="2. 착인 방법">
      <p className="text-gray-600 mb-2">{getConfigDescription()}</p>
      
      {showSyncHint && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 첫 번째 구성품의 착인 구성 설정이 나머지 항목에 자동으로 적용됩니다.
            (개별 항목 수정 시 해당 항목은 자동 동기화가 해제됩니다)
          </p>
        </div>
      )}

      {hasClientNumber && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">고객사 관리번호 체계</label>
          <TextArea
            value={clientNumberScheme}
            onChange={setClientNumberScheme}
            placeholder="고객사 관리번호 체계를 입력해주세요"
            rows={3}
            autoResize
          />
        </div>
      )}

      <div className="space-y-6">
        {markingForms.map((form) => (
          <MarkingForm
            key={form.id}
            data={form}
            onUpdate={(updates) => updateMarkingForm(form.id, updates)}
            onUpdateComposition={(updates) => updateMarkingComposition(form.id, updates)}
            productConfig={productConfig}
          />
        ))}
      </div>

      {markingForms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>착인 양식이 생성되지 않았습니다.</p>
          <p className="text-sm">Step 1에서 유형을 선택한 후 다음 단계로 진행해주세요.</p>
        </div>
      )}
    </FormSection>
  );
};
