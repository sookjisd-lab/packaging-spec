import React from 'react';
import { ProductConfigSelect } from './ProductConfigSelect';
import { ProductTypeSelect } from './ProductTypeSelect';
import { PackagingMaterialSelect } from './PackagingMaterialSelect';
import { useFormStore } from '../../store/formStore';

export const Step1TypeSelection: React.FC = () => {
  const { typeSelection, nextStep, generateMarkingForms, generateLabelForms } = useFormStore();

  const isValid = () => {
    const { productConfig, productCategories, packagingMaterials, setComponents } = typeSelection;
    
    // 포장재 선택 필수
    if (packagingMaterials.length === 0) return false;
    
    // 기획세트인 경우
    if (productConfig === 'set') {
      if (!setComponents || setComponents.length === 0) return false;
      // 구성품 이름 입력 확인
      if (setComponents.some((c) => !c.name.trim())) return false;
    } else {
      // 단품/미품인 경우 제품 유형 선택 필수
      if (productCategories.length === 0) return false;
    }
    
    return true;
  };

  const handleNext = () => {
    // Step2로 넘어가기 전에 착인/라벨 폼 생성
    generateMarkingForms();
    generateLabelForms();
    nextStep();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 1: 유형 선택</h2>
        <p className="text-gray-600 mt-1">제품의 유형과 포장재를 선택해주세요.</p>
      </div>

      <ProductConfigSelect />
      <ProductTypeSelect />
      <PackagingMaterialSelect />

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 단계로
          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export { ProductConfigSelect } from './ProductConfigSelect';
export { ProductTypeSelect } from './ProductTypeSelect';
export { PackagingMaterialSelect } from './PackagingMaterialSelect';
