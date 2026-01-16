import React from 'react';
import { PackagingMethod } from './PackagingMethod';
import { MarkingSection } from './Marking/MarkingSection';
import { LabelSection } from './Label/LabelSection';
import { LoadingMethod } from './LoadingMethod';
import { AdditionalRequests } from './AdditionalRequests';
import { useFormStore } from '../../store/formStore';

export const Step2ContentInput: React.FC = () => {
  const { prevStep, nextStep } = useFormStore();

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
          onClick={nextStep}
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
