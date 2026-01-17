import React from 'react';
import { FormSection, FormGroup, Dropdown, NumberInput } from '../common';
import { useFormStore } from '../../store/formStore';
import type { PaletteType } from '../../types';
import { PALETTE_TYPE_LABELS } from '../../types';

const paletteTypeOptions = Object.entries(PALETTE_TYPE_LABELS).map(([value, label]) => ({
  value: value as PaletteType,
  label,
}));

export const LoadingMethod: React.FC = () => {
  const { loadingMethod, updateLoadingMethod } = useFormStore();

  return (
    <FormSection title="4. 적재방법">
      <div className="space-y-6">
        {/* 팔레트 종류 */}
        <FormGroup label="팔레트 종류" required>
          <Dropdown
            options={paletteTypeOptions}
            value={loadingMethod.paletteType}
            onChange={(value) => updateLoadingMethod({ paletteType: value })}
            showOtherInput
            otherValue={loadingMethod.paletteTypeOther}
            onOtherChange={(value) => updateLoadingMethod({ paletteTypeOther: value })}
            otherPlaceholder="팔레트 종류 직접 입력"
            className="max-w-md"
          />
        </FormGroup>

        {/* 적재 설명 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-4">적재 설명</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="1단에 박스수" required={false}>
              <NumberInput
                value={loadingMethod.boxesPerLayer}
                onChange={(value) => updateLoadingMethod({ boxesPerLayer: value })}
                placeholder="0"
                suffix="개"
                min={1}
                max={100}
              />
            </FormGroup>

            <FormGroup label="단수" required={false}>
              <NumberInput
                value={loadingMethod.layerCount}
                onChange={(value) => updateLoadingMethod({ layerCount: value })}
                placeholder="0"
                suffix="단"
                min={1}
                max={20}
              />
            </FormGroup>

            <FormGroup label="최대높이 (팔레트포함)" required={false}>
              <NumberInput
                value={loadingMethod.maxHeight}
                onChange={(value) => updateLoadingMethod({ maxHeight: value })}
                placeholder="0"
                suffix="mm"
                min={100}
                max={3000}
              />
            </FormGroup>
          </div>

          {/* 계산 결과 표시 */}
          {loadingMethod.boxesPerLayer > 0 && loadingMethod.layerCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">총 박스 수:</span>{' '}
                {loadingMethod.boxesPerLayer * loadingMethod.layerCount}개 / 팔레트
              </p>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
};
