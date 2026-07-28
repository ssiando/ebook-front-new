# ebook 프로젝트

사내 관리자(어드민) 화면을 만드는 React + TypeScript 프로젝트입니다.

## 기술 스택

| 기술                                | 역할                  | 왜 사용하나요?                                         |
| ----------------------------------- | --------------------- | ------------------------------------------------------ |
| **React 19**                        | UI 라이브러리         | 컴포넌트 기반으로 UI를 조립합니다                      |
| **TypeScript 5.9**                  | 타입 시스템           | 코드 작성 시 오류를 미리 잡아줍니다                    |
| **Vite 8**                          | 빌드 도구             | 빠른 개발 서버와 빌드를 제공합니다                     |
| **Tailwind CSS 4**                  | 스타일링              | 클래스명으로 빠르게 디자인합니다                       |
| **Axios**                           | HTTP 클라이언트       | 모든 API 호출의 기본 — 인터셉터로 인증·로딩·에러 처리  |
| **TanStack React Query** (Optional) | 서버 데이터 캐싱      | 캐싱·재요청·동기화가 필요한 화면에서만 선택적으로 사용 |
| **Zustand**                         | 클라이언트 상태 관리  | 로그인 정보 같은 전역 상태를 관리합니다                |
| **react-hook-form + Zod**           | 폼 처리 + 유효성 검증 | 입력 폼을 쉽고 안전하게 만듭니다                       |
| **i18next**                         | 다국어                | 한국어/영어 등 다국어를 지원합니다                     |
| **Aggrid**                          | 그리드                | 데이터그리드 처리합니다.                               |
| **react-router-dom**                | 라우팅                | `pages/` 폴더 기반으로 라우트를 자동 등록합니다        |
| **lucide-react**                    | 아이콘                | 헤더/사이드바/탭바 등 UI 아이콘을 일관되게 사용합니다  |

## 폴더 구조

```
src/
├── api/              📡 axios 호출 함수 (도메인별 *-api.ts)
├── components/
│   ├── common/       🔧 공통 컴포넌트
│   │   ├── ui/       🧱 기본 UI (Button, Modal, Badge 등)
│   │   ├── form/     📝 RHF 연동 폼 (FormInput, FormSelect 등)
│   │   └── …         Pagination, LoadingOverlay 등
│   ├── layout/       🏗️ 앱 골격 (MainLayout 등 — 보통 @vanta/common 사용)
│   ├── auth/         🔐 AuthGuard, GuestGuard, Authorized
│   └── {도메인}/     🎯 화면 전용 조각 (예: user/list/)
├── pages/            📱 파일 기반 라우팅 — PascalCase.tsx → camelCase URL
├── query/            🔄 React Query 훅 (도메인별 *-query.ts, Optional)
├── store/biz/        🗄️ 업무 도메인 전용 Zustand (공통 store는 @vanta/common)
├── hooks/            🪝 전사 공통 훅 — 신규 추가 금지
├── lib/              📚 keycloak, axios, ag-grid 등 외부 라이브러리 설정
├── utils/            🛠️ 순수 유틸 (formUtils 등)
├── types/            📋 공통 타입
├── i18n/             🌐 다국어 (locales/{ko,en}/{대메뉴}.json)
├── providers/        🔌 앱 레벨 Provider
├── router/           🧭 pages/ 스캔 후 라우트 생성
└── data/             📁 정적 데이터 (menu.json 등)
```

| 폴더                      | 레스토랑 비유       | 실제 역할                                                              |
| ------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `pages/`                  | 메뉴판의 각 메뉴    | 사용자가 보는 각 화면                                                  |
| `components/common/ui/`   | 접시, 컵, 포크      | 어디서든 재사용하는 기본 UI 부품                                       |
| `components/common/form/` | 주문서 필드         | react-hook-form과 연결되는 입력 부품                                   |
| `components/도메인/화면/` | 메인 요리 플레이팅  | 특정 화면 전용 조립 컴포넌트                                           |
| `api/`                    | 주방과 홀 사이 통로 | 서버에서 데이터를 가져오는 통로                                        |
| `hooks/`                  | 회사 공용 도구함    | 전사 공통 훅(인증, 권한, 외부 클릭 감지 등). **신규 추가 금지 영역**   |
| `store/biz/`              | 부서 전용 냉장고    | 업무 도메인에서만 쓰는 클라이언트 상태 (공통 스토어는 `@vanta/common`) |
| `types/`                  | 식재료 규격서       | 데이터의 형태를 정의                                                   |

