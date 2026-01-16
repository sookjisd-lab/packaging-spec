import React from 'react';
import { useFormStore } from '../../store/formStore';
import {
  PRODUCT_CONFIG_LABELS,
  PRODUCT_CATEGORY_LABELS,
  PACKAGING_MATERIAL_LABELS,
  MARKING_METHOD_LABELS,
  MARKING_POSITION_LABELS,
  EXPIRY_DATE_FORMAT_LABELS,
  MANUFACTURE_DATE_FORMAT_LABELS,
  EXPIRY_BASIS_LABELS,
  LABEL_FORMAT_TYPE_LABELS,
  LABEL_POSITION_LABELS,
  LABEL_COUNT_LABELS,
  BOX_TAPING_LABELS,
  PALETTE_TYPE_LABELS,
} from '../../types';

export const PreviewSection: React.FC = () => {
  const {
    typeSelection,
    packagingMethod,
    markingForms,
    labelForms,
    paletteLabel,
    loadingMethod,
    additionalRequest,
  } = useFormStore();

  return (
    <div id="preview-content" className="bg-white p-8 rounded-lg shadow print:shadow-none">
      {/* 헤더 */}
      <div className="text-center mb-8 pb-4 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900">신제품 포장사양서</h1>
        <p className="text-sm text-gray-500 mt-2">
          작성일: {new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 1. 유형 정보 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          1. 유형 정보
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600 w-1/4">제품 구성</td>
              <td className="py-2">{PRODUCT_CONFIG_LABELS[typeSelection.productConfig]}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">제품 유형</td>
              <td className="py-2">
                {typeSelection.productCategories.map(c => 
                  c === 'other' ? typeSelection.productCategoryOther : PRODUCT_CATEGORY_LABELS[c]
                ).join(', ')}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">포장재</td>
              <td className="py-2">
                {typeSelection.packagingMaterials.map(m => 
                  m.type === 'other' ? m.customName : PACKAGING_MATERIAL_LABELS[m.type]
                ).join(', ')}
              </td>
            </tr>
            {typeSelection.productConfig === 'set' && typeSelection.setComponents && (
              <tr className="border-b border-gray-200">
                <td className="py-2 font-medium text-gray-600">세트 구성품</td>
                <td className="py-2">
                  {typeSelection.setComponents.map((comp, index) => (
                    <span key={comp.id} className="inline-block mr-4">
                      {index + 1}. {comp.name} {comp.hasIndividualBox ? '(단상자 O)' : '(단상자 X)'}
                    </span>
                  ))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 2. 포장방법 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          2. 포장방법 / 순서
        </h2>
        <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4">
          {packagingMethod.description || '(입력 없음)'}
        </div>
        {packagingMethod.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {packagingMethod.images.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`포장방법 이미지 ${index + 1}`}
                className="w-32 h-32 object-cover border border-gray-200 rounded"
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. 착인 정보 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          3. 착인 정보
        </h2>
        {markingForms.map((form, index) => (
          <div key={form.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              {index + 1}. {form.targetName}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({form.targetType === 'component' ? '구성품' : form.targetType === 'individualBox' ? '단상자' : '세트상자'})
              </span>
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600 w-1/4">착인 방법</td>
                  <td className="py-1">
                    {form.method === 'other' ? form.methodOther : MARKING_METHOD_LABELS[form.method]}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600">착인 위치</td>
                  <td className="py-1">
                    {form.position === 'other' ? form.positionOther : MARKING_POSITION_LABELS[form.position]}
                  </td>
                </tr>
                {form.composition.hasManagementNumber && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 text-gray-600">관리번호</td>
                    <td className="py-1">
                      {form.composition.managementNumberType === 'cosmax' 
                        ? `코스맥스관리번호 (${form.composition.cosmaxNumberFormat})`
                        : `고객사관리번호: ${form.composition.clientNumberDescription}`}
                    </td>
                  </tr>
                )}
                {form.composition.hasExpiryDate && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 text-gray-600">사용기한</td>
                    <td className="py-1">
                      {form.composition.expiryDateFormat === 'other' 
                        ? form.composition.expiryDateCustom 
                        : EXPIRY_DATE_FORMAT_LABELS[form.composition.expiryDateFormat!]}
                    </td>
                  </tr>
                )}
                {form.composition.hasManufactureDate && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 text-gray-600">제조일자</td>
                    <td className="py-1">
                      {form.composition.manufactureDateFormat === 'other' 
                        ? form.composition.manufactureDateCustom 
                        : MANUFACTURE_DATE_FORMAT_LABELS[form.composition.manufactureDateFormat!]}
                    </td>
                  </tr>
                )}
                {form.composition.hasOther && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 text-gray-600">기타</td>
                    <td className="py-1">{form.composition.otherDescription}</td>
                  </tr>
                )}
                {(form.composition.hasExpiryDate || form.composition.hasManufactureDate) && (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 text-gray-600">사용기한 기준</td>
                      <td className="py-1">
                        {form.composition.expiryBasis ? EXPIRY_BASIS_LABELS[form.composition.expiryBasis] : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 text-gray-600">사용기한 개월수</td>
                      <td className="py-1">{form.composition.expiryMonths || '-'}개월</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            {form.positionImage && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">착인 위치 이미지:</p>
                <img 
                  src={form.positionImage} 
                  alt="착인 위치"
                  className="w-32 h-32 object-cover border border-gray-200 rounded"
                />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 4. 라벨 정보 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          4. 포장재 라벨 정보
        </h2>
        {labelForms.map((form, index) => (
          <div key={form.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              {index + 1}. {form.packagingMaterialType === 'other' ? form.packagingMaterialName : PACKAGING_MATERIAL_LABELS[form.packagingMaterialType]}
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600 w-1/4">라벨 양식</td>
                  <td className="py-1">{form.formatType ? LABEL_FORMAT_TYPE_LABELS[form.formatType] : '미선택'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600">부착 위치</td>
                  <td className="py-1">
                    {form.attachPosition === 'other' ? form.attachPositionOther : LABEL_POSITION_LABELS[form.attachPosition]}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-gray-600">부착 수량</td>
                  <td className="py-1">
                    {form.attachCount === 'other' ? form.attachCountOther : LABEL_COUNT_LABELS[form.attachCount]}
                  </td>
                </tr>
                {form.hasTaping && form.packagingMaterialType !== 'zipperBag' && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 text-gray-600">박스 테이핑</td>
                    <td className="py-1">
                      {form.tapingType === 'other' ? form.tapingOther : BOX_TAPING_LABELS[form.tapingType!]}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {/* 팔레트 라벨 */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-3">팔레트 라벨</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-purple-200">
                <td className="py-1 text-purple-700 w-1/4">라벨 양식</td>
                <td className="py-1">{paletteLabel.formatType ? LABEL_FORMAT_TYPE_LABELS[paletteLabel.formatType] : '미선택'}</td>
              </tr>
              <tr className="border-b border-purple-200">
                <td className="py-1 text-purple-700">부착 위치</td>
                <td className="py-1">
                  {paletteLabel.attachPosition === 'other' ? paletteLabel.attachPositionOther : LABEL_POSITION_LABELS[paletteLabel.attachPosition]}
                </td>
              </tr>
              <tr className="border-b border-purple-200">
                <td className="py-1 text-purple-700">부착 수량</td>
                <td className="py-1">
                  {paletteLabel.attachCount === 'other' ? paletteLabel.attachCountOther : LABEL_COUNT_LABELS[paletteLabel.attachCount]}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. 적재방법 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          5. 적재방법
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600 w-1/4">팔레트 종류</td>
              <td className="py-2">
                {loadingMethod.paletteType === 'other' ? loadingMethod.paletteTypeOther : PALETTE_TYPE_LABELS[loadingMethod.paletteType]}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">1단 박스수</td>
              <td className="py-2">{loadingMethod.boxesPerLayer}개</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">단수</td>
              <td className="py-2">{loadingMethod.layerCount}단</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">최대높이 (팔레트 포함)</td>
              <td className="py-2">{loadingMethod.maxHeight}mm</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-medium text-gray-600">총 박스수</td>
              <td className="py-2 font-semibold">{loadingMethod.boxesPerLayer * loadingMethod.layerCount}개 / 팔레트</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6. 기타 요청사항 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          6. 기타 요청사항
        </h2>
        <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4">
          {additionalRequest.description || '(입력 없음)'}
        </div>
        {additionalRequest.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {additionalRequest.images.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`참고 이미지 ${index + 1}`}
                className="w-32 h-32 object-cover border border-gray-200 rounded"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
