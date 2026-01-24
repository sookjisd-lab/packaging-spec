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
          placeholder={`예:
1.용기에 내용물 충전 후 캡 결합
 - 용기봉합 라벨 부착 [우측면, 캡과 용기가 이어지게]

2.단상자에 용기 포장
 - 봉합라벨 부착 [후면 상단, 결합부 가운데, 로고가 윗면 위치하도록(방향성 있음)]

3.인박스에 단상자 포장
 - 빈공간 완충재 투입 요청

4.아웃박스에 인박스 포장`}
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