## 화면(리스트) 만드는 규격

모든 페이지는 **`PageTitle` → `PageSearch` → 본문**(그리드·폼 등) 순서로 조합합니다. 실제 예시는 `사용자 관리`(`src/pages/UserManagement.tsx`), `메뉴 관리`(`src/pages/MenuManagement.tsx`)를 참고하세요.

- **`PageTitle`** (`components/common/PageTitle.tsx`): 제목 영역 (즐겨찾기 ☆ / 설명 ⓘ / 액션 버튼 포함). `breadcrumb`을 생략하면 `data/menu.json`에서 현재 라우트의 상위 메뉴를 자동으로 찾아 표시합니다.
- **`PageSearch`** (`components/common/PageSearch.tsx`): 조회 영역. 내부에 화면 전용 검색 컴포넌트(`{도메인}Search`)를 넣습니다. 초기화 버튼을 기본 포함하며, 클릭 시 폼을 리셋하고 `onReset` 콜백을 호출합니다.
- **본문**: 그리드·페이지네이션 등은 화면 전용 `{도메인}Content` 컴포넌트(`components/{도메인}/{화면}/`)로 분리해 페이지를 얇게 유지합니다.
- 등록·상세처럼 조회 영역이 없는 화면은 `PageSearch`를 생략하고 본문에 폼을 바로 조합합니다.

```tsx
// src/pages/UserManagement.tsx → URL: /userManagement
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageSearch } from '@/components/common/PageSearch';
import { PageTitle } from '@/components/common/PageTitle';

import { UserContent } from '@/components/user/list/UserContent';
import { UserSearch } from '@/components/user/list/UserSearch';
import { useUsersQuery } from '@/query/user-query';
import { searchSchema } from '@/components/user/list/searchSchema';

export default function UserManagement() {
  const methods = useForm({ resolver: zodResolver(searchSchema), defaultValues: {/* ... */} });
  const [params, setParams] = useState(/* ... */);
  const { data, isFetching } = useUsersQuery(params);

  const handleSearch = methods.handleSubmit((values) => setParams((prev) => ({ ...prev, ...values, page: 1 })));

  return (
    <FormProvider {...methods}>
      {/* 1. 타이틀 영역 — breadcrumb, 즐겨찾기 등은 공통 컴포넌트에서 주입 */}
      <PageTitle title="사용자 목록" actionButtonsProps={{ onSearch: handleSearch, onRegister: () => setCreateOpen(true) }} />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={() => setParams(/* 초기값 */)}>
        <UserSearch />
      </PageSearch>

      {/* 3. 본문 — 그리드·페이지네이션은 화면 전용 컴포넌트로 분리 */}
      <UserContent data={data} isLoading={isFetching} /* ... */ />
    </FormProvider>
  );
}
```

레이어 연결: `types/*.ts` → `api/*-api.ts` (axios) → `query/*-query.ts` (React Query, optional) → `components/{도메인}/{화면}/*.tsx` (`{도메인}Search`, `{도메인}Content`, Ag-Grid, 폼) → `pages/*.tsx` (`PageTitle`+`PageSearch`+본문 조립).

## 폼 검증 가이드 (RHF + Zod)

입력값이 "허용되는지"는 **Zod 스키마**가 판단하고, **언제** 그 검사를 돌릴지는 **`handleSubmit`**이 담당합니다. RHF는 필드와 값을 연결만 해 줍니다.

```
1) 규칙을 코드로 적는다 (Zod 스키마)
      ↓
2) useForm({ resolver: zodResolver(schema) }) 로 연결
      ↓
3) 저장/전송에서 handleSubmit(성공 콜백, 실패 콜백) 호출 → 이때 검증 실행
      ↓
4) 성공: 콜백의 data로 API 호출 / 실패: 필드 하단 인라인 에러 + showFormErrors 토스트
```

### 패턴 A — `defineFormRules` + `validateForm` (기본값)

대부분의 검색 폼·등록 폼에서 사용합니다. 필드 규칙을 객체로 정의하면 `validateForm`이 Zod 스키마를 만들어 주고, 같은 규칙 객체의 `label`/`required`/`maxLength`를 `FormInput`/`FormSelect`에도 그대로 넘겨 **검증 조건과 UI 표시가 항상 일치**하게 합니다.

