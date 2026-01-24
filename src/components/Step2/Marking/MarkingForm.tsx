import React from 'react';
import { FormGroup, Dropdown, SingleImageUpload } from '../../common';
import { MarkingCompositionForm } from './MarkingCompositionForm';
import type { MarkingFormData, MarkingMethod, MarkingPosition, MarkingComposition } from '../../../types';
import { 
  MARKING_METHOD_LABELS, 
  MARKING_POSITION_LABELS,
  EXPIRY_DATE_FORMAT_LABELS,
  MANUFACTURE_DATE_FORMAT_LABELS,
} from '../../../types';

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

const getMarkingPreviewLines = (composition: MarkingComposition): string[] => {
  const items: { line: number; format: string }[] = [];
  
  if (composition.hasManagementNumber) {
    let format = '';
    if (composition.managementNumberType === 'cosmax') {
      format = composition.cosmaxNumberFormat || 'ABC';
    } else {
      format = composition.clientNumberDescription || '고객사관리번호';
    }
    items.push({ line: composition.managementNumberLine || 1, format });
  }
  
  if (composition.hasExpiryDate) {
    let format = '';
    if (composition.expiryDateFormat === 'other') {
      format = composition.expiryDateCustom || '사용기한';
    } else {
      format = EXPIRY_DATE_FORMAT_LABELS[composition.expiryDateFormat || 'YYYYMMDD'];
    }
    items.push({ line: composition.expiryDateLine || 1, format });
  }
  
  if (composition.hasManufactureDate) {
    let format = '';
    if (composition.manufactureDateFormat === 'other') {
      format = composition.manufactureDateCustom || '제조일자';
    } else {
      format = MANUFACTURE_DATE_FORMAT_LABELS[composition.manufactureDateFormat || 'YYYYMMDD_MFG'];
    }
    items.push({ line: composition.manufactureDateLine || 1, format });
  }
  
  if (composition.hasOther) {
    items.push({ line: composition.otherLine || 1, format: composition.otherDescription || '기타' });
  }
  
  if (items.length === 0) return [];
  
  const maxLine = Math.max(...items.map(i => i.line));
  const lines: string[] = [];
  
  for (let lineNum = 1; lineNum <= maxLine; lineNum++) {
    const lineItems = items.filter(i => i.line === lineNum);
    if (lineItems.length > 0) {
      lines.push(lineItems.map(i => i.format).join(' '));
    }
  }
  
  return lines;
};

export const MarkingForm: React.FC<MarkingFormProps> = ({
  data,
  onUpdate,
  onUpdateComposition,
}) => {
  const previewLines = getMarkingPreviewLines(data.composition);

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

          {/* 착인 순서 미리보기 */}
          {previewLines.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-2">착인 순서 미리보기:</p>
              <div className="font-mono text-sm text-green-700 bg-white p-2 rounded border border-green-100">
                {previewLines.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}
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
