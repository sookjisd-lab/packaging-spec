# 포장사양서 시스템 - Vercel + Supabase 배포 Spec

## 1. 프로젝트 개요

### 1.1 현재 상태 분석
| 항목 | 현재 상태 | 목표 상태 |
|------|----------|----------|
| 프론트엔드 | React 19 + Vite | Vercel 배포 |
| 데이터 저장 | localStorage (Zustand persist) | Supabase PostgreSQL |
| 인증 | 없음 | Google OAuth (Supabase Auth) |
| 사용자 관리 | 없음 | Admin/User 역할 시스템 |
| 백엔드 API | 없음 | Supabase (BaaS) |

### 1.2 기술 스택 (추가)
| 구분 | 기술 | 용도 |
|------|------|------|
| 호스팅 | Vercel | 프론트엔드 배포 |
| 데이터베이스 | Supabase PostgreSQL | 데이터 저장 |
| 인증 | Supabase Auth + Google OAuth | 사용자 인증 |
| 로컬 개발 | Supabase CLI | 로컬 DB 에뮬레이션 |

---

## 2. 데이터베이스 스키마

### 2.1 users 테이블 (Supabase Auth 확장)
```sql
-- Supabase Auth의 auth.users와 연동
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);
```

### 2.2 packaging_specifications 테이블
```sql
CREATE TABLE public.packaging_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 문서 메타데이터
  title TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  
  -- Step 1: 유형 선택 데이터 (JSONB)
  type_selection JSONB NOT NULL DEFAULT '{}',
  
  -- Step 2: 내용 입력 데이터 (JSONB)
  packaging_method JSONB DEFAULT '{}',
  marking_forms JSONB DEFAULT '[]',
  label_forms JSONB DEFAULT '[]',
  palette_label JSONB DEFAULT '{}',
  loading_method JSONB DEFAULT '{}',
  additional_request JSONB DEFAULT '{}',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_specs_user_id ON public.packaging_specifications(user_id);
CREATE INDEX idx_specs_status ON public.packaging_specifications(status);
CREATE INDEX idx_specs_created_at ON public.packaging_specifications(created_at DESC);
```

### 2.3 RLS (Row Level Security) 정책
```sql
-- users 테이블 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 정보만 수정 가능 (role, is_active 제외)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.users WHERE id = auth.uid())
  );

-- Admin은 모든 사용자 조회 가능
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Admin은 모든 사용자 수정 가능
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- packaging_specifications 테이블 RLS
ALTER TABLE public.packaging_specifications ENABLE ROW LEVEL SECURITY;

-- 활성화된 사용자만 자신의 문서 CRUD 가능
CREATE POLICY "Active users can manage own specs" ON public.packaging_specifications
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Admin은 모든 문서 조회 가능
CREATE POLICY "Admins can view all specs" ON public.packaging_specifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );
```

### 2.4 자동 사용자 생성 Trigger
```sql
-- 첫 번째 사용자는 자동으로 admin, 이후는 user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role TEXT;
  new_is_active BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- 첫 번째 사용자는 admin + 활성화
  IF user_count = 0 THEN
    new_role := 'admin';
    new_is_active := true;
  ELSE
    new_role := 'user';
    new_is_active := false;
  END IF;
  
  INSERT INTO public.users (id, email, name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    new_role,
    new_is_active
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth 사용자 생성 시 trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.5 updated_at 자동 업데이트 Trigger
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_specs_updated_at
  BEFORE UPDATE ON public.packaging_specifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## 3. 인증 시스템 설계

### 3.1 인증 흐름
```
┌──────────────────────────────────────────────────────────────────┐
│                         Login Flow                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 사용자 → "Google로 로그인" 버튼 클릭                          │
│          ↓                                                       │
│  2. Supabase Auth → Google OAuth 리다이렉트                       │
│          ↓                                                       │
│  3. Google 인증 → 콜백 URL로 리다이렉트                           │
│          ↓                                                       │
│  4. Supabase Auth Trigger → public.users 자동 생성               │
│          ↓                                                       │
│  5. 첫 번째 사용자? → role='admin', is_active=true               │
│     아니면? → role='user', is_active=false                       │
│          ↓                                                       │
│  6. is_active 확인                                               │
│     → true: 앱 접근 허용                                         │
│     → false: "계정 승인 대기" 안내                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 권한 체크 로직
```typescript
// 권한 레벨
type UserRole = 'admin' | 'user';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
}

// 접근 권한 체크
const canAccessApp = (user: User): boolean => user.is_active;
const canAccessAdminPage = (user: User): boolean => user.role === 'admin' && user.is_active;
```

