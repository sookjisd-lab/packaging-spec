// ============================================
// 1. 유형 선택 관련 타입
// ============================================

/** 제품 구성 유형 */
export type ProductConfigType = 'single' | 'unboxed' | 'set';

/** 제품 유형 */
export type ProductCategory = 
  | 'basic'      // 기초
  | 'cushion'    // 쿠션
  | 'tube'       // 튜브
  | 'sachet'     // 샤셰
  | 'mask'       // 마스크
  | 'lipstick'   // 립스틱/립글로즈
  | 'powder'     // 파우더
  | 'other';     // 기타

/** 포장재 유형 */
export type PackagingMaterialType = 
  | 'zipperBag'  // 지퍼백
  | 'innerBox'   // 인박스
  | 'outerBox'   // 아웃박스
  | 'rrpBox'     // RRP박스
  | 'other';     // 기타

/** 포장재 선택 항목 */
export interface PackagingMaterial {
  type: PackagingMaterialType;
  customName?: string; // 기타 선택 시 명칭
}

/** 기획세트 구성품 정보 */
export interface SetComponentInfo {
  id: string;
  name: string;
  hasIndividualBox: boolean; // 단상자 유무
  productCategory: ProductCategory; // 제품 유형
  productCategoryOther?: string; // 기타 선택 시
}

/** Step1: 유형 선택 데이터 */
export interface TypeSelectionData {
  productConfig: ProductConfigType;
  productCategories: ProductCategory[]; // 세트의 경우 중복 선택
  productCategoryOther?: string; // 기타 선택 시
  packagingMaterials: PackagingMaterial[];
  setComponents?: SetComponentInfo[]; // 기획세트일 때만
}

// ============================================
// 2. 착인(마킹) 관련 타입
// ============================================

/** 착인 방법 */
export type MarkingMethod = 'coding' | 'engraving' | 'other';

/** 착인 위치 */
export type MarkingPosition = 'bottom' | 'back' | 'sealingFace' | 'frontBottom' | 'backBottom' | 'other';

/** 튜브 커팅 모양 */
export type TubeCuttingShape = 'straight' | 'round' | 'bending' | 'other';

/** 튜브 커팅 길이 */
export type TubeCuttingLength = 'minimum' | 'matchBox' | 'custom';

/** 튜브 착인 면 (전면/후면) */
export type TubeMarkingSide = 'front' | 'back';

/** 관리번호 유형 */
export type ManagementNumberType = 'cosmax' | 'client';

/** 코스맥스 관리번호 형식 */
export type CosmaxNumberFormat = 'ABC' | 'LOT_ABC';

/** 사용기한 형식 */
export type ExpiryDateFormat = 
  | 'YYYYMMDD'           // YYYYMMDD까지
  | 'EXP_YYYYMMDD_UNTIL' // EXP YYYYMMDD까지
  | 'EXP_YYYYMMDD'       // EXP YYYYMMDD
  | 'other';

/** 제조일자 형식 */
export type ManufactureDateFormat = 
  | 'YYYYMMDD_MFG'       // YYYYMMDD제조
  | 'MFG_YYYYMMDD'       // MFG YYYYMMDD제조
  | 'MFD_YYYYMMDD'       // MFD YYYYMMDD제조
  | 'other';

/** 사용기한 기준 */
export type ExpiryBasis = 'bulkManufacture' | 'packaging' | 'filling';

export interface MarkingComposition {
  hasManagementNumber: boolean;
  managementNumberType?: ManagementNumberType;
  cosmaxNumberFormat?: CosmaxNumberFormat;
  clientNumberDescription?: string;
  managementNumberLine?: number;
  managementNumberSide?: TubeMarkingSide;
  
  hasExpiryDate: boolean;
  expiryDateFormat?: ExpiryDateFormat;
  expiryDateCustom?: string;
  expiryDateLine?: number;
  expiryDateSide?: TubeMarkingSide;
  
  hasManufactureDate: boolean;
  manufactureDateFormat?: ManufactureDateFormat;
  manufactureDateCustom?: string;
  manufactureDateLine?: number;
  manufactureDateSide?: TubeMarkingSide;
  
  hasOther: boolean;
  otherDescription?: string;
  otherLine?: number;
  otherSide?: TubeMarkingSide;
  
  expiryBasis?: ExpiryBasis;
  expiryMonths?: number;
}

