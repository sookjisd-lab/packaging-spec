import React, { useState } from 'react';
import { FormGroup, RadioGroup, Dropdown, SingleImageUpload, Checkbox, TextInput } from '../../common';
import type { 
  PaletteLabelData, 
  LabelFormatType, 
  LabelAttachPosition, 
  LabelAttachCount,
  CustomLabelItem 
} from '../../../types';
import {
  LABEL_FORMAT_TYPE_LABELS,
  LABEL_POSITION_LABELS,
  LABEL_COUNT_LABELS,
} from '../../../types';

interface PaletteLabelFormProps {
  data: PaletteLabelData;
  onUpdate: (updates: Partial<PaletteLabelData>) => void;
  onUpdateCustomItems: (updates: Partial<CustomLabelItem>) => void;
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

export const PaletteLabelForm: React.FC<PaletteLabelFormProps> = ({
  data,
  onUpdate,
  onUpdateCustomItems,
}) => {
  const [newOther, setNewOther] = useState('');
  const items = data.customLabelItems || {
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
  };

  const handleAddOther = () => {
    if (newOther.trim()) {
      onUpdateCustomItems({
        others: [...(items.others || []), newOther.trim()],
      });
      setNewOther('');
    }
  };

  const handleRemoveOther = (index: number) => {
    onUpdateCustomItems({
      others: items.others?.filter((_, i) => i !== index) || [],
    });
  };

  // 체크된 항목들을 순서대로 수집
  const getCheckedItems = (): string[] => {
    const checkedItems: string[] = [];
    if (items.productName) checkedItems.push('제품명');
    if (items.quantity) checkedItems.push('수량');
    if (items.managementNumber) checkedItems.push('관리번호');
    if (items.expiryDate) checkedItems.push('사용기한');
    if (items.packagingDate) checkedItems.push('포장(제조)일자');
    if (items.clientProductCode) checkedItems.push('고객사제품코드');
    if (items.englishName) checkedItems.push('영문명');
    if (items.barcodeImage) checkedItems.push('바코드(이미지)');
    if (items.barcodeNumber) checkedItems.push('바코드(숫자)');
    items.others?.forEach((other) => checkedItems.push(other));
    return checkedItems;
  };

  const checkedItems = getCheckedItems();

  return (
    <div className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
        <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
          팔레트
        </span>
        <span className="font-semibold text-gray-800">팔레트 라벨</span>
      </div>

      <div className="space-y-6">
        {/* 라벨 양식 선택 */}
        <FormGroup label="라벨 양식">
          <RadioGroup
            name="paletteLabelFormat"
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Checkbox
                  label="제품명"
                  checked={items.productName}
                  onChange={(checked) => onUpdateCustomItems({ productName: checked })}
                />
                <Checkbox
                  label="수량"
                  checked={items.quantity}
                  onChange={(checked) => onUpdateCustomItems({ quantity: checked })}
                />
                <Checkbox
                  label="관리번호"
                  checked={items.managementNumber}
                  onChange={(checked) => onUpdateCustomItems({ managementNumber: checked })}
                />
                <Checkbox
                  label="사용기한"
                  checked={items.expiryDate}
                  onChange={(checked) => onUpdateCustomItems({ expiryDate: checked })}
                />
                <Checkbox
                  label="포장(제조)일자"
                  checked={items.packagingDate}
                  onChange={(checked) => onUpdateCustomItems({ packagingDate: checked })}
                />
                <Checkbox
                  label="고객사제품코드"
                  checked={items.clientProductCode}
                  onChange={(checked) => onUpdateCustomItems({ clientProductCode: checked })}
                />
                <Checkbox
                  label="영문명"
                  checked={items.englishName}
                  onChange={(checked) => onUpdateCustomItems({ englishName: checked })}
                />
                <Checkbox
                  label="바코드(이미지화)"
                  checked={items.barcodeImage}
                  onChange={(checked) => onUpdateCustomItems({ barcodeImage: checked })}
                />
                <Checkbox
                  label="바코드(숫자만)"
                  checked={items.barcodeNumber}
                  onChange={(checked) => onUpdateCustomItems({ barcodeNumber: checked })}
                />
              </div>

              {/* 기타 항목 */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">기타 항목 (중복 추가 가능)</p>
                
                {items.others && items.others.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {items.others.map((other, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="badge-gray">{other}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOther(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <TextInput
                    value={newOther}
                    onChange={setNewOther}
                    placeholder="추가할 항목 입력"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddOther}
                    disabled={!newOther.trim()}
                    className="btn-secondary disabled:opacity-50"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 라벨 예시 미리보기 */}
              {checkedItems.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium mb-2">라벨 예시:</p>
                  <div className="bg-white p-3 rounded border border-yellow-300 text-sm font-mono">
                    {checkedItems.map((item, index) => (
                      <div key={index} className="text-gray-700">
                        {item}: <span className="text-gray-400">[값]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormGroup>
        )}

        {/* 라벨 부착 위치 (없음이 아닐 때만 표시) */}
        {data.formatType && data.formatType !== 'none' && (
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

        {/* 없음 선택 시 안내 문구 */}
        {data.formatType === 'none' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 font-medium">라벨 부착 필요 없음</p>
            <p className="text-sm text-gray-500 mt-1">팔레트에는 라벨을 부착하지 않습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
