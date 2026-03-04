import React from 'react';
import { FormSection, RichTextEditor } from '../common';
import { useFormStore } from '../../store/formStore';

export const AdditionalRequests: React.FC = () => {
  const { additionalRequest, setAdditionalRequestRichContent } = useFormStore();

  return (
    <FormSection title="5. 기타 요청사항">
      <RichTextEditor
        content={additionalRequest.richContent}
        onChange={setAdditionalRequestRichContent}
        placeholder="예: 특별 포장 요청, 주의사항, 기타 참고사항 등"
      />
      <p className="mt-1.5 text-xs text-gray-500">
        포장 작업 시 추가 요청사항을 입력하고, 참고 이미지를 함께 첨부해주세요.
      </p>
    </FormSection>
  );
};