```ts
import { defineFormRules, validateForm } from '@/utils/formUtils';
import type { z } from 'zod';

export const createRoleRules = defineFormRules({
  roleName: { type: 'string', required: true, maxLength: 30, label: '역할명' },
  description: { type: 'string', maxLength: 100, label: '설명' },
});

export const createRoleSchema = validateForm(createRoleRules);
export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
```

```tsx
<FormInput name="roleName" label={createRoleRules.roleName.label} required />
```

```ts
const handleSubmit = methods.handleSubmit(
  async (values) => { await createRole.mutateAsync(values); },
  (errors) => showFormErrors(errors, createRoleRules), // 검증 실패 시 토스트로 요약 표시
);
```

- 지원 타입: `string`(required/email/maxLength/minLength) · `number`(min/max) · `boolean`(mustBeTrue)
- `label`/`messages`는 이 프로젝트에서는 **바로 표시할 한글 문자열**을 씁니다 (실제 사내 환경은 i18n 키를 넣고 `t()`로 번역).
- 예시: `components/menu/list/menuSearchSchema.ts`, `components/role/list/roleSearchSchema.ts`, `components/role/list/RoleCreateModal.tsx`

### 패턴 B — `z.object` 직접 작성 (표준 규칙을 벗어나는 경우)

enum select, 동적 필드, 커스텀 상호 검증 등 패턴 A의 규칙 모양(문자열/숫자/불리언)으로 표현할 수 없을 때 사용합니다.

```ts
// UserCreateModal — role이 enum이라 패턴 B 사용
const createUserSchema = z.object({
  userId: z.string().min(1, '사용자ID를 입력해 주세요'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
});
```

패턴 B에서도 `showFormErrors(errors, rules)`에 넘길 라벨만 담은 최소 `FormRules` 객체를 만들어 토스트 문구에 라벨을 붙일 수 있습니다 (`UserCreateModal.tsx`의 `errorLabels` 참고).

### 에러 표시

- **인라인**: `FormInput`/`FormSelect`가 `useFormContext().formState.errors`를 읽어 필드 바로 아래 표시 (자동).
- **토스트(팝업)**: `handleSubmit`의 두 번째 콜백에서 `showFormErrors(errors, rules)` 호출 → `useToastStore`에 쌓이고 `ToastHost`(모든 페이지 공통, `AppProviders`에 마운트)가 화면 우상단에 띄운 뒤 4초 후 자동으로 사라집니다.

### 제출 시점 · `<form>` 태그

이 프로젝트의 페이지들은 `<form>` 태그를 쓰지 않습니다 — `PageTitle`의 조회/등록 버튼은 `type="button"` + `onClick={handleSearch}`로 직접 `handleSubmit(...)`을 호출합니다. 네이티브 submit과 섞지 마세요.

## 라우팅 규칙

`src/router/index.tsx`가 `import.meta.glob('/src/pages/**/*.tsx')`로 `pages/` 폴더를 스캔해 라우트를 자동 생성합니다.

- `pages/Home.tsx` → `/`
- `pages/UserManagement.tsx` → `/userManagement`

새 화면을 추가할 때는 `pages/`에 PascalCase 파일만 추가하면 라우트가 자동으로 생깁니다. 별도로 라우트를 등록할 필요가 없습니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 참고

- `hooks/`, 전사 공통 `store`(로그인 정보 등), `PageTitle`/`PageSearch`, `defineFormRules`/`validateForm`/`showFormErrors`는 실제 사내 환경에서는 `@vanta/common` 패키지에서 제공됩니다. 이 저장소는 해당 패키지가 없는 독립 실행 환경이므로, 동일한 역할을 하는 최소 구현을 `src/store/useUiStore.ts`, `src/components/common/PageTitle.tsx`, `src/components/common/PageSearch.tsx`, `src/utils/formUtils.ts`(+ 토스트 표시용 `src/store/useToastStore.ts`, `src/components/common/ui/ToastHost.tsx`)에 로컬로 두었습니다. 사내 배포 시 `@vanta/common`으로 교체하세요.
- `src/api/user-api.ts`는 백엔드가 없는 상태에서 화면을 확인할 수 있도록 목데이터(mock)를 사용합니다. 실제 API 연동 시 목데이터 분기를 제거하세요.