/** 개별 착인 양식 데이터 */
export interface MarkingFormData {
  id: string;
  targetName: string;
  targetType: 'component' | 'individualBox' | 'setBox';
  isFirstComponent?: boolean;
  productCategory?: ProductCategory;
  
  method: MarkingMethod;
  methodOther?: string;
  
  position: MarkingPosition;
  positionOther?: string;
  positionImage?: string;
  
  tubeCuttingShape?: TubeCuttingShape;
  tubeCuttingShapeOther?: string;
  tubeCuttingLength?: TubeCuttingLength;
  tubeCuttingLengthCustom?: string;
  
  composition: MarkingComposition;
  
  isCompositionManuallyEdited?: boolean;
  isExpiryBasisManuallyEdited?: boolean;
}

// ============================================
// 3. 라벨 관련 타입
// ============================================

/** 라벨 양식 유형 */
export type LabelFormatType = 'none' | 'separate' | 'wms' | 'custom';

/** 직접입력 라벨 항목 */
export interface CustomLabelItem {
  productName: boolean;
  quantity: boolean;
  managementNumber: boolean;
  expiryDate: boolean;
  packagingDate: boolean;
  clientProductCode: boolean;
  englishName: boolean;
  barcodeImage: boolean;
  barcodeNumber: boolean;
  others: string[];
  productNameValue?: string;
  englishNameValue?: string;
  clientProductCodeValue?: string;
  barcodeValue?: string;
}

/** 라벨 부착 위치 */
export type LabelAttachPosition = 'shortSide' | 'longSide' | 'top' | 'other';

/** 라벨 부착 수량 */
export type LabelAttachCount = 'single' | 'bothSides' | 'other';

/** 박스 테이핑 종류 */
export type BoxTapingType = 'straight' | 'hShape' | 'other';

/** 라벨 양식 데이터 */
export interface LabelFormData {
  id: string;
  packagingMaterialType: PackagingMaterialType;
  packagingMaterialName: string;
  
  formatType?: LabelFormatType;
  separateFormatImage?: string;
  customLabelItems?: CustomLabelItem;
  
  attachPosition: LabelAttachPosition;
  attachPositionOther?: string;
  attachCount: LabelAttachCount;
  attachCountOther?: string;
  
  hasTaping?: boolean;
  tapingType?: BoxTapingType;
  tapingOther?: string;
  
  isCustomItemsManuallyEdited?: boolean;
}

/** 팔레트 라벨 데이터 */
export interface PaletteLabelData {
  formatType?: LabelFormatType;
  separateFormatImage?: string;
  customLabelItems?: CustomLabelItem;
  attachPosition: LabelAttachPosition;
  attachPositionOther?: string;
  attachCount: LabelAttachCount;
  attachCountOther?: string;
}

// ============================================
// 4. 적재 방법 관련 타입
// ============================================

/** 팔레트 종류 */
export type PaletteType = 
  | 'kpp'              // KPP팔레트
  | 'aju'              // 아주팔레트
  | 'exportPlastic'    // 수출용플라스틱팔레트
  | 'wood1200x1000'    // 나무팔레트(1200*1000)
  | 'wood1200x800'     // 나무팔레트(1200*800)
  | 'other';

/** 적재 방법 데이터 */
export interface LoadingMethodData {
  paletteType: PaletteType;
  paletteTypeOther?: string;
  boxesPerLayer: number;    // 1단에 박스수
  layerCount: number;       // 단수
  maxHeight: number;        // 최대높이(팔레트포함)
}

// ============================================
// 5. 포장 방법 관련 타입
// ============================================

/** 포장 방법 데이터 */
export interface PackagingMethodData {
  description: string;
  images: string[]; // base64 이미지 배열
}

// ============================================
// 6. 기타 요청사항 타입
// ============================================

/** 기타 요청사항 데이터 */
export interface AdditionalRequestData {
  description: string;
  images: string[]; // base64 이미지 배열
}

// ============================================
// 7. 전체 폼 데이터 타입
// ============================================

/** 전체 포장사양서 데이터 */
export interface PackagingSpecificationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Step1: 유형 선택
  typeSelection: TypeSelectionData;
  
  // Step2: 내용 입력
  packagingMethod: PackagingMethodData;
  markingForms: MarkingFormData[];
  labelForms: LabelFormData[];
  paletteLabel: PaletteLabelData;
  loadingMethod: LoadingMethodData;
  additionalRequest: AdditionalRequestData;
}

