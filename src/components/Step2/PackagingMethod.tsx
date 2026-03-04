import React from 'react';
import { FormSection, RichTextEditor } from '../common';
import { useFormStore } from '../../store/formStore';

export const PackagingMethod: React.FC = () => {
  const { packagingMethod, setPackagingMethodRichContent } = useFormStore();

  return (
    <FormSection title="1. 포장방법 / 순서">
      <RichTextEditor
        content={packagingMethod.richContent}
        onChange={setPackagingMethodRichContent}
        placeholder={`예:
1.용기에 내용물 충전 후 캡 결합
 - 용기봉합 라벨 부착 [우측면, 캡과 용기가 이어지게]

2.단상자에 용기 포장
 - 봉합라벨 부착 [후면 상단, 결합부 가운데, 로고가 윗면 위치하도록(방향성 있음)]

3.인박스에 단상자 포장
 - 빈공간 완충재 투입 요청

4.아웃박스에 인박스 포장`}
      />
      <p className="mt-1.5 text-xs text-gray-500">
        포장 작업 시 필요한 방법과 순서를 기술하고, 참고 이미지를 함께 첨부해주세요.
      </p>
    </FormSection>
  );
};
