import React from 'react';
import { FormGroup, Dropdown, SingleImageUpload } from '../../common';
import { MarkingCompositionForm } from './MarkingCompositionForm';
import type { MarkingFormData, MarkingMethod, MarkingPosition, MarkingComposition } from '../../../types';
import { MARKING_METHOD_LABELS, MARKING_POSITION_LABELS } from '../../../types';

interface MarkingFormProps {
  data: MarkingFormData;
  onUpdate: (updates: Partial<MarkingFormData>) => void;
  onUpdateComposition: (updates: Partial<MarkingComposition>) => void;
}

const markingMethodOptions = Object.entries(MARKING_METHOD_LABELS).map(([value, label]) => ({
  value: value as MarkingMethod,
  label,
}));

const markingPositionOptions = Object.entries(MARKING_POSITION_LABELS).map(([value, label]) => ({
  value: value as MarkingPosition,
  label,
}));

const getTargetTypeLabel = (type: MarkingFormData['targetType']): string => {
  switch (type) {
    case 'component':
      return '구성품';
    case 'individualBox':
      return '단상자';
    case 'setBox':
      return '세트상자';
    default:
      return '';
  }
};

export const MarkingForm: React.FC<MarkingFormProps> = ({
  data,
  onUpdate,
  onUpdateComposition,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <span className="badge-blue">{getTargetTypeLabel(data.targetType)}</span>
        <h4 className="font-semibold text-gray-800">{data.targetName}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 좌측: 착인 방법 및 위치 */}
        <div className="space-y-4">
          {/* 착인 방법 */}
          <FormGroup label="착인 방법">
            <Dropdown
              options={markingMethodOptions}
              value={data.method}
              onChange={(value) => onUpdate({ method: value })}
              showOtherInput
              otherValue={data.methodOther}
              onOtherChange={(value) => onUpdate({ methodOther: value })}
              otherPlaceholder="기타 방법 입력"
            />
          </FormGroup>

          {/* 착인 위치 */}
          <FormGroup label="착인 위치">
            <Dropdown
              options={markingPositionOptions}
              value={data.position}
              onChange={(value) => onUpdate({ position: value })}
              showOtherInput
              otherValue={data.positionOther}
              onOtherChange={(value) => onUpdate({ positionOther: value })}
              otherPlaceholder="기타 위치 입력"
            />
          </FormGroup>

          {/* 착인 위치 이미지 */}
          <FormGroup label="착인 위치 이미지" helpText="착인 위치를 표시한 이미지를 첨부해주세요">
            <SingleImageUpload
              image={data.positionImage}
              onAdd={(image) => onUpdate({ positionImage: image })}
              onRemove={() => onUpdate({ positionImage: undefined })}
              label="위치 이미지"
            />
          </FormGroup>
        </div>

        {/* 우측: 착인 구성 */}
        <div>
          <FormGroup label="착인 구성">
            <MarkingCompositionForm
              composition={data.composition}
              onChange={onUpdateComposition}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};
