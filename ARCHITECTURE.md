# 포장사양서 작성 시스템 - 아키텍처 문서

## 1. 시스템 개요

### 1.1 목적
화장품 제조 업체에서 고객사에게 신제품 포장사양(포장방법, 착인, 박스표기방법 등)을 전달하기 위한 **포장사양서 작성 웹 애플리케이션**

### 1.2 핵심 기능
- 3단계 마법사 형식의 포장사양서 작성
- 유형에 따른 동적 폼 생성 (단품/미품/기획세트)
- PDF 다운로드
- 로컬 저장/불러오기 (JSON + localStorage)
- Google OAuth 인증 + 2차 앱 인증
- 관리자 기능 (사용자 관리, 앱 접근 인증정보 설정)

### 1.3 기술 스택

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | React | 19.2.0 | UI 라이브러리 |
| **언어** | TypeScript | 5.9.3 | 타입 안전성 |
| **빌드 도구** | Vite | 7.2.4 | 빠른 개발/빌드 |
| **상태관리** | Zustand | 5.0.10 | 글로벌 폼 상태 관리 |
| **스타일링** | Tailwind CSS | 4.1.18 | 유틸리티 기반 CSS |
| **라우팅** | React Router | 7.12.0 | 페이지 라우팅 |
| **백엔드/인증** | Supabase | 2.90.1 | DB, Auth, API |
| **PDF 생성** | html2pdf.js | 0.14.0 | HTML → PDF 변환 |

---

## 2. 프로젝트 구조

```
src/
├── main.tsx                    # 앱 진입점
├── App.tsx                     # 메인 라우팅 + 레이아웃
├── index.css                   # Tailwind CSS 설정
│
├── types/
│   ├── index.ts                # 폼 관련 타입/인터페이스 정의
│   └── database.ts             # Supabase DB 타입 정의
│
├── store/
│   └── formStore.ts            # Zustand 스토어 (폼 상태 관리)
│
├── lib/
│   ├── supabase.ts             # Supabase 클라이언트 초기화
│   └── auth.ts                 # 인증 유틸리티
│
├── context/
│   └── AuthContext.tsx          # 인증 Context Provider
│
├── hooks/
│   ├── useAuth.ts              # 인증 훅 (re-export)
│   ├── useSpecifications.ts    # 사양서 CRUD 훅
│   └── useUsers.ts             # 사용자 관리 훅
│
├── pages/
│   ├── LoginPage.tsx           # 로그인 페이지
│   ├── SecondaryLoginPage.tsx  # 2차 앱 인증 페이지
│   ├── PendingPage.tsx         # 승인 대기 페이지
│   └── AdminPage.tsx           # 관리자 페이지
│
├── utils/
│   └── exportUtils.ts          # PDF/JSON 내보내기 유틸리티
│
└── components/
    ├── common/                 # 재사용 가능한 기본 컴포넌트
    │   ├── index.ts            # 배럴 export
    │   ├── FormSection.tsx     # 폼 섹션 레이아웃
    │   ├── Dropdown.tsx        # 드롭다운 선택
    │   ├── Checkbox.tsx        # 체크박스/라디오 그룹
    │   ├── TextInput.tsx       # 텍스트/숫자 입력
    │   └── ImageUpload.tsx     # 이미지 업로드
    │
    ├── auth/                   # 인증 관련 컴포넌트
    │   ├── AuthCallback.tsx    # OAuth 콜백 처리
    │   ├── LoginButton.tsx     # 로그인 버튼
    │   ├── LogoutButton.tsx    # 로그아웃 버튼
    │   └── ProtectedRoute.tsx  # 인증 라우트 가드
    │
    ├── admin/                  # 관리자 컴포넌트
    │   ├── UserList.tsx        # 사용자 목록/관리
    │   └── CredentialSettings.tsx # 앱 인증정보 설정
    │
    ├── Step1/                  # Step 1: 유형 선택
    │   ├── index.tsx           # Step1 컨테이너
    │   ├── ProductConfigSelect.tsx    # 제품 구성 선택
    │   ├── ProductTypeSelect.tsx      # 제품 유형 선택
    │   └── PackagingMaterialSelect.tsx # 포장재 선택
    │
    ├── Step2/                  # Step 2: 내용 입력
    │   ├── index.tsx           # Step2 컨테이너
    │   ├── PackagingMethod.tsx # 포장방법/순서
    │   ├── LoadingMethod.tsx   # 적재방법
    │   ├── AdditionalRequests.tsx # 기타 요청사항
    │   │
    │   ├── Marking/            # 착인 정보 섹션
    │   │   ├── MarkingSection.tsx
    │   │   ├── MarkingForm.tsx
    │   │   └── MarkingCompositionForm.tsx
    │   │
    │   └── Label/              # 라벨 정보 섹션
    │       ├── LabelSection.tsx
    │       ├── LabelForm.tsx
    │       ├── CustomLabelForm.tsx
    │       └── PaletteLabelForm.tsx
    │
    └── Step3/                  # Step 3: 미리보기 & 출력
        ├── index.tsx           # Step3 컨테이너 + 액션 버튼
        └── PreviewSection.tsx  # 미리보기 렌더링
```

