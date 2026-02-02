import React from 'react';
import { FormGroup, Dropdown, SingleImageUpload } from '../../common';
import { MarkingCompositionForm } from './MarkingCompositionForm';
import type { 
  MarkingFormData, 
  MarkingMethod, 
  MarkingPosition, 
  MarkingComposition,
  TubeCuttingShape,
  TubeCuttingLength,
  ProductConfigType,
} from '../../../types';
import { 
  MARKING_METHOD_LABELS, 
  MARKING_POSITION_LABELS,
  EXPIRY_DATE_FORMAT_LABELS,
  MANUFACTURE_DATE_FORMAT_LABELS,
  TUBE_CUTTING_SHAPE_LABELS,
  TUBE_CUTTING_LENGTH_LABELS,
  TUBE_MARKING_SIDE_LABELS,
  PRODUCT_CATEGORY_LABELS,
} from '../../../types';
import type { ProductCategory } from '../../../types';

const getCategoryBadge = (category?: ProductCategory): { label: string; className: string } | null => {
  if (!category) return null;
  
  const colorMap: Record<ProductCategory, string> = {
    tube: 'bg-orange-100 text-orange-800',
    sachet: 'bg-purple-100 text-purple-800',
    mask: 'bg-teal-100 text-teal-800',
    basic: 'bg-blue-100 text-blue-800',
    cushion: 'bg-pink-100 text-pink-800',
    lipstick: 'bg-red-100 text-red-800',
    powder: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };
  
  return {
    label: PRODUCT_CATEGORY_LABELS[category],
    className: colorMap[category] || 'bg-gray-100 text-gray-800',
  };
};

interface MarkingFormProps {
  data: MarkingFormData;
  onUpdate: (updates: Partial<MarkingFormData>) => void;
  onUpdateComposition: (updates: Partial<MarkingComposition>) => void;
  productConfig?: ProductConfigType;
}

const markingMethodOptions = Object.entries(MARKING_METHOD_LABELS).map(([value, label]) => ({
  value: value as MarkingMethod,
  label,
}));

const getPositionOptionsForCategory = (category?: string): { value: MarkingPosition; label: string }[] => {
  const baseOptions: { value: MarkingPosition; label: string }[] = [
    { value: 'bottom', label: MARKING_POSITION_LABELS.bottom },
    { value: 'back', label: MARKING_POSITION_LABELS.back },
  ];
  
  if (category === 'tube') {
    return [
      { value: 'sealingFace', label: MARKING_POSITION_LABELS.sealingFace },
      ...baseOptions,
      { value: 'other', label: MARKING_POSITION_LABELS.other },
    ];
  }
  
  if (category === 'sachet' || category === 'mask') {
    return [
      ...baseOptions,
      { value: 'frontBottom', label: MARKING_POSITION_LABELS.frontBottom },
      { value: 'backBottom', label: MARKING_POSITION_LABELS.backBottom },
      { value: 'other', label: MARKING_POSITION_LABELS.other },
    ];
  }
  
  return [
    ...baseOptions,
    { value: 'other', label: MARKING_POSITION_LABELS.other },
  ];
};

const tubeCuttingShapeOptions = Object.entries(TUBE_CUTTING_SHAPE_LABELS).map(([value, label]) => ({
  value: value as TubeCuttingShape,
  label,
}));

const getTubeCuttingLengthOptions = (productConfig?: ProductConfigType): { value: TubeCuttingLength; label: string }[] => {
  const options: { value: TubeCuttingLength; label: string }[] = [
    { value: 'minimum', label: TUBE_CUTTING_LENGTH_LABELS.minimum },
  ];
  
  if (productConfig === 'single') {
    options.push({ value: 'matchBox', label: '단상자 맞춰서 커팅' });
  } else if (productConfig === 'set') {
    options.push({ value: 'matchBox', label: '세트상자/트레이 맞춰서 커팅' });
  }
  
  options.push({ value: 'custom', label: TUBE_CUTTING_LENGTH_LABELS.custom });
  
  return options;
};

const getTargetTypeLabel = (type: MarkingFormData['targetType']): string => {
  switch (type) {
    case 'component':
      return '구성품';
    case 'individualPouch':
      return '파우치';
    case 'individualBox':
      return '단상자';
    case 'setBox':
      return '세트상자';
    default:
      return '';
  }
};

