import React from 'react';
import { FormSection } from '../../common';
import { LabelForm } from './LabelForm';
import { PaletteLabelForm } from './PaletteLabelForm';
import { useFormStore } from '../../../store/formStore';

export const LabelSection: React.FC = () => {
  const { 
    labelForms, 
    updateLabelForm, 
    updateCustomLabelItems,
    addCustomLabelOther,
    removeCustomLabelOther,
    paletteLabel,
    updatePaletteLabel,
    updatePaletteLabelCustomItems,
  } = useFormStore();

  const showSyncHint = labelForms.length > 1;

  return (
    <FormSection title="3. 포장재 라벨">
      <p className="text-gray-600 mb-2">
        Step 1에서 선택한 각 포장재의 라벨 정보를 입력해주세요.
      </p>
      
      {showSyncHint && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 첫 번째 포장재에서 '직접입력' 선택 후 라벨 항목을 설정하면, 
            다른 포장재에서 '직접입력' 선택 시 동일한 설정이 자동으로 적용됩니다.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {labelForms.map((form) => (
          <LabelForm
            key={form.id}
            data={form}
            onUpdate={(updates) => updateLabelForm(form.id, updates)}
            onUpdateCustomItems={(updates) => updateCustomLabelItems(form.id, updates)}
            onAddCustomOther={(value) => addCustomLabelOther(form.id, value)}
            onRemoveCustomOther={(index) => removeCustomLabelOther(form.id, index)}
          />
        ))}

        {labelForms.length === 0 && (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            <p>포장재가 선택되지 않았습니다.</p>
            <p className="text-sm">Step 1에서 포장재를 선택해주세요.</p>
          </div>
        )}

        {/* 팔레트 라벨 (항상 표시) */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">팔레트 라벨</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <PaletteLabelForm
            data={paletteLabel}
            onUpdate={updatePaletteLabel}
            onUpdateCustomItems={updatePaletteLabelCustomItems}
          />
        </div>
      </div>
    </FormSection>
  );
};
