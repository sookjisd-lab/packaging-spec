# 신제품 포장사양서 작성 시스템

화장품 제조 업체에서 고객사에게 신제품 포장사양(포장방법, 착인, 박스표기방법 등)을 전달하기 위한 **포장사양서 작성 웹 애플리케이션**입니다.

## 주요 기능

- **3단계 마법사 형식** 포장사양서 작성 (유형 선택 → 내용 입력 → 미리보기)
- **유형별 동적 폼** 생성 (단품 / 미품 / 기획세트)
- **PDF 다운로드** (html2pdf.js 기반)
- **로컬 저장/불러오기** (JSON + localStorage 자동 저장)
- **Google OAuth 인증** + 2차 앱 인증 (Supabase Auth)
- **관리자 기능** (사용자 관리, 앱 접근 인증정보 설정)

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.2.0 |
| 언어 | TypeScript | 5.9.3 |
| 빌드 도구 | Vite | 7.2.4 |
| 상태관리 | Zustand | 5.0.10 |
| 스타일링 | Tailwind CSS | 4.1.18 |
| 라우팅 | React Router | 7.12.0 |
| 백엔드/인증 | Supabase | 2.90.1 |
| PDF 생성 | html2pdf.js | 0.14.0 |

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm
- Supabase CLI (로컬 개발 시)

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성합니다:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

### Supabase 로컬 개발

```bash
# Supabase 로컬 시작
npm run db:start

# 데이터베이스 마이그레이션 적용
npm run db:push

# 타입 생성
npm run db:generate-types

# Supabase 로컬 중지
npm run db:stop
```

## 프로젝트 구조

```
src/
├── main.tsx                     # 앱 진입점
├── App.tsx                      # 메인 라우팅
├── index.css                    # Tailwind CSS 설정
│
├── types/
│   ├── index.ts                 # 폼 관련 타입/인터페이스
│   └── database.ts              # Supabase DB 타입
│
├── store/
│   └── formStore.ts             # Zustand 스토어 (폼 상태 관리)
│
├── lib/
│   ├── supabase.ts              # Supabase 클라이언트
│   └── auth.ts                  # 인증 유틸리티
│
├── context/
│   └── AuthContext.tsx           # 인증 Context Provider
│
├── hooks/
│   ├── useAuth.ts               # 인증 훅
│   ├── useSpecifications.ts     # 사양서 데이터 훅
│   └── useUsers.ts              # 사용자 관리 훅
│
├── pages/
│   ├── LoginPage.tsx            # 로그인 페이지
│   ├── SecondaryLoginPage.tsx   # 2차 앱 인증 페이지
│   ├── PendingPage.tsx          # 승인 대기 페이지
│   └── AdminPage.tsx            # 관리자 페이지
│
├── utils/
│   └── exportUtils.ts           # PDF/JSON 내보내기
│
└── components/
    ├── common/                  # 재사용 공통 컴포넌트
    ├── auth/                    # 인증 관련 컴포넌트
    ├── admin/                   # 관리자 컴포넌트
    ├── Step1/                   # 유형 선택
    ├── Step2/                   # 내용 입력 (착인/라벨/포장방법)
    └── Step3/                   # 미리보기 & 출력
```

자세한 아키텍처는 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.
