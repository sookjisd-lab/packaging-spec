import React from 'react';
import { FormGroup, RadioGroup, Dropdown, SingleImageUpload } from '../../common';
import { CustomLabelForm } from './CustomLabelForm';
import type { 
  LabelFormData, 
  LabelFormatType, 
  LabelAttachPosition, 
  LabelAttachCount,
  BoxTapingType,
  CustomLabelItem 
} from '../../../types';
import {
  LABEL_FORMAT_TYPE_LABELS,
  LABEL_POSITION_LABELS,
  LABEL_COUNT_LABELS,
  BOX_TAPING_LABELS,
  PACKAGING_MATERIAL_LABELS,
} from '../../../types';

interface LabelFormProps {
  data: LabelFormData;
  onUpdate: (updates: Partial<LabelFormData>) => void;
  onUpdateCustomItems: (updates: Partial<CustomLabelItem>) => void;
  onAddCustomOther: (value: string) => void;
  onRemoveCustomOther: (index: number) => void;
}

const formatTypeOptions = Object.entries(LABEL_FORMAT_TYPE_LABELS).map(([value, label]) => ({
  value: value as LabelFormatType,
  label,
}));

const attachPositionOptions = Object.entries(LABEL_POSITION_LABELS).map(([value, label]) => ({
  value: value as LabelAttachPosition,
  label,
}));

const attachCountOptions = Object.entries(LABEL_COUNT_LABELS).map(([value, label]) => ({
  value: value as LabelAttachCount,
  label,
}));

const tapingTypeOptions = Object.entries(BOX_TAPING_LABELS).map(([value, label]) => ({
  value: value as BoxTapingType,
  label,
}));

const getMaterialDisplayName = (data: LabelFormData): string => {
  if (data.packagingMaterialType === 'other') {
    return data.packagingMaterialName || '기타 포장재';
  }
  return PACKAGING_MATERIAL_LABELS[data.packagingMaterialType] || data.packagingMaterialName;
};

export const LabelForm: React.FC<LabelFormProps> = ({
  data,
  onUpdate,
  onUpdateCustomItems,
  onAddCustomOther,
  onRemoveCustomOther,
}) => {
  const showTaping = data.hasTaping && data.packagingMaterialType !== 'zipperBag';

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <span className="badge-green">{getMaterialDisplayName(data)}</span>
        <span className="text-sm text-gray-500">라벨 정보</span>
      </div>

      <div className="space-y-6">
        {/* 라벨 양식 선택 */}
        <FormGroup label="라벨 양식">
          <RadioGroup
            name={`labelFormat-${data.id}`}
            options={formatTypeOptions}
            value={data.formatType}
            onChange={(value) => onUpdate({ formatType: value })}
          />
        </FormGroup>

        {/* 별도양식 선택 시 이미지 업로드 */}
        {data.formatType === 'separate' && (
          <FormGroup label="별도 양식 이미지">
            <SingleImageUpload
              image={data.separateFormatImage}
              onAdd={(image) => onUpdate({ separateFormatImage: image })}
              onRemove={() => onUpdate({ separateFormatImage: undefined })}
              label="양식 이미지"
            />
          </FormGroup>
        )}

        {/* 없음 선택 시 안내 문구 */}
        {data.formatType === 'none' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 font-medium">라벨 부착 필요 없음</p>
            <p className="text-sm text-gray-500 mt-1">이 포장재에는 라벨을 부착하지 않습니다.</p>
          </div>
        )}

        {/* WMS라벨 선택 시 문구 표시 */}
        {data.formatType === 'wms' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">WMS 라벨</p>
            <p className="text-sm text-blue-600 mt-1">WMS 시스템에서 자동 출력되는 라벨을 사용합니다.</p>
          </div>
        )}

        {/* 직접입력 선택 시 체크박스 */}
        {data.formatType === 'custom' && (
          <FormGroup label="라벨 항목 선택">
            <CustomLabelForm
              items={data.customLabelItems || {
                productName: false,
                quantity: false,
                managementNumber: false,
                expiryDate: false,
                packagingDate: false,
                clientProductCode: false,
                englishName: false,
                barcodeImage: false,
                barcodeNumber: false,
                others: [],
              }}
              onChange={onUpdateCustomItems}
              onAddOther={onAddCustomOther}
              onRemoveOther={onRemoveCustomOther}
            />
          </FormGroup>
        )}

        {/* 라벨 부착 위치 (없음이 아닐 때만 표시) */}
        {data.formatType !== 'none' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="라벨 부착 위치">
              <Dropdown
                options={attachPositionOptions}
                value={data.attachPosition}
                onChange={(value) => onUpdate({ attachPosition: value })}
                showOtherInput
                otherValue={data.attachPositionOther}
                onOtherChange={(value) => onUpdate({ attachPositionOther: value })}
                otherPlaceholder="위치 직접 입력"
              />
            </FormGroup>

            <FormGroup label="라벨 부착 수량">
              <Dropdown
                options={attachCountOptions}
                value={data.attachCount}
                onChange={(value) => onUpdate({ attachCount: value })}
                showOtherInput
                otherValue={data.attachCountOther}
                onOtherChange={(value) => onUpdate({ attachCountOther: value })}
                otherPlaceholder="수량 직접 입력"
              />
            </FormGroup>
          </div>
        )}

        {/* 박스 테이핑 (지퍼백 제외, 없음이 아닐 때) */}
        {showTaping && data.formatType !== 'none' && (
          <div className="border-t border-gray-200 pt-4">
            <FormGroup label="박스 테이핑">
              <Dropdown
                options={tapingTypeOptions}
                value={data.tapingType || 'straight'}
                onChange={(value) => onUpdate({ tapingType: value })}
                showOtherInput
                otherValue={data.tapingOther}
                onOtherChange={(value) => onUpdate({ tapingOther: value })}
                otherPlaceholder="테이핑 방법 직접 입력"
              />
            </FormGroup>
          </div>
        )}
      </div>
    </div>
  );
};