---

## 4. 프론트엔드 구조 변경

### 4.1 새로운 디렉토리 구조
```
src/
├── main.tsx
├── App.tsx                 # 라우팅 추가
├── index.css
│
├── lib/                    # 신규: 유틸리티
│   ├── supabase.ts         # Supabase 클라이언트
│   └── auth.ts             # 인증 헬퍼 함수
│
├── hooks/                  # 신규: 커스텀 훅
│   ├── useAuth.ts          # 인증 상태 관리
│   ├── useUser.ts          # 사용자 정보 조회
│   └── useSpecifications.ts # 문서 CRUD 훅
│
├── context/                # 신규: Context
│   └── AuthContext.tsx     # 인증 컨텍스트
│
├── pages/                  # 신규: 페이지 컴포넌트
│   ├── LoginPage.tsx       # 로그인 페이지
│   ├── PendingPage.tsx     # 승인 대기 페이지
│   ├── AdminPage.tsx       # 관리자 페이지
│   └── SpecFormPage.tsx    # 기존 폼 (리네임)
│
├── components/
│   ├── common/
│   ├── Step1/
│   ├── Step2/
│   ├── Step3/
│   ├── auth/               # 신규: 인증 컴포넌트
│   │   ├── LoginButton.tsx
│   │   ├── LogoutButton.tsx
│   │   └── ProtectedRoute.tsx
│   └── admin/              # 신규: 관리자 컴포넌트
│       ├── UserList.tsx
│       ├── UserRow.tsx
│       └── RoleToggle.tsx
│
├── store/
│   ├── formStore.ts        # 수정: DB 연동 옵션
│   └── authStore.ts        # 신규: 인증 상태
│
├── types/
│   ├── index.ts
│   └── database.ts         # 신규: DB 타입 (Supabase 생성)
│
└── utils/
    └── exportUtils.ts
```

### 4.2 라우팅 구조
```typescript
// App.tsx 라우팅
<Routes>
  {/* 공개 라우트 */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  
  {/* 보호된 라우트 (로그인 필요) */}
  <Route element={<ProtectedRoute />}>
    {/* 승인 대기 사용자 */}
    <Route path="/pending" element={<PendingPage />} />
    
    {/* 활성 사용자만 접근 */}
    <Route element={<ActiveUserRoute />}>
      <Route path="/" element={<SpecFormPage />} />
      <Route path="/spec/:id" element={<SpecFormPage />} />
      
      {/* Admin 전용 */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
    </Route>
  </Route>
</Routes>
```

---

## 5. 관리자 페이지 설계

### 5.1 Admin 페이지 기능
| 기능 | 설명 | API |
|------|------|-----|
| 사용자 목록 조회 | 모든 사용자 리스트 표시 | `GET /users` |
| 계정 활성화 토글 | is_active 변경 | `PATCH /users/:id` |
| 권한 변경 | role 변경 (admin/user) | `PATCH /users/:id` |
| 사용자 검색 | 이메일/이름 검색 | 클라이언트 필터링 |

