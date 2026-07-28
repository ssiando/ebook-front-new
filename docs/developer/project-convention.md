# Project Convention

> 2026-04 기준 `vanta-admin-front`의 실제 디렉터리 구조와 구현 패턴을 바탕으로 정리한 프로젝트 컨벤션.
> 새 코드를 추가할 때는 이 문서를 기본 기준으로 삼고, 레거시 구조와 공존해야 하는 경우에는 [§6.2 레거시와 공존](#62-레거시와-공존)을 따른다.

## 목차

- [1. 개요](#1-개요)
  - [1.1 이 문서의 역할](#11-이-문서의-역할)
  - [1.2 CLAUDE.md와의 관계](#12-claudemd와의-관계)
- [2. 오리엔테이션](#2-오리엔테이션)
  - [2.1 기본 원칙](#21-기본-원칙)
  - [2.2 디렉터리 구조](#22-디렉터리-구조)
  - [2.3 레이어별 책임](#23-레이어별-책임)
- [3. 배치 규칙](#3-배치-규칙)
  - [3.1 pages](#31-pages)
  - [3.2 components](#32-components)
  - [3.3 api / query](#33-api--query)
  - [3.4 hooks](#34-hooks)
  - [3.5 store](#35-store)
  - [3.6 types / utils](#36-types--utils)
- [4. 코드 규칙](#4-코드-규칙)
  - [4.1 파일 네이밍](#41-파일-네이밍)
  - [4.2 import / export](#42-import--export)
  - [4.3 라우팅](#43-라우팅)
- [5. 레이어 세부 규칙](#5-레이어-세부-규칙)
  - [5.1 API / Query 패턴](#51-api--query-패턴)
  - [5.2 컴포넌트와 화면 구성](#52-컴포넌트와-화면-구성)
  - [5.3 상태 관리](#53-상태-관리)
  - [5.4 인증과 권한](#54-인증과-권한)
  - [5.5 i18n](#55-i18n)
  - [5.6 테스트](#56-테스트)
- [6. 운영](#6-운영)
  - [6.1 새 기능 체크리스트](#61-새-기능-체크리스트)
  - [6.2 레거시와 공존](#62-레거시와-공존)

---

## 1. 개요

### 1.1 이 문서의 역할

이 문서는 **"어디에 무엇을 두는가 / 왜 그렇게 나누는가"** 를 다루는 **구조·배치 기준 문서**다. 레이어 분리, 파일 배치, 네이밍, import 정책 등 구조적 결정의 근거를 제공한다.

### 1.2 CLAUDE.md와의 관계

**구체적인 사용법과 실전 예제**는 저장소 루트의 `CLAUDE.md`를 본다.

| 이 문서(project-convention.md) | CLAUDE.md                      |
| ------------------------------ | ------------------------------ |
| 디렉터리 / 레이어 구조         | 기술 스택 개요                 |
| 파일 배치와 네이밍 규칙        | Tailwind 테마 토큰             |
| 레이어별 책임 경계             | DB 감사 컬럼 매핑              |
| 공존 규칙과 마이그레이션 방향  | DataGrid / 폼 / 팝업 실전 예제 |
|                                | 빌드·테스트 스크립트           |

두 문서가 충돌하면 **구조는 이 문서, 구현 디테일은 CLAUDE.md**를 우선한다.

---

## 2. 오리엔테이션

### 2.1 기본 원칙

- `src/` 아래는 **역할 기준 레이어 분리**를 우선한다.
- 서버 통신과 캐시는 `api/` + `query/`에서 관리하고, 화면 컴포넌트는 이를 조합해 사용한다.
- 서버 응답 자체를 Zustand에 중복 저장하지 않는다. 전역 **클라이언트** 상태만 `store/biz/`에 둔다 (공통 스토어는 `@vanta/common` 제공).
- 공통 UI는 `components/common/`에, 도메인 전용 조합 컴포넌트는 `components/{domain}/`에 둔다.
- 페이지는 `src/pages/`에 두고 **기본 export**를 사용한다.
- 경로는 상대 경로보다 `@/` 별칭을 우선한다.

### 2.2 디렉터리 구조

```text
src/
├── api/          HTTP 호출과 API 모듈, 요청/응답 타입
├── components/   공통 UI, 레이아웃, 도메인 조합 컴포넌트
├── data/         정적 데이터
├── hooks/        재사용 훅과 훅 팩토리
├── i18n/         다국어 초기화와 locale 리소스
├── lib/          keycloak 등 외부 라이브러리 설정 (HTTP·에러처리는 @vanta/common 제공)
├── pages/        파일 기반 라우팅 대상 페이지
├── providers/    앱 레벨 provider
├── query/        React Query 훅, query key, invalidate 함수
├── routes/       라우트 조합과 예외 라우트(Login, popup 등)
├── store/biz/    Zustand 업무 도메인 전용 스토어 (공통 스토어는 @vanta/common)
├── test/         테스트 공통 설정
├── types/        공통 타입과 도메인 타입
└── utils/        순수 유틸 함수
```

### 2.3 레이어별 책임

**이 표가 레이어 책임의 정본(正本)**이다. 이하 다른 섹션에서 충돌이 있다면 이 표를 우선한다.

| 레이어        | 책임                                                                    | 넣지 말아야 할 것                                 |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| `pages/`      | 화면 진입점, 화면 상태 조합, 라우트 연결                                | 저수준 API 호출 구현, 재사용 UI                   |
| `components/` | UI 표현, 화면 조각, 레이아웃                                            | 전역 서버 캐시 책임                               |
| `api/`        | HTTP 요청/응답 매핑, 요청 DTO                                           | React 훅, JSX                                     |
| `query/`      | `useQuery`, query key, invalidate 함수                                  | JSX 렌더링, HTTP 호출 상세                        |
| `hooks/`      | 재사용 가능한 UI 훅, 훅 팩토리                                          | 특정 화면 전용 로직                               |
| `store/biz/`  | 업무 도메인 전용 클라이언트 상태 (공통 스토어는 `@vanta/common`)        | 서버 목록/상세 데이터 캐시, 공통 스토어 중복 정의 |
| `lib/`        | keycloak 등 로컬 외부 라이브러리 설정 (HTTP·에러처리는 `@vanta/common`) | 화면별 비즈니스 로직                              |
| `utils/`      | 프레임워크 비의존 순수 함수                                             | React 의존 로직                                   |

---

## 3. 배치 규칙

### 3.1 pages

- `src/pages/`는 `vite-plugin-pages` 기반 파일 라우팅 진입점이다.
- 페이지 파일은 `PascalCase.tsx`를 사용하고 **기본 export**를 둔다.
- 루트 페이지는 `src/pages/index.tsx`를 사용한다.
- `src/pages/popup/**`와 `Login.tsx`는 자동 라우팅에서 제외되고 `src/routes/`에서 별도 조합한다.

**URL 변환 규칙**

- 파일명의 **첫 글자만 소문자**로 바뀌고, 내부 복합어는 그대로 유지된다.

| 파일 경로                                        | URL                                 |
| ------------------------------------------------ | ----------------------------------- |
| `src/pages/Users.tsx`                            | `/users`                            |
| `src/pages/admin/Service.tsx`                    | `/admin/service`                    |
| `src/pages/system/Code.tsx`                      | `/system/code`                      |
| `src/pages/samples/dataGrid/SampleDataGrid1.tsx` | `/samples/dataGrid/sampleDataGrid1` |

### 3.2 components

```
components/
├── common/      재사용 UI (ui/, form/, data-grid/, tui/)
├── layout/      앱 골격 (MainLayout, Sidebar, Header, TabBar)
├── auth/        인증/권한 컴포넌트 (AuthGuard, GuestGuard, Authorized)
└── {domain}/    화면 전용 조합 컴포넌트
    └── {screen}/
```

- 특정 화면 전용 조합 컴포넌트는 `src/components/{domain}/{screen}/` 아래에 둔다.
  - 예: [src/components/system/code/](src/components/system/code/), [src/components/system/label/](src/components/system/label/)
- 화면 전용 상수·타입도 같은 폴더에 `constants.ts`, `types.ts`로 둔다.
- 공통 UI 묶음은 소비 편의를 위해 `index.ts` 배럴 export를 허용한다.
  - 예: [src/components/common/ui/index.ts](src/components/common/ui/index.ts)

### 3.3 api / query

- API 함수는 `src/api/`에 두고 파일명은 `*-api.ts`를 사용한다.
- 서버 상태 훅은 `src/query/`에 두고 파일명은 `*-query.ts`를 사용한다.
- 도메인이 깊은 경우 `src/api/{domain}/` 하위 폴더를 허용한다.
  - 예: [src/api/system/code-api.ts](src/api/system/code-api.ts)
- 상세 코드 패턴은 [§5.1 API / Query 패턴](#51-api--query-패턴)을 본다.

### 3.4 hooks

- `src/hooks/`는 **재사용** UI 훅과 훅 팩토리를 둔다.
- 파일명은 `use-*.ts` 또는 `create-*-hooks.ts` 같은 역할형 kebab-case를 사용한다.
- **특정 화면에 강하게 종속된** 훅은 전역 `hooks/`보다 해당 화면 폴더(`components/{domain}/{screen}/`)에 두는 편을 우선한다.
  - 판단 기준: 그 훅을 다른 화면에서 재사용할 여지가 있는가? 없다면 화면 옆에.

### 3.5 store

Zustand 스토어는 두 갈래로 나뉜다.

**공통 스토어 — `@vanta/common`이 제공**

- 인증·로딩·메뉴·탭·팝업·공통코드처럼 모든 프로젝트가 동일하게 쓰는 스토어는 `@vanta/common`에서 가져온다 (`useAuthStore`, `useLoadingStore`, `useProgramStore`, `useTabStore`, `usePopupStore`, `useCodeStore`).
- 로컬 `src/store/`에 같은 종류의 스토어를 새로 만들지 않는다.
- 사용법은 [`docs/developer/common-feature-developer-guide.md`](common-feature-developer-guide.md)를 참고한다.

**업무용 스토어 — `src/store/biz/`**

- 특정 업무 도메인에서만 공유하는 클라이언트 상태는 [src/store/biz/](src/store/biz/)에 `*-store.ts` 파일로 둔다.
  - 예: [src/store/biz/sample-store.ts](src/store/biz/sample-store.ts)
- 화면 간 공유가 필요한 클라이언트 상태(선택, 토글, 임시 필터 등)만 둔다. 서버 데이터는 React Query가 캐시하므로 중복 저장하지 않는다.
- 자세한 사용 기준은 [§5.3 상태 관리](#53-상태-관리)를 본다.

### 3.6 types / utils

**types**

- API 응답 타입은 가능하면 도메인 가까이에 둔다.
  - 예: [src/api/types/service.ts](src/api/types/service.ts), [src/api/types/system/code.ts](src/api/types/system/code.ts)
- 여러 레이어에서 공통으로 쓰는 루트 타입만 `src/types/`에 둔다.

**utils**

- 프레임워크 비의존 순수 함수를 둔다.
- 도메인 성격이 뚜렷하면 하위 폴더로 모은다.
  - 예: [src/utils/common/](src/utils/common/), [src/utils/system/](src/utils/system/)
- 파일명은 현재 `{domain}Util.ts` / `{noun}.ts` 관례가 혼재한다. 기존 폴더의 관례를 따른다.

---

## 4. 코드 규칙

### 4.1 파일 네이밍

| 대상            | 규칙                                 | 예시                                   |
| --------------- | ------------------------------------ | -------------------------------------- |
| 페이지 컴포넌트 | `PascalCase.tsx` 또는 `index.tsx`    | `Users.tsx`, `Code.tsx`                |
| 일반 컴포넌트   | `PascalCase.tsx`                     | `Button.tsx`, `PageTitle.tsx`          |
| 훅              | `use-*.ts`                           | `use-auth.ts`, `use-menu-actions.ts`   |
| 훅 팩토리       | `create-*-hooks.ts`                  | `create-query-hooks.ts`                |
| API             | `*-api.ts`                           | `service-api.ts`, `system/code-api.ts` |
| Query           | `*-query.ts`                         | `service-query.ts`, `label-query.ts`   |
| Store           | `*-store.ts` (`src/store/biz/` 하위) | `sample-store.ts`                      |
| 유틸            | 기존 폴더 관례 유지                  | `dateUtil.ts`, `menuPath.ts`           |
| 테스트          | `*.test.ts(x)`                       | `ErrorBoundary.test.tsx`               |
| 테스트 폴더     | `__tests__`                          | `src/components/common/__tests__/`     |

**심볼 네이밍**

| 대상                         | 규칙                           | 예시                               |
| ---------------------------- | ------------------------------ | ---------------------------------- |
| 컴포넌트 / 타입 / 인터페이스 | `PascalCase`                   | `Button`, `ApiResponse`            |
| 함수 / 변수 / 훅             | `camelCase`                    | `fetchServices`, `useServiceQuery` |
| 상수                         | `UPPER_SNAKE_CASE`             | `MAX_PAGE_SIZE`                    |
| query key 묶음               | `{domain}QueryKeys`            | `serviceQueryKeys`                 |
| invalidate 함수              | `useInvalidate{Domain}Queries` | `useInvalidateServiceQueries`      |

### 4.2 import / export

- `@/` 경로 별칭을 기본으로 사용한다. 상대 경로는 같은 폴더 형제 파일 정도로 제한한다.
- import 정렬은 ESLint `simple-import-sort`를 따른다 (자동 정렬).
- **페이지 컴포넌트는 기본 export**, 그 외(API, query, util, 상수, 일반 컴포넌트)는 **named export**를 기본으로 한다.
- 공통 UI 묶음처럼 소비 편의가 중요한 경우에만 `index.ts` 배럴 export를 둔다.

```ts
import { Button } from '@/components/common/ui';
import { useServiceQuery } from '@/query/service-query';
import { fetchServices } from '@/api/service-api';
```

### 4.3 라우팅

- 앱 메인 라우트는 `src/pages/**` 파일 구조로 자동 생성된다.
- 인증/비인증 가드는 [src/routes/index.tsx](src/routes/index.tsx)에서 조합한다.
- `MainLayout` 내부 라우트 재사용은 [src/routes/main-layout-outlet.ts](src/routes/main-layout-outlet.ts)를 기준으로 한다.
- 팝업 전용 라우트는 [src/routes/popup-window.ts](src/routes/popup-window.ts)에서 관리한다.
- `Login`은 자동 라우트에 넣지 않고 `GuestGuard` 경로로 별도 조합한다.
- 가드 사용 기준은 [§5.4 인증과 권한](#54-인증과-권한)을 본다.

---

## 5. 레이어 세부 규칙

### 5.1 API / Query 패턴

**권장 흐름**

1. `src/api/...-api.ts`에서 HTTP 함수 작성
2. `src/query/...-query.ts`에서 query key와 `useQuery` 작성
3. 페이지/컴포넌트에서 query 훅 사용
4. 저장/삭제 후 `useInvalidate...Queries()`로 갱신

#### API 레이어 규칙

- axios 인스턴스는 [src/api/http-client.ts](src/api/http-client.ts)의 `http`를 사용한다.
- API 함수는 가능하면 `ApiResponse<T>`에서 `data.data`까지 풀어서 반환한다.
- 로딩 스킵(`X-Skip-Loading: 'true'`)과 같은 공통 헤더 처리는 API 레이어에서 한다.
- 에러는 `ApiError`로 변환되어 throw된다 (status, code, data 포함).

**정석 형태 — `src/api/service-api.ts`**

```ts
import { http } from '@/api/http-client';
import type { ServiceResponse } from '@/api/types/service';
import type { ApiResponse, PaginatedResponse } from '@/types';

export async function fetchServices(
  workspaceId: string,
  params?: { page?: number; size?: number },
) {
  const { data } = await http.get<ApiResponse<PaginatedResponse<ServiceResponse>>>(
    `/api/workspaces/${workspaceId}/services`,
    { params },
  );
  return data.data;
}
```

#### Query 레이어 규칙

- query key는 파일 상단 `const` 객체로 모아 **명시적으로 관리**한다.
- query key는 문자열 하나보다 **배열 기반**으로 세분화한다.
- invalidate 함수는 같은 query 파일에 함께 둔다.
- 서버 캐시는 React Query가 담당하고, 동일 데이터를 store에 다시 넣지 않는다.

**정석 형태 — `src/query/service-query.ts`**

```ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchServices } from '@/api/service-api';

export const serviceQueryKeys = {
  all: ['services'] as const,
  list: (workspaceId: string, params: Record<string, unknown>) =>
    [...serviceQueryKeys.all, workspaceId, params] as const,
};

export function useServiceQuery(workspaceId: string, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: serviceQueryKeys.list(workspaceId, params ?? {}),
    queryFn: () => fetchServices(workspaceId, params),
    enabled: !!workspaceId,
  });
}

export function useInvalidateServiceQueries() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: serviceQueryKeys.all });
}
```

#### query key 권장 / 비권장

| 권장                                       | 비권장                                               |
| ------------------------------------------ | ---------------------------------------------------- |
| `['services', workspaceId, params]`        | `'services'` 단일 문자열                             |
| 파일 상단 `serviceQueryKeys` 객체로 집중화 | 호출부마다 queryKey 리터럴 중복                      |
| invalidate 함수는 query 파일에             | 페이지에서 `queryClient.invalidateQueries` 직접 호출 |

#### 패턴 선택 기준

| 상황                                      | 권장 패턴                                |
| ----------------------------------------- | ---------------------------------------- |
| 표준 CRUD 리소스                          | `createCrudService` + `createQueryHooks` |
| 복합 조건, 중첩 리소스, 커스텀 invalidate | 명시적 `*-api.ts` + `*-query.ts`         |

> **신규 화면은 가능하면 명시적 `*-query.ts` 패턴을 우선**한다. 팩토리는 단순 CRUD만 남긴다.

#### 페이지네이션

- 백엔드 `PageResponse`의 `page`는 **0-base**다.
- [src/components/common/Pagination](src/components/common/) 컴포넌트에 `pageResponse`를 그대로 전달한다.
- `onPageChange`도 0-base 페이지 번호로 전달한다.

### 5.2 컴포넌트와 화면 구성

**원칙**

- 페이지는 **상태 조합과 이벤트 오케스트레이션**에 집중한다. UI 덩어리는 도메인 컴포넌트로 분리한다.
- 검색 폼, 그리드, 소개 영역처럼 의미 있는 화면 조각은 `components/{domain}/{screen}/` 아래로 뺀다.
- 공통 UI는 `components/common/ui`, 폼 필드는 `components/common/form`에 둔다.
- 레이아웃 전역 요소는 `components/layout/`에서 관리한다.

**그리드 선택**

- **신규 구현**: [src/components/common/data-grid/](src/components/common/data-grid/) (TanStack Table 기반)
- **레거시**: [src/components/common/tui/](src/components/common/tui/), `CrudGridPage.tsx` — 유지보수만, 점진적 교체 대상
- TUI Grid 기반 화면을 수정할 때는 전체 교체보다 **해당 화면 문맥을 먼저 확인**한다.
- DataGrid 사용 예제는 CLAUDE.md의 "DataGrid" 섹션을 참고.

**팝업 / 알림**

- 모달, 얼럿, 컨펌은 `@vanta/common`의 `messageUtil` 또는 `usePopupStore`를 사용한다 (전역 상태).
- 토스트는 `react-hot-toast`의 `toast()`를 사용한다.
- 실전 예제는 [`docs/developer/common-feature-developer-guide.md`](common-feature-developer-guide.md)의 messageUtil 섹션 참고.

**Tailwind / 테마 토큰**

- **반드시 테마 토큰을 사용**한다 (raw hex 금지).
- 토큰 정의: [src/index.css](src/index.css), 프리미티브/시맨틱은 `src/assets/styles/tokens/`.
- 사용 가능한 클래스 목록: CLAUDE.md의 "Tailwind 테마 토큰" 섹션 참고.

**테마(라이트/다크) — 토큰화 규칙**

라이트/다크는 `document.documentElement` 의 `data-theme="light|dark"` 로 전환한다. 모든 UI 가 테마를
따라가려면 **색을 하드코딩하지 말고 토큰을 참조**해야 한다. 새 화면/컴포넌트 작성 시 아래를 지킨다.

- **하드코딩 색 금지**: `bg-white`, `text-gray-700`, `#fff`, `rgba(0,0,0,…)`, `bg-[#f5f5f7]` 등을 직접 쓰지 않는다.
  | 쓰지 말 것 | 대신 쓸 것 |
  |---|---|
  | `bg-white`, `#fff` | `bg-bg-white` / `var(--bg-white)` |
  | `bg-gray-50/100` | `bg-bg` / `var(--bg)` |
  | `text-gray-400/500/600` | `text-text` / `var(--text)` |
  | `text-gray-700/800`, `#1d1d1f` | `text-text-heading` / `var(--text-heading)` |
  | `border-gray-*`, `rgba(0,0,0,0.1)` 테두리 | `border-border` / `var(--border)` |
  | 옅은 회색 muted 텍스트 `rgba(0,0,0,0.x)` | `var(--text-muted)` |
  | 선택/활성 배경 라이트블루 | `var(--accent-light)` (다크 자동 전환) |
- **테마 전환의 단일 출처**: 컴포넌트는 토큰만 참조하고, 다크 값은 [src/index.css](src/index.css) 의
  `:root[data-theme='dark']` 블록에서 토큰을 override 한다. (시맨틱 토큰 + 별칭 + 회색 프리미티브 반전)
- **컴포넌트 CSS 도 동일**: `.css` 파일에서도 `var(--bg-white)`, `var(--text)`, `var(--border)` 등 토큰을 쓴다.
  하드코딩이 불가피한 다크 전용 보정은 `:root[data-theme='dark'] <selector>` 스코프 안에서만 한다(`!important` 지양).
- **DataGrid**: 자체 토큰 `--dg-*`(`--dg-surface/text/border/bg-white/accent` 등)을 쓴다. 다크는 토큰 override 로 처리된다.
- **차트(echarts)**: 공통 `Chart` 컴포넌트가 다크에서 title/축/legend/툴팁 색을 자동 보정한다. 차트 옵션에 축/제목 색을 하드코딩하지 않는다.
- **portal 요소**(toast/툴팁/팝오버)도 `documentElement` 속성을 상속하므로 토큰만 쓰면 자동 적용된다.
- 배경/근거와 이관 계획은 [`docs/todo/theme-dark-mode-migration.md`](../todo/theme-dark-mode-migration.md) 참고
  (현재 admin 구현 + `@vanta/common` 이관 TODO).

### 5.3 상태 관리

**React Query**: 서버 목록, 상세, 페이지네이션, invalidate.

**Zustand**: 인증 정보, 메뉴 트리, 탭, 로딩 오버레이, 팝업처럼 **모든 프로젝트가 공유하는 전역 UI 상태**는 `@vanta/common`이 제공하는 공통 스토어를 그대로 사용한다 (자세한 사용법은 [`docs/developer/common-feature-developer-guide.md`](common-feature-developer-guide.md) 참고). 업무 도메인에서만 공유하는 클라이언트 상태는 `src/store/biz/*-store.ts`에 둔다.

**로컬 state**: 폼 입력, 선택된 탭, 임시 필터 값처럼 화면 내부에서만 쓰는 값.

**선택 기준**

| 값의 성격                                                     | 둘 곳                                |
| ------------------------------------------------------------- | ------------------------------------ |
| 서버에서 가져오는 목록/상세                                   | React Query                          |
| 여러 화면이 공유하는 세션/UI 상태 (인증·로딩·탭·팝업·코드 등) | `@vanta/common` 공통 스토어          |
| 업무 도메인 화면 간 공유하는 클라이언트 상태                  | Zustand (`src/store/biz/*-store.ts`) |
| 화면 하나 안에서만 쓰는 값                                    | `useState` / `useReducer`            |
| 폼 입력                                                       | `react-hook-form`                    |

**로딩 처리**

- 기본적으로 axios 인터셉터가 API 호출 시 로딩 오버레이를 자동 표시한다.
- 특정 요청에서 글로벌 로딩을 건너뛰려면 요청 헤더에 `X-Skip-Loading: 'true'`를 추가한다.
- 컴포넌트 단위 로딩은 React Query `isLoading`을 사용한다.

### 5.4 인증과 권한

- 인증 방식: **Keycloak(SSO) + 로컬 로그인** 혼용, `authMethod`로 구분.
- 가드 컴포넌트는 [src/components/auth/](src/components/auth/)에 있다.

| 가드         | 용도                                              |
| ------------ | ------------------------------------------------- |
| `AuthGuard`  | 미로그인 시 `/login`으로 리다이렉트               |
| `GuestGuard` | 로그인 상태면 `/`로 리다이렉트 (로그인 페이지 등) |
| `Authorized` | 특정 권한이 있는 사용자에게만 렌더링              |

- 역할: `viewer`, `manager`, `admin`
- `useAuth()`로 현재 사용자, 토큰, `authMethod`, `login/logout`에 접근한다.
- 로그아웃 시 `authMethod === 'KEYCLOAK'`이면 `keycloak.logout()`을 호출하고, 아니면 `/login`으로 navigate한다.

### 5.5 i18n

- 사용자 노출 문구는 **반드시 `t('...')`** 를 통해 관리한다 (auto-import).
- locale 리소스는 [src/i18n/locales/](src/i18n/locales/) 아래에 **대메뉴별 파일로 분리**해 둔다.
  - 구조: `src/i18n/locales/{ko,en}/{대메뉴}.json` (예: `ko/common.json`, `ko/system.json`, `ko/monitoring.json`).
  - `src/i18n/index.ts`가 `import.meta.glob` 으로 자동 로드하므로 새 파일을 추가하면 init 코드 수정 없이 인식된다.
- 새 기능 추가 시 ko/en 양쪽에 **모두** 번역을 추가한다.
- 키 구분자는 `.`을 사용하고 **3-depth 권장** (예: `common.confirm`, `system.code.title`, `validation.required`).
- 우선순위: **로컬 JSON > DB 캐시**. `LabelI18nSync`가 `addResourceBundle(..., overwrite=false)`로 호출하므로 JSON에 있는 키는 DB 값으로 덮이지 않는다. 운영 중 문구 변경은 JSON 수정 후 재배포가 원칙.
- 인증 전 화면(로그인, 에러 페이지 등) 키는 반드시 로컬 JSON에 포함되어야 한다 (DB 캐시는 인증 후 로드).
- 샘플/임시 화면이 아니라면 하드코딩 문구를 두지 않는다.

### 5.6 테스트

- 테스트는 대상 파일 근처 `__tests__/`에 둔다.
- 파일명은 `*.test.ts` 또는 `*.test.tsx`를 사용한다.
- 공통 테스트 초기화는 [src/test/setup.ts](src/test/setup.ts)를 사용한다.
- 단일 파일 실행: `npx vitest run src/path/to/file.test.tsx`

---

## 6. 운영

### 6.1 새 기능 체크리스트

- [ ] 페이지가 필요하면 `src/pages/`에 먼저 만든다 (기본 export).
- [ ] API 호출이 있으면 `src/api/{domain}-api.ts`와 `src/query/{domain}-query.ts`를 함께 만든다.
- [ ] 공통화 가능한 UI는 `components/common/`, 화면 전용이면 `components/{domain}/{screen}/`에 둔다.
- [ ] 전역 상태가 **아니면** `store/biz/`에 넣지 않는다. 공통 스토어와 같은 종류라면 `@vanta/common`을 사용한다.
- [ ] 경로 import는 `@/`를 사용한다.
- [ ] 문구는 i18n 키 사용 여부를 먼저 확인하고 대메뉴별 `locales/{ko,en}/{대메뉴}.json`에 추가한다.
- [ ] Tailwind는 테마 토큰만 사용한다 (raw hex 금지). 색은 라이트/다크 모두 따라가도록 토큰(`bg-bg-white`/`text-text`/`border-border`/`--dg-*` 등)으로 작성한다.
- [ ] 그리드는 `data-grid`를 사용한다.
- [ ] 테스트가 필요한 로직이면 대상 옆에 `__tests__`를 추가한다.
- [ ] 감사 컬럼은 `regDtm`, `updDtm`, `delDtm`, `regrId`, `updrId`를 사용한다 (CLAUDE.md 참고).

### 6.2 레거시와 공존

현재 저장소에는 다음 구조가 함께 존재한다.

| 영역      | 신규                           | 레거시                                       |
| --------- | ------------------------------ | -------------------------------------------- |
| 그리드    | `components/common/data-grid/` | `components/common/tui/`, `CrudGridPage.tsx` |
| 서버 상태 | 명시적 `*-query.ts` 모듈       | `createCrudService` + `createQueryHooks`     |

새 코드를 작성할 때는 다음 순서를 따른다.

1. **같은 도메인에 이미 있는 패턴을 먼저 따른다.** 도메인 내 일관성이 신규 패턴보다 우선한다.
2. **새로 시작하는 화면**이라면 명시적 query 모듈과 DataGrid를 우선한다.
3. **레거시 화면의 작은 수정**이라면 기존 패턴을 존중하고, 불필요한 대규모 전환은 피한다.
4. **구조 전환이 필요**하면 화면 단위로 끊어서 진행한다. 하나의 PR에 레거시 정리와 신규 기능을 섞지 않는다.
