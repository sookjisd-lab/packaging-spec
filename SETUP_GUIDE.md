# Vercel + Supabase 설정 가이드

이 문서는 개발 경험이 없는 분들을 위한 **상세한 설정 가이드**입니다.  
화면 캡처를 보면서 따라하시면 됩니다.

---

## 목차

1. [사전 준비](#1-사전-준비)
2. [Supabase 프로젝트 생성](#2-supabase-프로젝트-생성)
3. [Google OAuth 설정](#3-google-oauth-설정)
4. [Supabase에 Google OAuth 연결](#4-supabase에-google-oauth-연결)
5. [데이터베이스 설정](#5-데이터베이스-설정)
6. [Vercel 배포](#6-vercel-배포)
7. [로컬 개발 환경 설정](#7-로컬-개발-환경-설정)
8. [문제 해결](#8-문제-해결)

---

## 1. 사전 준비

### 1.1 필요한 계정
다음 계정들을 미리 준비해주세요:

| 서비스 | 가입 URL | 용도 |
|--------|----------|------|
| **GitHub** | https://github.com/signup | 코드 저장소 |
| **Supabase** | https://supabase.com | 데이터베이스 + 인증 |
| **Vercel** | https://vercel.com/signup | 웹사이트 배포 |
| **Google Cloud** | https://console.cloud.google.com | Google 로그인 |

### 1.2 필요한 도구 (로컬 개발 시)
```bash
# Node.js 18 이상 설치 확인
node --version  # v18.x.x 이상이어야 함

# npm 설치 확인
npm --version
```

---

## 2. Supabase 프로젝트 생성

### Step 2.1: Supabase 대시보드 접속
1. https://supabase.com 에 접속
2. **Start your project** 또는 **Sign In** 클릭
3. GitHub 계정으로 로그인

### Step 2.2: 새 프로젝트 생성
1. 대시보드에서 **New Project** 클릭
2. 다음 정보 입력:

| 항목 | 입력값 | 설명 |
|------|--------|------|
| **Organization** | (기본값 또는 새로 생성) | 프로젝트 그룹 |
| **Name** | `packaging-spec` | 프로젝트 이름 |
| **Database Password** | (강력한 비밀번호) | **반드시 메모해두세요!** |
| **Region** | `Northeast Asia (Seoul)` | 한국 리전 선택 |
| **Pricing Plan** | Free | 무료 플랜 |

3. **Create new project** 클릭
4. 프로젝트 생성까지 약 2분 대기

### Step 2.3: 프로젝트 정보 복사
프로젝트 생성 후 **Settings > API** 페이지에서:

1. **Project URL** 복사 → 메모장에 저장
   ```
   예: https://abcdefghijk.supabase.co
   ```

2. **anon public** 키 복사 → 메모장에 저장
   ```
   예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> **주의**: `service_role` 키는 절대로 외부에 공개하지 마세요!

---

## 3. Google OAuth 설정

### Step 3.1: Google Cloud Console 접속
1. https://console.cloud.google.com 접속
2. Google 계정으로 로그인

### Step 3.2: 새 프로젝트 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. **새 프로젝트** 클릭
3. 프로젝트 이름: `packaging-spec-auth`
4. **만들기** 클릭

### Step 3.3: OAuth 동의 화면 설정
1. 좌측 메뉴에서 **APIs & Services > OAuth consent screen** 클릭
2. User Type: **외부** 선택 → **만들기**
3. 필수 정보 입력:

| 항목 | 입력값 |
|------|--------|
| 앱 이름 | 포장사양서 시스템 |
| 사용자 지원 이메일 | (본인 이메일) |
| 개발자 연락처 정보 | (본인 이메일) |

4. **저장 후 계속** 클릭
5. 범위(Scopes) 페이지: 그대로 **저장 후 계속**
6. 테스트 사용자: 그대로 **저장 후 계속**
7. 요약 확인 후 **대시보드로 돌아가기**

### Step 3.4: OAuth 클라이언트 ID 생성
1. **APIs & Services > Credentials** 클릭
2. **+ CREATE CREDENTIALS > OAuth client ID** 클릭
3. 다음 정보 입력:

| 항목 | 입력값 |
|------|--------|
| 애플리케이션 유형 | 웹 애플리케이션 |
| 이름 | Packaging Spec Web Client |
| 승인된 JavaScript 원본 | (아래 참조) |
| 승인된 리디렉션 URI | (아래 참조) |

**승인된 JavaScript 원본** (한 줄씩 추가):
```
https://your-project.supabase.co
http://localhost:5173
https://your-vercel-domain.vercel.app
```

**승인된 리디렉션 URI** (한 줄씩 추가):
```
https://your-project.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

> **참고**: `your-project.supabase.co`는 Step 2.3에서 복사한 Supabase URL에서 확인

4. **만들기** 클릭
5. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 → 메모장에 저장

---

## 4. Supabase에 Google OAuth 연결

### Step 4.1: Supabase Authentication 설정
1. Supabase 대시보드 → 프로젝트 선택
2. 좌측 메뉴 **Authentication > Providers** 클릭
3. **Google** 찾아서 클릭

### Step 4.2: Google Provider 활성화
1. **Enable Sign in with Google** 토글 ON
2. 다음 정보 입력:

| 항목 | 입력값 |
|------|--------|
| Client ID | (Step 3.4에서 복사한 클라이언트 ID) |
| Client Secret | (Step 3.4에서 복사한 클라이언트 보안 비밀번호) |

3. **Save** 클릭

### Step 4.3: Redirect URLs 확인
같은 페이지 하단의 **Redirect URLs** 섹션에서:
- `https://your-project.supabase.co/auth/v1/callback` 확인
- 이 URL이 Google Cloud Console의 리디렉션 URI와 일치하는지 확인

---

## 5. 데이터베이스 설정

### Step 5.1: SQL Editor 접속
1. Supabase 대시보드 → 좌측 메뉴 **SQL Editor** 클릭
2. **+ New query** 클릭

### Step 5.2: 테이블 생성 SQL 실행
다음 SQL을 복사하여 에디터에 붙여넣고 **Run** 클릭:

```sql
-- ===========================================
-- 1. users 테이블 생성
-- ===========================================
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

-- 인덱스 생성
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- ===========================================
-- 2. packaging_specifications 테이블 생성
-- ===========================================
CREATE TABLE public.packaging_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  type_selection JSONB NOT NULL DEFAULT '{}',
  packaging_method JSONB DEFAULT '{}',
  marking_forms JSONB DEFAULT '[]',
  label_forms JSONB DEFAULT '[]',
  palette_label JSONB DEFAULT '{}',
  loading_method JSONB DEFAULT '{}',
  additional_request JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_specs_user_id ON public.packaging_specifications(user_id);
CREATE INDEX idx_specs_status ON public.packaging_specifications(status);
CREATE INDEX idx_specs_created_at ON public.packaging_specifications(created_at DESC);

-- ===========================================
-- 3. RLS (Row Level Security) 활성화
-- ===========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_specifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. users 테이블 RLS 정책
-- ===========================================
-- 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필 수정 가능 (role, is_active 제외)
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

-- ===========================================
-- 5. packaging_specifications 테이블 RLS 정책
-- ===========================================
-- 활성화된 사용자만 자신의 문서 관리 가능
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

-- ===========================================
-- 6. 자동 사용자 생성 Trigger (첫 번째 사용자 = admin)
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role TEXT;
  new_is_active BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  
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

-- Trigger 연결
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 7. updated_at 자동 업데이트 Trigger
-- ===========================================
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

### Step 5.3: 실행 결과 확인
- "Success. No rows returned" 메시지가 나오면 성공
- 좌측 메뉴 **Table Editor**에서 `users`, `packaging_specifications` 테이블 확인

---

## 6. Vercel 배포

### Step 6.1: GitHub에 코드 업로드
1. GitHub에서 새 Repository 생성
2. 로컬에서 코드 푸시:
```bash
git remote add origin https://github.com/your-username/packaging-spec.git
git branch -M main
git push -u origin main
```

### Step 6.2: Vercel 프로젝트 생성
1. https://vercel.com 접속 & GitHub 계정으로 로그인
2. **Add New... > Project** 클릭
3. GitHub Repository 선택 (packaging-spec)
4. **Import** 클릭

### Step 6.3: 환경 변수 설정
Import 화면에서 **Environment Variables** 섹션:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | (Step 2.3에서 복사한 Project URL) |
| `VITE_SUPABASE_ANON_KEY` | (Step 2.3에서 복사한 anon public 키) |

### Step 6.4: 배포
1. **Deploy** 클릭
2. 빌드 완료까지 약 1-2분 대기
3. 배포 완료 후 생성된 URL 확인
   - 예: `https://packaging-spec-xxxx.vercel.app`

### Step 6.5: Google OAuth에 Vercel URL 추가
1. Google Cloud Console → **Credentials** 이동
2. 생성한 OAuth 클라이언트 ID 클릭
3. **승인된 JavaScript 원본**에 추가:
   ```
   https://packaging-spec-xxxx.vercel.app
   ```
4. **승인된 리디렉션 URI**에 추가:
   ```
   https://packaging-spec-xxxx.vercel.app/auth/callback
   ```
5. **저장**

---

## 7. 로컬 개발 환경 설정

### Step 7.1: Supabase CLI 설치
```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (모든 OS)
npm install -g supabase
```

### Step 7.2: 로컬 Supabase 초기화
```bash
# 프로젝트 폴더에서
cd packaging-spec

# Supabase 초기화 (최초 1회)
supabase init

# 로컬 Supabase 시작 (Docker 필요)
supabase start
```

시작 후 출력되는 정보 메모:
```
API URL: http://localhost:54321
anon key: eyJh...local-key
service_role key: eyJh...
```

### Step 7.3: 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJh...local-anon-key
```

### Step 7.4: 로컬 DB에 마이그레이션 적용
```bash
# 마이그레이션 파일을 로컬 DB에 적용
supabase db push
```

### Step 7.5: 개발 서버 시작
```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

### Step 7.6: 로컬 환경 종료
```bash
supabase stop
```

---

## 8. 문제 해결

### 8.1 "Invalid login credentials" 오류
- **원인**: Google OAuth 설정 불일치
- **해결**: 
  1. Google Cloud Console에서 리디렉션 URI 확인
  2. Supabase Callback URL과 일치하는지 확인

### 8.2 "Row Level Security" 오류
- **원인**: RLS 정책 미설정
- **해결**: Step 5.2의 SQL 다시 실행

### 8.3 빌드 실패 (Vercel)
- **원인**: 환경 변수 누락
- **해결**: Vercel Dashboard → Settings → Environment Variables 확인

### 8.4 "첫 번째 사용자가 admin이 아님"
- **원인**: Trigger 설정 전에 사용자 생성됨
- **해결**: 
  1. Supabase SQL Editor에서:
  ```sql
  UPDATE public.users SET role = 'admin', is_active = true WHERE email = 'your-email@gmail.com';
  ```

### 8.5 로컬 Supabase 시작 안 됨
- **원인**: Docker 미설치 또는 미실행
- **해결**: 
  1. Docker Desktop 설치 및 실행
  2. `supabase start` 재시도

---

## 체크리스트

배포 전 확인사항:

- [ ] Supabase 프로젝트 생성 완료
- [ ] Google OAuth 클라이언트 생성 완료
- [ ] Supabase에 Google Provider 연결 완료
- [ ] 데이터베이스 테이블 및 RLS 설정 완료
- [ ] Vercel 환경 변수 설정 완료
- [ ] 첫 번째 사용자로 로그인하여 admin 권한 확인
- [ ] 두 번째 사용자로 로그인하여 승인 대기 상태 확인

---

## 연락처

문제가 해결되지 않으면 다음을 확인하세요:
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)

---

*가이드 버전: 1.0.0*
*작성일: 2026-01-17*