const getMarkingPreviewLines = (composition: MarkingComposition, isTubeEngraving: boolean): string[] => {
  if (isTubeEngraving) {
    const frontItems: string[] = [];
    const backItems: string[] = [];
    
    const addItem = (side: 'front' | 'back' | undefined, format: string) => {
      if (side === 'front') frontItems.push(format);
      else backItems.push(format);
    };
    
    if (composition.hasManagementNumber) {
      let format = '';
      if (composition.managementNumberType === 'cosmax') {
        format = composition.cosmaxNumberFormat === 'LOT_ABC' ? 'LOT ABC' : (composition.cosmaxNumberFormat || 'ABC');
      } else {
        format = composition.clientNumberDescription || '고객사관리번호';
      }
      addItem(composition.managementNumberSide, format);
    }
    
    if (composition.hasExpiryDate) {
      let format = '';
      if (composition.expiryDateFormat === 'other') {
        format = composition.expiryDateCustom || '사용기한';
      } else {
        format = EXPIRY_DATE_FORMAT_LABELS[composition.expiryDateFormat || 'YYYYMMDD'];
      }
      addItem(composition.expiryDateSide, format);
    }
    
    if (composition.hasManufactureDate) {
      let format = '';
      if (composition.manufactureDateFormat === 'other') {
        format = composition.manufactureDateCustom || '제조일자';
      } else {
        format = MANUFACTURE_DATE_FORMAT_LABELS[composition.manufactureDateFormat || 'YYYYMMDD_MFG'];
      }
      addItem(composition.manufactureDateSide, format);
    }
    
    if (composition.hasOther) {
      addItem(composition.otherSide, composition.otherDescription || '기타');
    }
    
    const lines: string[] = [];
    if (frontItems.length > 0) {
      lines.push(`${TUBE_MARKING_SIDE_LABELS.front} : ${frontItems.join(' ')}`);
    }
    if (backItems.length > 0) {
      lines.push(`${TUBE_MARKING_SIDE_LABELS.back} : ${backItems.join(' ')}`);
    }
    return lines;
  }
  
  const items: { line: number; format: string }[] = [];
  
  if (composition.hasManagementNumber) {
    let format = '';
    if (composition.managementNumberType === 'cosmax') {
      format = composition.cosmaxNumberFormat === 'LOT_ABC' ? 'LOT ABC' : (composition.cosmaxNumberFormat || 'ABC');
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
  productConfig,
}) => {
  const isTube = data.productCategory === 'tube';
  const isTubeEngraving = isTube && data.method === 'engraving' && data.position === 'sealingFace';
  const isSachetOrMask = data.productCategory === 'sachet' || data.productCategory === 'mask';
  const previewLines = getMarkingPreviewLines(data.composition, isTubeEngraving);
  const positionOptions = getPositionOptionsForCategory(data.productCategory);
  const cuttingLengthOptions = getTubeCuttingLengthOptions(productConfig);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <span className="badge-blue">
          {(data.targetType === 'individualPouch' || data.targetType === 'individualBox') ? '구성품' : getTargetTypeLabel(data.targetType)}
        </span>
        {data.productCategory && (() => {
          const badge = getCategoryBadge(data.productCategory);
          return badge ? (
            <span className={`${badge.className} px-2 py-0.5 rounded-full text-xs font-medium`}>
              {badge.label}
            </span>
          ) : null;
        })()}
        {(data.targetType === 'individualPouch' || data.targetType === 'individualBox') && (
          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
            {data.targetType === 'individualPouch' ? '파우치' : '단상자'}
          </span>
        )}
        <h4 className="font-semibold text-gray-800">
          {data.targetName.replace(/ 파우치$/, '').replace(/ 단상자$/, '')}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {isTube && data.targetType === 'component' && (
            <>
              <FormGroup label="튜브 커팅 모양">
                <Dropdown
                  options={tubeCuttingShapeOptions}
                  value={data.tubeCuttingShape || ('' as TubeCuttingShape)}
                  onChange={(value) => onUpdate({ tubeCuttingShape: value })}
                  showOtherInput
                  otherValue={data.tubeCuttingShapeOther}
                  onOtherChange={(value) => onUpdate({ tubeCuttingShapeOther: value })}
                  otherPlaceholder="기타 커팅 모양 입력"
                />
              </FormGroup>

              <FormGroup label="튜브 커팅 길이">
                <Dropdown
                  options={cuttingLengthOptions}
                  value={data.tubeCuttingLength || ('' as TubeCuttingLength)}
                  onChange={(value) => onUpdate({ tubeCuttingLength: value })}
                />
                {data.tubeCuttingLength === 'custom' && (
                  <input
                    type="text"
                    value={data.tubeCuttingLengthCustom || ''}
                    onChange={(e) => onUpdate({ tubeCuttingLengthCustom: e.target.value })}
                    placeholder="커팅 길이 입력 (예: 5mm)"
                    className="form-input mt-2"
                  />
                )}
              </FormGroup>
            </>
          )}

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

          <FormGroup label="착인 위치">
            <Dropdown
              options={positionOptions}
              value={data.position}
              onChange={(value) => onUpdate({ position: value })}
              showOtherInput
              otherValue={data.positionOther}
              onOtherChange={(value) => onUpdate({ positionOther: value })}
              otherPlaceholder="기타 위치 입력"
            />
          </FormGroup>

          <FormGroup label="착인 위치 이미지" helpText="착인 위치를 표시한 이미지를 첨부해주세요">
            <SingleImageUpload
              image={data.positionImage}
              onAdd={(image) => onUpdate({ positionImage: image })}
              onRemove={() => onUpdate({ positionImage: undefined })}
              label="위치 이미지"
            />
          </FormGroup>

          {previewLines.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-2">착인 양식 미리보기:</p>
              <div className="font-mono text-sm text-green-700 bg-white p-2 rounded border border-green-100">
                {previewLines.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <FormGroup label="착인 구성">
            <MarkingCompositionForm
              composition={data.composition}
              onChange={onUpdateComposition}
              isTubeEngraving={isTubeEngraving}
              isSachetOrMask={isSachetOrMask}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};