---

## 3. 데이터 아키텍처

### 3.1 핵심 데이터 모델 (types/index.ts)

```
PackagingSpecificationData (전체 문서)
├── id: string
├── createdAt: string
├── updatedAt: string
│
├── typeSelection: TypeSelectionData          ← Step 1 데이터
│   ├── productConfig: 'single' | 'unboxed' | 'set'
│   ├── productCategories: ProductCategory[]
│   ├── packagingMaterials: PackagingMaterial[]
│   └── setComponents?: SetComponentInfo[]    ← 기획세트 전용
│
├── packagingMethod: PackagingMethodData      ← Step 2 데이터
│   ├── description: string
│   └── images: string[]
│
├── markingForms: MarkingFormData[]           ← 동적 생성 (착인)
│   ├── id, targetName, targetType
│   ├── method, position
│   └── composition: MarkingComposition
│
├── labelForms: LabelFormData[]               ← 동적 생성 (라벨)
│   ├── id, packagingMaterialType
│   ├── formatType, attachPosition, attachCount
│   └── customLabelItems?: CustomLabelItem
│
├── paletteLabel: PaletteLabelData            ← 고정 (팔레트 라벨)
│
├── loadingMethod: LoadingMethodData          ← 적재방법
│   ├── paletteType, boxesPerLayer
│   ├── layerCount, maxHeight
│
└── additionalRequest: AdditionalRequestData  ← 기타 요청
    ├── description: string
    └── images: string[]
```

### 3.2 동적 폼 생성 규칙

#### 착인 폼 (MarkingForms) 생성 로직

| 제품 구성 | 생성되는 착인 폼 |
|-----------|------------------|
| **단품 (single)** | 구성품 1개 + 단상자 1개 = **2개** |
| **미품 (unboxed)** | 구성품 1개 = **1개** |
| **기획세트 (set)** | 각 구성품 + 단상자(있으면) + 세트상자 = **N개** |

```typescript
// formStore.ts의 generateMarkingForms() 로직
if (productConfig === 'single') {
  // 구성품 + 단상자
} else if (productConfig === 'unboxed') {
  // 구성품만
} else if (productConfig === 'set') {
  // 각 구성품 + 단상자(옵션) + 세트상자
}
```

#### 라벨 폼 (LabelForms) 생성 로직

| 조건 | 생성 |
|------|------|
| 선택된 포장재마다 | 1개씩 라벨 폼 생성 |
| 팔레트 라벨 | 항상 1개 (고정) |

---

## 4. 상태 관리 (Zustand)

### 4.1 스토어 구조

```typescript
// store/formStore.ts
interface FormState {
  // === 상태 ===
  currentStep: 1 | 2 | 3;
  typeSelection: TypeSelectionData;
  packagingMethod: PackagingMethodData;
  markingForms: MarkingFormData[];
  labelForms: LabelFormData[];
  paletteLabel: PaletteLabelData;
  loadingMethod: LoadingMethodData;
  additionalRequest: AdditionalRequestData;
  documentId: string | null;

  // === 액션 ===
  // 스텝 관리
  setCurrentStep, nextStep, prevStep
  
  // Step1 액션
  setProductConfig, setProductCategories, setPackagingMaterials
  addSetComponent, removeSetComponent, updateSetComponent
  
  // Step2 액션 - 포장방법
  setPackagingMethod, addPackagingMethodImage
  
  // Step2 액션 - 착인
  generateMarkingForms, updateMarkingForm, updateMarkingComposition
  
  // Step2 액션 - 라벨
  generateLabelForms, updateLabelForm, updateCustomLabelItems
  
  // Step2 액션 - 적재/기타
  updateLoadingMethod, setAdditionalRequest
  
  // 전체 데이터
  getFullData, loadData, resetForm
}
```

