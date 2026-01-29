import React from 'react';
import { FormSection, TextInput } from '../../common';
import { LabelForm } from './LabelForm';
import { PaletteLabelForm } from './PaletteLabelForm';
import { useFormStore } from '../../../store/formStore';
import type { CustomLabelItem } from '../../../types';

const PRODUCT_INFO_FIELDS = [
  { key: 'productName', valueKey: 'productNameValue', label: '제품명' },
  { key: 'englishName', valueKey: 'englishNameValue', label: '영문명' },
  { key: 'clientProductCode', valueKey: 'clientProductCodeValue', label: '고객사제품코드' },
] as const;

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

  const getAggregatedProductInfoFields = () => {
    const allCustomItems: CustomLabelItem[] = [];
    
    labelForms.forEach((form) => {
      if (form.formatType === 'custom' && form.customLabelItems) {
        allCustomItems.push(form.customLabelItems);
      }
    });
    
    if (paletteLabel.formatType === 'custom' && paletteLabel.customLabelItems) {
      allCustomItems.push(paletteLabel.customLabelItems);
    }
    
    const hasProductName = allCustomItems.some(item => item.productName);
    const hasEnglishName = allCustomItems.some(item => item.englishName);
    const hasClientProductCode = allCustomItems.some(item => item.clientProductCode);
    const hasBarcode = allCustomItems.some(item => item.barcodeImage || item.barcodeNumber);
    
    return { hasProductName, hasEnglishName, hasClientProductCode, hasBarcode };
  };

  const aggregatedFields = getAggregatedProductInfoFields();
  const showProductInfoSection = aggregatedFields.hasProductName || 
    aggregatedFields.hasEnglishName || 
    aggregatedFields.hasClientProductCode || 
    aggregatedFields.hasBarcode;

  const getFirstCustomLabelForm = () => {
    const customForm = labelForms.find(f => f.formatType === 'custom' && f.customLabelItems);
    if (customForm) return { type: 'label' as const, id: customForm.id };
    if (paletteLabel.formatType === 'custom' && paletteLabel.customLabelItems) {
      return { type: 'palette' as const };
    }
    return null;
  };

  const handleProductInfoChange = (valueKey: string, value: string) => {
    const firstForm = getFirstCustomLabelForm();
    if (!firstForm) return;
    
    if (firstForm.type === 'label') {
      updateCustomLabelItems(firstForm.id, { [valueKey]: value });
    } else {
      updatePaletteLabelCustomItems({ [valueKey]: value });
    }
  };

  const getProductInfoValue = (valueKey: keyof CustomLabelItem): string => {
    for (const form of labelForms) {
      if (form.formatType === 'custom' && form.customLabelItems) {
        const val = form.customLabelItems[valueKey];
        if (typeof val === 'string' && val) return val;
      }
    }
    if (paletteLabel.formatType === 'custom' && paletteLabel.customLabelItems) {
      const val = paletteLabel.customLabelItems[valueKey];
      if (typeof val === 'string' && val) return val;
    }
    return '';
  };

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

        {showProductInfoSection && (
          <div className="mt-8 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                제품 정보
              </span>
              <span className="font-semibold text-gray-800">라벨에 표시할 제품 정보 입력</span>
            </div>
            <p className="text-sm text-orange-700 mb-4">
              위에서 선택한 라벨 항목(제품명, 영문명, 고객사제품코드, 바코드) 중 체크된 항목의 값을 입력하세요.
            </p>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-orange-200">
              {PRODUCT_INFO_FIELDS.filter(field => aggregatedFields[`has${field.key.charAt(0).toUpperCase() + field.key.slice(1)}` as keyof typeof aggregatedFields]).map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="w-36 text-sm text-gray-700 font-medium flex-shrink-0">{field.label}:</label>
                  <TextInput
                    value={getProductInfoValue(field.valueKey)}
                    onChange={(value) => handleProductInfoChange(field.valueKey, value)}
                    placeholder={`${field.label} 입력`}
                    className="flex-1"
                  />
                </div>
              ))}
              {aggregatedFields.hasBarcode && (
                <div className="flex items-center gap-3">
                  <label className="w-36 text-sm text-gray-700 font-medium flex-shrink-0">바코드:</label>
                  <TextInput
                    value={getProductInfoValue('barcodeValue')}
                    onChange={(value) => handleProductInfoChange('barcodeValue', value)}
                    placeholder="바코드 입력"
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
};
