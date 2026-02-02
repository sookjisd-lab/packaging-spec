import React from 'react';
import { FormSection, FormGroup, RadioGroup, TextInput, Checkbox, Dropdown } from '../common';
import { useFormStore } from '../../store/formStore';
import type { ProductConfigType, ProductCategory } from '../../types';
import { PRODUCT_CONFIG_LABELS, PRODUCT_CATEGORY_LABELS } from '../../types';

const productConfigOptions = Object.entries(PRODUCT_CONFIG_LABELS).map(([value, label]) => ({
  value: value as ProductConfigType,
  label,
}));

const productCategoryOptions = Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as ProductCategory,
  label,
}));

export const ProductConfigSelect: React.FC = () => {
  const {
    typeSelection,
    setProductConfig,
    addSetComponent,
    removeSetComponent,
    updateSetComponent,
  } = useFormStore();

  const { productConfig, setComponents = [] } = typeSelection;

  const handleConfigChange = (config: ProductConfigType) => {
    setProductConfig(config);
    
    // 기획세트 선택 시 기본 구성품 1개 추가
    if (config === 'set' && setComponents.length === 0) {
      addSetComponent({
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        hasIndividualPouch: false,
        hasIndividualBox: false,
        productCategory: 'basic',
      });
    }
  };

  const handleAddComponent = () => {
    addSetComponent({
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      hasIndividualPouch: false,
      hasIndividualBox: false,
      productCategory: 'basic',
    });
  };

  return (
    <FormSection title="1. 제품 구성">
      <FormGroup label="제품 구성 유형" required>
        <RadioGroup
          name="productConfig"
          options={productConfigOptions}
          value={productConfig}
          onChange={handleConfigChange}
        />
        <div className="mt-2 text-sm text-gray-500">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>단품</strong>: 단상자에 구성품 1개 들어가는 제품</li>
            <li><strong>미품</strong>: 단상자 없이 구성품을 바로 포장하는 경우</li>
            <li><strong>기획(세트)</strong>: 세트상자에 여러 구성품이 들어가는 경우</li>
          </ul>
        </div>
      </FormGroup>

      {/* 기획세트 선택 시 구성품 입력 */}
      {productConfig === 'set' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-4">세트 구성품 정보</h4>
          
          <div className="space-y-4">
            {setComponents.map((component, index) => (
              <div 
                key={component.id} 
                className="p-3 bg-white rounded border border-gray-200"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm text-gray-600 mb-1">
                      구성품 {index + 1} 명칭
                    </label>
                    <TextInput
                      value={component.name}
                      onChange={(value) => updateSetComponent(component.id, { name: value })}
                      placeholder="예: 스킨, 로션, 크림"
                    />
                  </div>
                  
                  <div className="min-w-[160px]">
                    <label className="block text-sm text-gray-600 mb-1">
                      제품 유형
                    </label>
                    <Dropdown
                      options={productCategoryOptions}
                      value={component.productCategory || 'basic'}
                      onChange={(value) => updateSetComponent(component.id, { productCategory: value })}
                      className="w-full"
                    />
                  </div>
                  
                  {component.productCategory === 'other' && (
                    <div className="min-w-[150px]">
                      <label className="block text-sm text-gray-600 mb-1">
                        기타 유형
                      </label>
                      <TextInput
                        value={component.productCategoryOther || ''}
                        onChange={(value) => updateSetComponent(component.id, { productCategoryOther: value })}
                        placeholder="직접 입력"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 pt-6">
                    <Checkbox
                      label="개별 파우치"
                      checked={component.hasIndividualPouch}
                      onChange={(checked) => updateSetComponent(component.id, { hasIndividualPouch: checked })}
                    />
                    <Checkbox
                      label="개별 단상자"
                      checked={component.hasIndividualBox}
                      onChange={(checked) => updateSetComponent(component.id, { hasIndividualBox: checked })}
                    />
                  </div>
                  
                  {setComponents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSetComponent(component.id)}
                      className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddComponent}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            구성품 추가
          </button>
        </div>
      )}
    </FormSection>
  );
};