// ============================================
// 8. UI 관련 타입
// ============================================

/** 현재 스텝 */
export type CurrentStep = 1 | 2 | 3;

/** 드롭다운 옵션 */
export interface DropdownOption<T = string> {
  value: T;
  label: string;
}

/** 체크박스 옵션 */
export interface CheckboxOption<T = string> {
  value: T;
  label: string;
  checked: boolean;
}

// ============================================
// 9. 상수 정의 (라벨용)
// ============================================

export const PRODUCT_CONFIG_LABELS: Record<ProductConfigType, string> = {
  single: '단품',
  unboxed: '미품',
  set: '기획(세트)',
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  basic: '기초',
  cushion: '쿠션',
  tube: '튜브',
  sachet: '샤셰',
  mask: '마스크',
  lipstick: '립스틱/립글로즈',
  powder: '파우더',
  other: '기타',
};

export const PACKAGING_MATERIAL_LABELS: Record<PackagingMaterialType, string> = {
  zipperBag: '지퍼백',
  innerBox: '인박스',
  outerBox: '아웃박스',
  rrpBox: 'RRP박스',
  other: '기타',
};

export const MARKING_METHOD_LABELS: Record<MarkingMethod, string> = {
  coding: '코딩',
  engraving: '각인',
  other: '기타',
};

export const MARKING_POSITION_LABELS: Record<MarkingPosition, string> = {
  bottom: '하면',
  back: '후면',
  sealingFace: '실링면',
  frontBottom: '전면 하단',
  backBottom: '후면 하단',
  other: '기타',
};

export const TUBE_CUTTING_SHAPE_LABELS: Record<TubeCuttingShape, string> = {
  straight: '일자 커팅',
  round: '라운드(R자) 커팅',
  bending: '절곡(알루미늄 튜브)',
  other: '기타',
};

export const TUBE_CUTTING_LENGTH_LABELS: Record<TubeCuttingLength, string> = {
  minimum: '최소커팅(3mm) 커팅',
  matchBox: '단상자 맞춰서 커팅',
  custom: '별도 기입',
};

export const TUBE_MARKING_SIDE_LABELS: Record<TubeMarkingSide, string> = {
  front: '전면',
  back: '후면',
};

export const EXPIRY_DATE_FORMAT_LABELS: Record<ExpiryDateFormat, string> = {
  YYYYMMDD: 'YYYYMMDD까지',
  EXP_YYYYMMDD_UNTIL: 'EXP YYYYMMDD까지',
  EXP_YYYYMMDD: 'EXP YYYYMMDD',
  other: '기타',
};

export const MANUFACTURE_DATE_FORMAT_LABELS: Record<ManufactureDateFormat, string> = {
  YYYYMMDD_MFG: 'YYYYMMDD제조',
  MFG_YYYYMMDD: 'MFG YYYYMMDD제조',
  MFD_YYYYMMDD: 'MFD YYYYMMDD제조',
  other: '기타',
};

export const EXPIRY_BASIS_LABELS: Record<ExpiryBasis, string> = {
  bulkManufacture: '벌크제조일기준',
  packaging: '포장일기준',
  filling: '충전일기준',
};

export const LABEL_POSITION_LABELS: Record<LabelAttachPosition, string> = {
  shortSide: '단측면',
  longSide: '장측면',
  top: '윗면',
  other: '기타',
};

export const LABEL_COUNT_LABELS: Record<LabelAttachCount, string> = {
  single: '1장',
  bothSides: '양면',
  other: '기타',
};

export const BOX_TAPING_LABELS: Record<BoxTapingType, string> = {
  straight: '일자테이핑',
  hShape: 'H자테이핑',
  other: '기타',
};

export const PALETTE_TYPE_LABELS: Record<PaletteType, string> = {
  kpp: 'KPP팔레트',
  aju: '아주팔레트',
  exportPlastic: '수출용플라스틱팔레트',
  wood1200x1000: '나무팔레트(1200*1000)',
  wood1200x800: '나무팔레트(1200*800)',
  other: '기타',
};

export const LABEL_FORMAT_TYPE_LABELS: Record<LabelFormatType, string> = {
  none: '없음(부착필요X)',
  separate: '별도양식',
  wms: 'WMS라벨',
  custom: '직접입력',
};