### 5.2 UI 컴포넌트 목업
```
┌─────────────────────────────────────────────────────────────┐
│  [← 돌아가기]                 사용자 관리                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  검색: [________________] [검색]                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 이메일              이름       역할    활성   작업   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ admin@example.com   홍길동    [Admin▼]  [ON]   -     │   │
│  │ user1@example.com   김철수    [User▼]   [OFF]  -     │   │
│  │ user2@example.com   이영희    [User▼]   [ON]   -     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  * 자기 자신의 역할/활성 상태는 변경 불가                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 환경 변수 설정

### 6.1 필요한 환경 변수
```bash
# .env.local (로컬 개발용)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJh...local-anon-key

# .env.production (Vercel 배포용)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...production-anon-key
```

### 6.2 Vercel 환경 변수 설정
```
Vercel Dashboard → Settings → Environment Variables

| Variable Name         | Value                          | Environment |
|-----------------------|--------------------------------|-------------|
| VITE_SUPABASE_URL     | https://xxxx.supabase.co      | Production  |
| VITE_SUPABASE_ANON_KEY| eyJh...production-key         | Production  |
```

---

## 7. 로컬 개발 환경

### 7.1 Supabase CLI 설정
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화 (최초 1회)
supabase init

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db push

# 로컬 Supabase 중지
supabase stop
```

### 7.2 로컬 vs 프로덕션 설정
```typescript
// lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경에 따라 자동으로 로컬/프로덕션 Supabase 사용
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 8. 마이그레이션 계획

### 8.1 기존 localStorage 데이터 처리
```typescript
// 로그인 후 localStorage 데이터 마이그레이션 옵션
const migrateLocalStorage = async (userId: string) => {
  const localData = localStorage.getItem('packaging-spec-storage');
  if (localData) {
    const parsed = JSON.parse(localData);
    // DB에 저장
    await supabase.from('packaging_specifications').insert({
      user_id: userId,
      title: '마이그레이션된 문서',
      ...parsed
    });
    // localStorage 클리어
    localStorage.removeItem('packaging-spec-storage');
  }
};
```

---

## 9. 구현 순서

### Phase 1: 기반 설정 (1일)
1. ✅ Spec 문서 작성
2. ⬜ Supabase 프로젝트 생성 & 설정
3. ⬜ DB 마이그레이션 파일 생성
4. ⬜ 환경 변수 설정
5. ⬜ Supabase 클라이언트 설정

### Phase 2: 인증 구현 (1일)
1. ⬜ Google OAuth 설정 (Supabase Console)
2. ⬜ AuthContext 및 useAuth 훅 구현
3. ⬜ 로그인/로그아웃 UI 구현
4. ⬜ ProtectedRoute 구현
5. ⬜ 승인 대기 페이지 구현

### Phase 3: 관리자 페이지 (1일)
1. ⬜ Admin 라우트 보호
2. ⬜ 사용자 목록 조회 구현
3. ⬜ 활성화 토글 구현
4. ⬜ 역할 변경 구현

### Phase 4: 데이터 연동 (1일)
1. ⬜ formStore DB 연동 확장
2. ⬜ 문서 CRUD 훅 구현
3. ⬜ localStorage 마이그레이션

### Phase 5: 배포 (1일)
1. ⬜ Vercel 프로젝트 설정
2. ⬜ 환경 변수 설정
3. ⬜ 빌드 & 배포 테스트

---

## 10. 추가 고려사항

### 10.1 보안
- Supabase RLS로 데이터 접근 제어
- Service Role Key는 서버에서만 사용 (클라이언트 노출 금지)
- 환경 변수는 VITE_ 접두사만 클라이언트에 노출

### 10.2 성능
- Supabase 실시간 구독은 필요 시에만 사용
- 이미지는 Supabase Storage 사용 고려

### 10.3 에러 핸들링
- 네트워크 오류 시 localStorage 폴백 검토
- 인증 만료 시 자동 리다이렉트

---

*문서 버전: 1.0.0*
*작성일: 2026-01-17*