### 4.2 영속성 (Persistence)

```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'packaging-spec-storage',  // localStorage 키
    partialize: (state) => ({        // 저장할 필드만 선택
      typeSelection, packagingMethod, markingForms,
      labelForms, paletteLabel, loadingMethod,
      additionalRequest, documentId
    }),
  }
)
```

- **자동 저장**: localStorage에 상태 자동 저장
- **복원**: 페이지 새로고침 시 이전 상태 복원
- **제외 항목**: `currentStep`은 저장하지 않음 (항상 Step 1에서 시작)

---

## 5. 컴포넌트 아키텍처

### 5.1 컴포넌트 계층도

```
App.tsx
├── StepIndicator (스텝 네비게이션)
│
├── Step1TypeSelection
│   ├── ProductConfigSelect
│   │   └── [Dropdown, RadioGroup, Checkbox, TextInput]
│   ├── ProductTypeSelect (단품/미품 전용)
│   │   └── [CheckboxGroup]
│   └── PackagingMaterialSelect
│       └── [Checkbox, TextInput] + 순서 숫자 배지
│
├── Step2ContentInput
│   ├── PackagingMethod
│   │   └── [TextArea, ImageUpload]
│   ├── MarkingSection
│   │   └── MarkingForm[] (동적)
│   │       └── MarkingCompositionForm
│   ├── LabelSection
│   │   ├── LabelForm[] (동적)
│   │   │   └── CustomLabelForm (조건부)
│   │   └── PaletteLabelForm
│   ├── LoadingMethod
│   │   └── [Dropdown, NumberInput]
│   └── AdditionalRequests
│       └── [TextArea, ImageUpload]
│
└── Step3Preview
    ├── PreviewSection (HTML 렌더링)
    └── 액션 버튼들
        └── [exportToPDF, exportToExcel, saveToJSON, loadFromJSON]
```

### 5.2 공통 컴포넌트 (components/common)

| 컴포넌트 | Props | 용도 |
|----------|-------|------|
| **FormSection** | title, children | 섹션 컨테이너 |
| **FormGroup** | label, required, helpText, children | 폼 필드 그룹 |
| **Dropdown** | options, value, onChange, showOtherInput | 드롭다운 + 기타 입력 |
| **Checkbox** | label, checked, onChange | 단일 체크박스 |
| **CheckboxGroup** | options, values, onChange, direction | 다중 체크박스 |
| **RadioGroup** | name, options, value, onChange | 라디오 버튼 그룹 |
| **TextInput** | value, onChange, suffix | 텍스트 입력 |
| **NumberInput** | value, onChange, suffix, min, max | 숫자 입력 |
| **TextArea** | value, onChange, rows | 멀티라인 텍스트 |
| **ImageUpload** | images, onAdd, onRemove, maxImages | 다중 이미지 업로드 |
| **SingleImageUpload** | image, onAdd, onRemove | 단일 이미지 업로드 |

---

## 6. 인증 및 라우팅

### 6.1 인증 흐름

```
사용자 접속
    │
    ▼
Google OAuth 로그인 (Supabase Auth)
    │
    ▼
2차 앱 인증 (username/password)
    │ - app_credentials 테이블에서 검증
    │ - sessionStorage에 인증 상태 저장
    │
    ▼
사용자 상태 확인
    ├── is_active: false → /pending (승인 대기)
    └── is_active: true  → / (폼 작성)
                          └── role: admin → /admin (관리자 접근 가능)
```

### 6.2 라우트 구조

