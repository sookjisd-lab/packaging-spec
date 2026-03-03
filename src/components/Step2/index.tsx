import React, { useState } from 'react';
import { PackagingMethod } from './PackagingMethod';
import { MarkingSection } from './Marking/MarkingSection';
import { LabelSection } from './Label/LabelSection';
import { LoadingMethod } from './LoadingMethod';
import { AdditionalRequests } from './AdditionalRequests';
import { useFormStore } from '../../store/formStore';
import type { CustomLabelItem } from '../../types';

const hasNoCustomLabelItemsSelected = (items?: CustomLabelItem): boolean => {
  if (!items) return true;
  return !items.productName && !items.quantity && !items.managementNumber &&
    !items.expiryDate && !items.packagingDate && !items.clientProductCode &&
    !items.englishName && !items.barcodeImage && !items.barcodeNumber &&
    (!items.others || items.others.length === 0);
};

export const Step2ContentInput: React.FC = () => {
  const { prevStep, nextStep } = useFormStore();
  const [showLabelItemsModal, setShowLabelItemsModal] = useState(false);

  const handleSetDefaultLabelItems = () => {
    const state = useFormStore.getState();
    const { labelForms, paletteLabel } = state;

    const defaults: Partial<CustomLabelItem> = {
      productName: true,
      quantity: true,
      managementNumber: true,
      expiryDate: true,
    };

    labelForms.forEach((form) => {
      if (form.formatType === 'custom') {
        state.updateCustomLabelItems(form.id, defaults, false);
      }
    });

    if (paletteLabel.formatType === 'custom') {
      state.updatePaletteLabelCustomItems(defaults);
    }

    setShowLabelItemsModal(false);
  };

  const handleNextStep = () => {
    const { markingForms, labelForms, paletteLabel } = useFormStore.getState();

    // 1. 관리번호 필수 체크 (체크 여부 + 유형 선택 여부)
    const hasIncompleteManagementNumber = markingForms.some(
      (form) => !form.composition.hasManagementNumber || !form.composition.managementNumberType
    );
    if (hasIncompleteManagementNumber) {
      alert('관리번호 표기는 필수 사항입니다. 체크 후 선택 부탁드립니다');
      return;
    }

    // 2. 사용기한/제조일자 둘 다 미체크 경고
    const hasNoDateChecked = markingForms.some(
      (form) => !form.composition.hasExpiryDate && !form.composition.hasManufactureDate
    );
    if (hasNoDateChecked) {
      const confirmed = window.confirm(
        '내수제품의 경우에는 사용기한 표기, \'까지\' 문구가 필수입니다.\n해당 문제 상관없는 전량 수출 제품이라면 확인, 내수제품이라 사용기한 추가가 필요하다면 취소 입력 부탁드립니다'
      );
      if (!confirmed) return;
    }

    // 3. 제조일자만 체크, 사용기한 미체크 경고
    const hasOnlyManufactureDate = markingForms.some(
      (form) => form.composition.hasManufactureDate && !form.composition.hasExpiryDate
    );
    if (hasOnlyManufactureDate) {
      const confirmed = window.confirm(
        '내수 제품의 경우, 사용기한 없이 제조일자만 착인하려면, 제품에 PAO마크(개봉마크)가 있어야합니다.'
      );
      if (!confirmed) return;
    }

    // 4. 사용기한 '까지' / 제조일자 '제조' 문구 누락 경고
    const hasMissingSuffix = markingForms.some((form) => {
      const { composition } = form;
      if (composition.hasExpiryDate) {
        if (composition.expiryDateFormat === 'EXP_YYYYMMDD') return true;
        if (composition.expiryDateFormat === 'other' &&
          !composition.expiryDateCustom?.includes('까지')) return true;
      }
      if (composition.hasManufactureDate) {
        if (composition.manufactureDateFormat === 'other' &&
          !composition.manufactureDateCustom?.includes('제조')) return true;
      }
      return false;
    });
    if (hasMissingSuffix) {
      const confirmed = window.confirm(
        '내수 제품의 경우, 제조일자와 사용기한 뒤에 \'까지\', \'제조\'문구가 필수 입니다.'
      );
      if (!confirmed) return;
    }

    // 5. 직접입력 선택 시 라벨 항목 미선택 체크
    const hasCustomWithNoItems = labelForms.some((form) =>
      form.formatType === 'custom' && hasNoCustomLabelItemsSelected(form.customLabelItems)
    );
    const paletteCustomNoItems = paletteLabel.formatType === 'custom' &&
      hasNoCustomLabelItemsSelected(paletteLabel.customLabelItems);

    if (hasCustomWithNoItems || paletteCustomNoItems) {
      setShowLabelItemsModal(true);
      return;
    }

    // 6. 직접입력 + 라벨 항목 선택했지만 제품 정보 미입력 체크
    const allCustomItems: CustomLabelItem[] = [
      ...labelForms.filter(f => f.formatType === 'custom' && f.customLabelItems).map(f => f.customLabelItems!),
      ...(paletteLabel.formatType === 'custom' && paletteLabel.customLabelItems ? [paletteLabel.customLabelItems] : []),
    ];

    if (allCustomItems.length > 0) {
      const hasProductName = allCustomItems.some(item => item.productName);
      const hasEnglishName = allCustomItems.some(item => item.englishName);
      const hasClientProductCode = allCustomItems.some(item => item.clientProductCode);
      const hasBarcode = allCustomItems.some(item => item.barcodeImage || item.barcodeNumber);

      const getValueFromItems = (valueKey: keyof CustomLabelItem): string => {
        for (const item of allCustomItems) {
          const val = item[valueKey];
          if (typeof val === 'string' && val.trim()) return val;
        }
        return '';
      };

      const hasMissingProductInfo =
        (hasProductName && !getValueFromItems('productNameValue')) ||
        (hasEnglishName && !getValueFromItems('englishNameValue')) ||
        (hasClientProductCode && !getValueFromItems('clientProductCodeValue')) ||
        (hasBarcode && !getValueFromItems('barcodeValue'));

      if (hasMissingProductInfo) {
        alert('라벨에 표기할 정보를 기입하십시오(\'제품 정보\' 정보 입력 필수)');
        return;
      }
    }

    nextStep();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 2: 내용 입력</h2>
        <p className="text-gray-600 mt-1">선택한 유형에 맞는 상세 정보를 입력해주세요.</p>
      </div>

      <PackagingMethod />
      <MarkingSection />
      <LabelSection />
      <LoadingMethod />
      <AdditionalRequests />

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전 단계로
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          미리보기 및 출력
          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 라벨 항목 미선택 알림 모달 */}
      {showLabelItemsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4 shadow-xl">
            <p className="text-gray-800 text-base mb-6">
              라벨에 표기할 항목을 선택해주십시오(라벨 항목 선택에서 체크 필수)
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLabelItemsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                확인
              </button>
              <button
                type="button"
                onClick={handleSetDefaultLabelItems}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                기본값 설정(제품명,수량,관리번호,사용기한)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { PackagingMethod } from './PackagingMethod';
export { MarkingSection } from './Marking/MarkingSection';
export { LabelSection } from './Label/LabelSection';
export { LoadingMethod } from './LoadingMethod';
export { AdditionalRequests } from './AdditionalRequests';
