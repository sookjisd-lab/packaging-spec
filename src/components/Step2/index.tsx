import React from 'react';
import { PackagingMethod } from './PackagingMethod';
import { MarkingSection } from './Marking/MarkingSection';
import { LabelSection } from './Label/LabelSection';
import { LoadingMethod } from './LoadingMethod';
import { AdditionalRequests } from './AdditionalRequests';
import { useFormStore } from '../../store/formStore';

export const Step2ContentInput: React.FC = () => {
  const { prevStep, nextStep, markingForms } = useFormStore();

  const handleNextStep = () => {
    // 1. 관리번호 필수 체크
    const hasUncheckedManagementNumber = markingForms.some(
      (form) => !form.composition.hasManagementNumber
    );
    if (hasUncheckedManagementNumber) {
      alert('관리번호 표기는 필수 사항입니다. 체크 후 선택 부탁드립니다');
      return;
    }

    // 2. 제조일자만 체크, 사용기한 미체크 경고
    const hasOnlyManufactureDate = markingForms.some(
      (form) => form.composition.hasManufactureDate && !form.composition.hasExpiryDate
    );
    if (hasOnlyManufactureDate) {
      const confirmed = window.confirm(
        '내수 제품의 경우, 사용기한 없이 제조일자만 착인하려면, 제품에 PAO마크(개봉마크)가 있어야합니다.'
      );
      if (!confirmed) return;
    }

    // 3. 사용기한 '까지' / 제조일자 '제조' 문구 누락 경고
    const hasMissingSuffix = markingForms.some((form) => {
      const { composition } = form;
      if (composition.hasExpiryDate) {
        if (composition.expiryDateFormat === 'EXP_YYYYMMDD') return true;
        if (composition.expiryDateFormat === 'other' &&
          !composition.expiryDateCustom?.includes('까지')) return true;
      }
      if (composition.hasManufactureDate) {
        if (composition.manufactureDateFormat === 'other' &&
          !composition.manufactureDateCustom?.includes('제조')) return true;
      }
      return false;
    });
    if (hasMissingSuffix) {
      const confirmed = window.confirm(
        '내수 제품의 경우, 제조일자와 사용기한 뒤에 \'까지\', \'제조\'문구가 필수 입니다.'
      );
      if (!confirmed) return;
    }

    nextStep();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 2: 내용 입력</h2>
        <p className="text-gray-600 mt-1">선택한 유형에 맞는 상세 정보를 입력해주세요.</p>
      </div>

      <PackagingMethod />
      <MarkingSection />
      <LabelSection />
      <LoadingMethod />
      <AdditionalRequests />

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전 단계로
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          미리보기 및 출력
          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export { PackagingMethod } from './PackagingMethod';
export { MarkingSection } from './Marking/MarkingSection';
export { LabelSection } from './Label/LabelSection';
export { LoadingMethod } from './LoadingMethod';
export { AdditionalRequests } from './AdditionalRequests';