| 경로 | 컴포넌트 | 접근 조건 |
|------|----------|-----------|
| `/login` | LoginPage | 비인증 사용자 |
| `/auth/callback` | AuthCallback | OAuth 콜백 |
| `/pending` | PendingPage | 인증됨 + 비활성 사용자 |
| `/` | SpecFormPage | 인증됨 + 앱인증 + 활성 사용자 |
| `/admin` | AdminPage | 인증됨 + 앱인증 + admin 역할 |

### 6.3 라우트 가드 (ProtectedRoute)

```
Routes
├── /login (공개)
├── /auth/callback (공개)
└── ProtectedRoute (로그인 필수)
    ├── /pending
    └── AppAuthRoute (2차 앱 인증 필수)
        └── ActiveUserRoute (is_active 필수)
            ├── / (폼 작성)
            └── AdminRoute (admin 역할 필수)
                └── /admin
```

### 6.4 데이터베이스 스키마 (Supabase)

| 테이블 | 용도 |
|--------|------|
| `users` | 사용자 프로필 (id, email, name, role, is_active) |
| `app_credentials` | 앱 접근 인증정보 (username, password) |
| `packaging_specifications` | 포장사양서 데이터 (JSON 필드로 폼 데이터 저장) |

---

## 7. 데이터 흐름

### 7.1 Step 1 → Step 2 전환 시

```
사용자가 "다음 단계" 클릭
    │
    ▼
유효성 검사 (isValid)
    │ - 제품 유형 선택 여부
    │ - 포장재 선택 여부
    │ - (세트) 구성품 이름 입력 여부
    │
    ▼
generateMarkingForms() 호출
    │ - productConfig에 따라 착인 폼 동적 생성
    │
    ▼
generateLabelForms() 호출
    │ - packagingMaterials에 따라 라벨 폼 동적 생성
    │
    ▼
nextStep() → currentStep = 2
```

### 7.2 내보내기 데이터 흐름

```
PDF 다운로드:
  getFullData() → html2pdf.js → 다운로드

JSON 저장:
  getFullData() → JSON.stringify → Blob → 다운로드

JSON 불러오기:
  File → FileReader → JSON.parse → loadData() → 상태 복원
```

---

## 8. 비즈니스 로직 상세

### 8.1 착인 구성 (MarkingComposition) 조건부 필드

```
착인 구성 체크박스:
├── 관리번호 체크 →
│   ├── 코스맥스 선택 → ABC / LOT ABC 형식 선택
│   └── 고객사 선택 → 텍스트 설명 입력
│
├── 사용기한 체크 →
│   └── 형식 선택 (YYYYMMDD까지 / EXP... / 기타)
│
├── 제조일자 체크 →
│   └── 형식 선택 (YYYYMMDD제조 / MFG... / 기타)
│
└── (사용기한 OR 제조일자 체크 시)
    ├── 사용기한 기준 (벌크제조일 / 포장일 / 충전일)
    └── 사용기한 개월수 (숫자 입력)
```

### 8.2 라벨 양식 조건부 렌더링

```
라벨 양식 선택:
├── 없음(부착필요X) → 추가 필드 숨김
├── 별도양식 → 이미지 업로드
├── WMS라벨 → 안내 문구만 표시
└── 직접입력 → CustomLabelForm 체크박스 표시
    ├── 제품명, 수량, 관리번호, 사용기한...
    ├── 바코드(이미지), 바코드(숫자)
    └── 기타 (중복 추가 가능)
```

---

## 9. 스타일링 시스템

### 9.1 Tailwind CSS 커스텀 클래스 (index.css)

```css
@layer components {
  .form-section { /* 섹션 카드 스타일 */ }
  .form-section-title { /* 섹션 제목 */ }
  .form-group { /* 폼 필드 그룹 */ }
  .form-label { /* 라벨 */ }
  .form-input { /* 텍스트 입력 */ }
  .form-select { /* 드롭다운 */ }
  .form-checkbox { /* 체크박스 */ }
  .form-radio { /* 라디오 버튼 */ }
  
  .btn { /* 기본 버튼 */ }
  .btn-primary { /* 파란색 버튼 */ }
  .btn-secondary { /* 회색 버튼 */ }
  .btn-success { /* 초록색 버튼 */ }
  .btn-danger { /* 빨간색 버튼 */ }
  
  .badge-blue { /* 파란 배지 */ }
  .badge-green { /* 초록 배지 */ }
  .badge-gray { /* 회색 배지 */ }
}
```

