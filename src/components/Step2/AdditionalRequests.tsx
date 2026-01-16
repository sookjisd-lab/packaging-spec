import React from 'react';
import { FormSection, FormGroup, TextArea, ImageUpload } from '../common';
import { useFormStore } from '../../store/formStore';

export const AdditionalRequests: React.FC = () => {
  const {
    additionalRequest,
    setAdditionalRequest,
    addAdditionalRequestImage,
    removeAdditionalRequestImage,
  } = useFormStore();

  return (
    <FormSection title="5. 기타 요청사항">
      <FormGroup 
        label="추가 요청사항" 
        helpText="포장 작업 시 추가로 요청하실 사항이 있으면 입력해주세요."
      >
        <TextArea
          value={additionalRequest.description}
          onChange={(value) => setAdditionalRequest({ description: value })}
          placeholder="예: 특별 포장 요청, 주의사항, 기타 참고사항 등"
          rows={5}
        />
      </FormGroup>

      <FormGroup label="참고 이미지">
        <ImageUpload
          images={additionalRequest.images}
          onAdd={addAdditionalRequestImage}
          onRemove={removeAdditionalRequestImage}
          maxImages={10}
          label="이미지 추가"
        />
      </FormGroup>
    </FormSection>
  );
};
