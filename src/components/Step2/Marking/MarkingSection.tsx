import React from 'react';
import { FormSection } from '../../common';
import { MarkingForm } from './MarkingForm';
import { useFormStore } from '../../../store/formStore';

export const MarkingSection: React.FC = () => {
  const { markingForms, updateMarkingForm, updateMarkingComposition, typeSelection } = useFormStore();
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

  return (
    <FormSection title="2. 착인 방법">
      <p className="text-gray-600 mb-4">{getConfigDescription()}</p>

      <div className="space-y-6">
        {markingForms.map((form) => (
          <MarkingForm
            key={form.id}
            data={form}
            onUpdate={(updates) => updateMarkingForm(form.id, updates)}
            onUpdateComposition={(updates) => updateMarkingComposition(form.id, updates)}
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