### 9.2 인쇄 스타일

```css
@media print {
  .no-print { display: none !important; }
  .form-section { break-inside: avoid; }
}
```

---

## 10. 주요 타입 정의 요약

### 10.1 Union Types (선택지)

| 타입명 | 값 | 용도 |
|--------|-----|------|
| ProductConfigType | single, unboxed, set | 제품 구성 |
| ProductCategory | basic, cushion, tube, ... | 제품 유형 |
| PackagingMaterialType | zipperBag, innerBox, ... | 포장재 |
| MarkingMethod | coding, engraving, other | 착인 방법 |
| MarkingPosition | bottom, back, other | 착인 위치 |
| LabelFormatType | none, separate, wms, custom | 라벨 양식 |
| PaletteType | kpp, aju, exportPlastic, ... | 팔레트 종류 |

### 10.2 DB 타입 (types/database.ts)

| 타입 | 용도 |
|------|------|
| UserRole | 'admin' \| 'user' |
| SpecStatus | 'draft' \| 'submitted' \| 'approved' |
| User | users 테이블 Row 타입 |
| PackagingSpecification | packaging_specifications 테이블 Row 타입 |
| AppCredential | app_credentials 테이블 Row 타입 |

### 10.3 라벨 상수 (LABELS)

모든 Union Type에는 대응하는 `*_LABELS` 상수가 있어 한글 표시에 사용:

```typescript
PRODUCT_CONFIG_LABELS['single'] // → '단품'
PRODUCT_CATEGORY_LABELS['basic'] // → '기초'
PACKAGING_MATERIAL_LABELS['zipperBag'] // → '지퍼백'
```

---

## 11. 확장 가이드

### 11.1 새로운 폼 필드 추가

1. `types/index.ts`에 타입 정의 추가
2. `store/formStore.ts`에 상태 및 액션 추가
3. 해당 Step 컴포넌트에 UI 추가
4. `PreviewSection.tsx`에 미리보기 추가
5. `exportUtils.ts`에 내보내기 로직 추가

### 11.2 새로운 내보내기 형식 추가

1. `utils/exportUtils.ts`에 함수 추가
2. `Step3/index.tsx`에 버튼 추가

### 11.3 새로운 선택 옵션 추가

1. `types/index.ts`의 Union Type에 값 추가
2. 대응하는 `*_LABELS` 상수에 라벨 추가

---

## 12. 파일별 코드 라인 수

| 파일 | 라인 수 | 역할 |
|------|---------|------|
| types/index.ts | ~417 | 폼 타입 정의 |
| types/database.ts | ~131 | DB 타입 정의 |
| store/formStore.ts | ~619 | 상태 관리 |
| utils/exportUtils.ts | ~200 | 내보내기 |
| App.tsx | ~153 | 메인 라우팅 |
| context/AuthContext.tsx | ~184 | 인증 컨텍스트 |
| **컴포넌트 총합** | ~3,900 | UI 렌더링 |
| **전체** | ~5,600+ | - |

---

## 13. 의존성 다이어그램

```
                    ┌─────────────────┐
                    │     App.tsx     │
                    │  (React Router) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
   │  auth/      │  │  pages/      │  │  SpecForm    │
   │  (Guard)    │  │  (Login,     │  │  (Step1~3)   │
   └──────┬──────┘  │   Admin...)  │  └──────┬───────┘
          │         └──────┬───────┘         │
          │                │                 │
          ▼                ▼                 ▼
   ┌─────────────────────────────────────────────┐
   │            AuthContext (useAuth)             │
   │         (Google OAuth + 앱 인증)              │
   └─────────────────────┬───────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌───────────────┐
   │ Supabase │   │ formStore│   │  exportUtils  │
   │ (DB/Auth)│   │ (Zustand)│   │  (PDF/JSON)   │
   └──────────┘   └────┬─────┘   └───────────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │  types/  │ │ persist  │ │ database │
     │ index.ts │ │(storage) │ │  types   │
     └──────────┘ └──────────┘ └──────────┘
```

---

*최종 업데이트: 2026-02-20*
*버전: 2.0.0*
