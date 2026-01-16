import React from 'react';
import { FormSection, FormGroup, TextArea, ImageUpload } from '../common';
import { useFormStore } from '../../store/formStore';

export const PackagingMethod: React.FC = () => {
  const {
    packagingMethod,
    setPackagingMethod,
    addPackagingMethodImage,
    removePackagingMethodImage,
  } = useFormStore();

  return (
    <FormSection title="1. 포장방법 / 순서">
      <FormGroup 
        label="포장방법 및 순서 설명" 
        helpText="포장 작업 시 필요한 방법과 순서를 상세히 기술해주세요."
      >
        <TextArea
          value={packagingMethod.description}
          onChange={(value) => setPackagingMethod({ description: value })}
          placeholder="예: 1. 구성품을 단상자에 넣는다. 2. 단상자를 세트상자에 넣는다. 3. 세트상자를 아웃박스에 넣는다..."
          rows={6}
        />
      </FormGroup>

      <FormGroup label="참고 이미지">
        <ImageUpload
          images={packagingMethod.images}
          onAdd={addPackagingMethodImage}
          onRemove={removePackagingMethodImage}
          maxImages={10}
          label="이미지 추가"
        />
      </FormGroup>
    </FormSection>
  );
};
