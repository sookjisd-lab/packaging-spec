import React from 'react';
import { FormSection, FormGroup, CheckboxGroup, TextInput } from '../common';
import { useFormStore } from '../../store/formStore';
import type { ProductCategory } from '../../types';
import { PRODUCT_CATEGORY_LABELS } from '../../types';

const productCategoryOptions = Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as ProductCategory,
  label,
}));

export const ProductTypeSelect: React.FC = () => {
  const {
    typeSelection,
    setProductCategories,
    setProductCategoryOther,
  } = useFormStore();

  const { productConfig, productCategories, productCategoryOther } = typeSelection;
  
  // 기획세트는 구성품별로 제품유형을 선택하므로 이 섹션을 표시하지 않음
  if (productConfig === 'set') {
    return null;
  }

  const handleCategoryChange = (categories: ProductCategory[]) => {
    // 단품/미품은 단일 선택만
    if (categories.length > 1) {
      setProductCategories([categories[categories.length - 1]]);
    } else {
      setProductCategories(categories);
    }
  };

  return (
    <FormSection title="2. 제품 유형">
      <FormGroup 
        label="제품 유형" 
        required
        helpText="하나의 유형만 선택해주세요."
      >
        <CheckboxGroup
          options={productCategoryOptions}
          values={productCategories}
          onChange={handleCategoryChange}
          direction="horizontal"
          className="flex-wrap"
        />
      </FormGroup>

      {productCategories.includes('other') && (
        <FormGroup label="기타 제품 유형 입력">
          <TextInput
            value={productCategoryOther || ''}
            onChange={setProductCategoryOther}
            placeholder="제품 유형을 입력해주세요"
            className="max-w-md"
          />
        </FormGroup>
      )}
    </FormSection>
  );
};
