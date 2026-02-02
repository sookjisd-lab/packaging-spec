import type { PackagingSpecificationData } from '../types';
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
} from '../types';

// ============================================
// PDF 내보내기
// ============================================

export const exportToPDF = async (_data: PackagingSpecificationData): Promise<void> => {
  // html2pdf.js 동적 import
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import('html2pdf.js')).default as any;
  
  const element = document.getElementById('preview-content');
  if (!element) {
    alert('미리보기 컨텐츠를 찾을 수 없습니다.');
    return;
  }

  const opt = {
    margin: 10,
    filename: `포장사양서_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF 내보내기 실패:', error);
    alert('PDF 내보내기에 실패했습니다.');
  }
};

// ============================================
// Excel 내보내기
// ============================================

export const exportToExcel = async (data: PackagingSpecificationData): Promise<void> => {
  const XLSX = await import('xlsx');
  
  // 데이터를 시트별로 정리
  const workbook = XLSX.utils.book_new();

  // 1. 기본 정보 시트
  const basicInfo = [
    ['포장사양서'],
    [''],
    ['작성일시', new Date().toLocaleString('ko-KR')],
    [''],
    ['=== 유형 선택 ==='],
    ['제품 구성', PRODUCT_CONFIG_LABELS[data.typeSelection.productConfig]],
    ['제품 유형', data.typeSelection.productCategories.map(c => 
      c === 'other' ? data.typeSelection.productCategoryOther : PRODUCT_CATEGORY_LABELS[c]
    ).join(', ')],
    ['포장재', data.typeSelection.packagingMaterials.map(m => 
      m.type === 'other' ? m.customName : PACKAGING_MATERIAL_LABELS[m.type]
    ).join(', ')],
  ];

  // 기획세트인 경우 구성품 정보 추가
  if (data.typeSelection.productConfig === 'set' && data.typeSelection.setComponents) {
    basicInfo.push(['']);
    basicInfo.push(['=== 세트 구성품 ===']);
    data.typeSelection.setComponents.forEach((comp, index) => {
      const pouchStatus = comp.hasIndividualPouch ? '개별 파우치' : '';
      const boxStatus = comp.hasIndividualBox ? '개별 단상자' : '단상자 없음';
      basicInfo.push([`구성품 ${index + 1}`, comp.name, [pouchStatus, boxStatus].filter(Boolean).join(', ')]);
    });
  }

  const ws1 = XLSX.utils.aoa_to_sheet(basicInfo);
  XLSX.utils.book_append_sheet(workbook, ws1, '기본정보');

  // 2. 포장방법 시트
  const packagingMethod = [
    ['포장방법 / 순서'],
    [''],
    ['설명', data.packagingMethod.description],
    ['첨부 이미지 수', `${data.packagingMethod.images.length}개`],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(packagingMethod);
  XLSX.utils.book_append_sheet(workbook, ws2, '포장방법');

  // 3. 착인 정보 시트
  const markingData: (string | number)[][] = [
    ['착인 정보'],
    [''],
    ['대상', '유형', '착인방법', '착인위치', '관리번호', '사용기한', '제조일자', '기타', '사용기한기준', '개월수'],
  ];

  data.markingForms.forEach(form => {
    const comp = form.composition;
    markingData.push([
      form.targetName,
      form.targetType === 'component' ? '구성품' : form.targetType === 'individualBox' ? '단상자' : '세트상자',
      form.method === 'other' ? form.methodOther || '기타' : MARKING_METHOD_LABELS[form.method],
      form.position === 'other' ? form.positionOther || '기타' : MARKING_POSITION_LABELS[form.position],
      comp.hasManagementNumber ? (comp.managementNumberType === 'cosmax' ? `코스맥스(${comp.cosmaxNumberFormat})` : `고객사(${comp.clientNumberDescription})`) : '-',
      comp.hasExpiryDate ? (comp.expiryDateFormat === 'other' ? (comp.expiryDateCustom || '기타') : EXPIRY_DATE_FORMAT_LABELS[comp.expiryDateFormat!]) : '-',
      comp.hasManufactureDate ? (comp.manufactureDateFormat === 'other' ? (comp.manufactureDateCustom || '기타') : MANUFACTURE_DATE_FORMAT_LABELS[comp.manufactureDateFormat!]) : '-',
      comp.hasOther ? comp.otherDescription || '있음' : '-',
      (comp.hasExpiryDate || comp.hasManufactureDate) && comp.expiryBasis ? EXPIRY_BASIS_LABELS[comp.expiryBasis] : '-',
      (comp.hasExpiryDate || comp.hasManufactureDate) && comp.expiryMonths ? comp.expiryMonths : '-',
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(markingData);
  XLSX.utils.book_append_sheet(workbook, ws3, '착인정보');

  // 4. 라벨 정보 시트
  const labelData: (string | number)[][] = [
    ['라벨 정보'],
    [''],
    ['포장재', '라벨양식', '부착위치', '부착수량', '테이핑'],
  ];

  data.labelForms.forEach(form => {
    labelData.push([
      form.packagingMaterialType === 'other' ? form.packagingMaterialName : PACKAGING_MATERIAL_LABELS[form.packagingMaterialType],
      form.formatType ? LABEL_FORMAT_TYPE_LABELS[form.formatType] : '미선택',
      form.attachPosition === 'other' ? form.attachPositionOther || '기타' : LABEL_POSITION_LABELS[form.attachPosition],
      form.attachCount === 'other' ? form.attachCountOther || '기타' : LABEL_COUNT_LABELS[form.attachCount],
      form.hasTaping && form.tapingType ? (form.tapingType === 'other' ? (form.tapingOther || '기타') : BOX_TAPING_LABELS[form.tapingType]) : '-',
    ]);
  });

  // 팔레트 라벨
  labelData.push(['']);
  labelData.push(['팔레트 라벨']);
  labelData.push([
    '팔레트',
    data.paletteLabel.formatType ? LABEL_FORMAT_TYPE_LABELS[data.paletteLabel.formatType] : '미선택',
    data.paletteLabel.attachPosition === 'other' ? data.paletteLabel.attachPositionOther || '기타' : LABEL_POSITION_LABELS[data.paletteLabel.attachPosition],
    data.paletteLabel.attachCount === 'other' ? data.paletteLabel.attachCountOther || '기타' : LABEL_COUNT_LABELS[data.paletteLabel.attachCount],
    '-',
  ]);

  const ws4 = XLSX.utils.aoa_to_sheet(labelData);
  XLSX.utils.book_append_sheet(workbook, ws4, '라벨정보');

  // 5. 적재방법 시트
  const loadingData = [
    ['적재방법'],
    [''],
    ['팔레트 종류', data.loadingMethod.paletteType === 'other' ? data.loadingMethod.paletteTypeOther : PALETTE_TYPE_LABELS[data.loadingMethod.paletteType]],
    ['1단 박스수', `${data.loadingMethod.boxesPerLayer}개`],
    ['단수', `${data.loadingMethod.layerCount}단`],
    ['최대높이', `${data.loadingMethod.maxHeight}mm`],
    ['총 박스수', `${data.loadingMethod.boxesPerLayer * data.loadingMethod.layerCount}개/팔레트`],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(loadingData);
  XLSX.utils.book_append_sheet(workbook, ws5, '적재방법');

  // 6. 기타 요청사항 시트
  const additionalData = [
    ['기타 요청사항'],
    [''],
    ['내용', data.additionalRequest.description || '없음'],
    ['첨부 이미지 수', `${data.additionalRequest.images.length}개`],
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(additionalData);
  XLSX.utils.book_append_sheet(workbook, ws6, '기타요청');

  // Excel 파일 다운로드
  XLSX.writeFile(workbook, `포장사양서_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// ============================================
// JSON 저장/불러오기
// ============================================

export const saveToJSON = (data: PackagingSpecificationData): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `포장사양서_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const loadFromJSON = (file: File): Promise<PackagingSpecificationData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('잘못된 파일 형식입니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
};
