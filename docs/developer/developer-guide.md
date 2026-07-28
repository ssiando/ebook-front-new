# Vanta Admin Front - 개발 가이드

> 이 문서는 프로젝트에 처음 합류하는 개발자가 빠르게 이해하고 기여할 수 있도록 작성되었습니다.

---

## 1. 프로젝트 소개

Vanta Admin Front는 **관리자 대시보드 웹 애플리케이션**입니다.

### 기술 스택 한눈에 보기

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
| **Keycloak**                        | 인증(SSO)             | 통합 로그인을 처리합니다                               |

---

## 2. 시작하기

### 2.1 필수 환경

- **Node.js** 18 이상
- **npm** (Node.js와 함께 설치됨)
- **Git**

### 2.2 프로젝트 설치 및 실행

```bash
# 1. 저장소 클론
git clone <저장소 URL>
cd vanta-admin-front

# 2. 의존성 설치
npm run install:gitlab

# 3. 개발 서버 실행
npm run dev

# 4. (common 배포 시) @vanta/common 최신 버전 업데이트
npm run install:gitlab
```

> `npm run install:gitlab` 실행 이후에도 @vanta/common의 최신 버전을 받아오지 못하는 경우, 다음과 같은 조치들을 시도해 보세요.
>
> - IDE 내 명령 팔레트에서 `Developer: Reload Window` 실행
> - node_modules 폴더 삭제 후 다시 업데이트 실행

브라우저에서 `http://localhost:8088`로 접속하면 앱을 확인할 수 있습니다.

### 2.3 자주 쓰는 명령어

| 명령어                   | 설명                                      |
| ------------------------ | ----------------------------------------- |
| `npm run install:gitlab` | 의존성 설치 + `@vanta/common@latest` 갱신 |
| `npm run dev`            | 개발 서버 실행 (localhost:8088)           |
| `npm run build`          | 프로덕션 빌드                             |
| `npm run lint`           | 코드 스타일 검사                          |
| `npm run lint:fix`       | 코드 스타일 자동 수정                     |
| `npm run format`         | 코드 포맷팅 (Prettier)                    |
| `npm test`               | 테스트 실행                               |

**`@vanta/common` 업데이트도 `npm run install:gitlab`을 사용하세요. `npm update`는 캐시 문제로 구버전이 설치될 수 있습니다.**

### 2.4 환경 변수

`.env.localhost` 파일에 로컬 개발 환경 설정이 들어있습니다:

```
VITE_API_BASE_URL=http://localhost:8080    # 백엔드 API 주소
VITE_KEYCLOAK_URL=http://localhost:9090    # Keycloak 서버 주소
VITE_KEYCLOAK_REALM=vanta                  # Keycloak 영역
VITE_KEYCLOAK_CLIENT_ID=vanta-admin        # Keycloak 클라이언트 ID
VITE_I18N_DEFAULT_LANGUAGE=ko-KR           # 기본 언어
```

> **Tip:** `VITE_` 접두사가 붙은 환경 변수만 브라우저에서 접근 가능합니다.

### 2.5 Git 사용자 설정 (최초 1회)

커밋 작성자 정보가 사내 정책과 맞아야 GitLab에서 본인 커밋으로 인식됩니다. 클론 직후 한 번만 설정하면 됩니다.

```bash
# 현재 글로벌 설정 확인
git config --global --list

# 사용자 이름은 한글로, 이메일은 회사 메일로 설정
git config --global user.name "홍길동"           # 한글 이름
git config --global user.email "name@cj.net"     # 회사 메일
```

설정 후 `git config --global user.name`, `git config --global user.email` 로 다시 확인할 수 있습니다.

---

## 3. 프로젝트 구조

```
src/
├── api/              # 📡 API 통신 (서버와 데이터를 주고받는 코드)
├── components/
│   ├── common/       # 🔧 공통 컴포넌트
│   │   ├── ui/       # 🧱 기본 UI (Button, Modal, Badge, …)
│   │   ├── form/     # 📝 RHF 연동 폼 필드 (FormInput, FormSelect, …)
│   │   └── …         # Pagination, TuiGrid, PageTitle, LoadingOverlay 등
│   ├── layout/       # 🏗️ 레이아웃 (MainLayout, Sidebar, TabBar)
│   ├── auth/         # 🔐 인증·권한 (AuthGuard, Authorized)
│   └── …             # 도메인별 화면 조각 (예: system/label)
├── hooks/            # 🪝 커스텀 훅 (공통 — 신규 추가 금지)
├── lib/              # 📚 라이브러리 설정 (keycloak 등)
├── store/            # 🗄️ 업무 도메인 전용 Zustand 스토어 (biz/ 하위)
├── pages/            # 📱 페이지 컴포넌트 (URL과 1:1 매핑)
├── types/            # 📋 타입 정의
├── utils/            # 🛠️ 유틸리티 함수
├── i18n/             # 🌐 다국어 번역 파일
├── query/            # 🔄 React Query 훅
├── providers/        # 🔌 Context Provider
└── data/             # 📁 정적 데이터 (메뉴 구조 등)
```

### 각 폴더의 역할 쉽게 이해하기

**비유:** 이 프로젝트를 **레스토랑**에 비유하면:

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

---

## 4. 핵심 개념 이해하기

### 4.1 데이터 흐름: 서버에서 화면까지

기본 흐름은 **axios로 직접 호출**입니다. 캐싱·재요청·동기화가 필요한 화면에서만 React Query를 얹습니다.

```
[백엔드 서버]
     ↓  HTTP 요청/응답 (axios + 인터셉터: 인증·로딩·에러 자동 처리)
[API 모듈]  src/api/{도메인}-api.ts — axios 호출 함수
     ↓  함수 호출
[페이지/컴포넌트]  useState + useEffect 로 호출
   또는
[Query 모듈] (Optional)  src/query/{도메인}-query.ts — useQuery / useMutation
     ↓  데이터 + 상태 (로딩, 에러, 캐시)
[페이지 컴포넌트] ─ 데이터를 화면에 표시
```

> **선택 기준** — 단순 한 번의 조회/저장이면 axios 직접 호출. 같은 데이터를 여러 화면에서 공유하거나, 캐시 무효화·낙관적 업데이트가 필요하면 React Query 도입.

### 4.2 API 모듈 — 서버와 통신하기

모든 화면은 `src/api/{도메인}-api.ts`에서 **axios 호출 함수**를 정의합니다. 이게 기본 패턴입니다.

```ts
// src/api/product-api.ts
import { http } from '@vanta/common';
import type { Product, ProductSearchParams } from '@/types/product';

export async function getProductList(params: ProductSearchParams) {
  const { data } = await http.get('/products', { params });
  return data;
}

export async function getProduct(id: string) {
  const { data } = await http.get(`/products/${id}`);
  return data;
}

export async function createProduct(payload: Omit<Product, 'id' | 'regDtm' | 'updDtm' | 'delDtm'>) {
  const { data } = await http.post('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await http.patch(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  await http.delete(`/products/${id}`);
}
```

> 페이지·컴포넌트에서 직접 `axios`를 import 하지 말고 항상 API 모듈을 거쳐 호출합니다. 인증 토큰 주입·로딩 오버레이·에러 토스트는 `@vanta/common`의 `http` 인터셉터가 처리합니다.

#### (Optional) 단순 CRUD 자동 생성: `createCrudService`

리소스가 **표준 5종 (목록·단건·생성·수정·삭제)** 만 필요하고 추가 검색 조건이 적다면 팩토리로 한 줄에 만들 수 있습니다. 단, 신규 화면은 **명시적 `*-api.ts`를 우선**합니다 — 추후 커스텀 엔드포인트가 추가될 때 마이그레이션 비용이 적습니다.

```ts
// src/api/product-api.ts
import { createCrudService } from '@vanta/common';
import type { Product } from '@/types/product';

export const productService = createCrudService<Product>('/products');
// → getAll(params), getById(id), create(data), update(id, data), delete(id)
```

### 4.3 React Query (Optional) — 캐싱이 필요할 때만

기본은 axios 직접 호출입니다. **다음 중 하나라도 해당되면** React Query를 도입하세요.

- 같은 데이터를 여러 화면/컴포넌트가 공유한다 (예: 공통코드, 메뉴 트리)
- 한 화면에서 여러 비동기 결과를 동시에 표시하고 캐시한다 (대시보드 등)
- 저장 후 다른 목록을 무효화·갱신해야 한다 (`invalidateQueries`)
- 백그라운드 재요청·낙관적 업데이트가 필요하다

도입할 때는 `src/query/{도메인}-query.ts`에 query key·`useQuery`·invalidate 함수를 모아서 둡니다.

```ts
// src/query/product-query.ts
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { getProductList, getProduct } from '@/api/product-api';
import type { ProductSearchParams } from '@/types/product';

export const productQueryKeys = {
  root: ['products'] as const,
  list: (params: ProductSearchParams) => [...productQueryKeys.root, 'list', params] as const,
  detail: (id: string) => [...productQueryKeys.root, 'detail', id] as const,
};

export function useProductListQuery(params: ProductSearchParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProductList(params),
  });
}

export function useProductDetailQuery(id: string) {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}

export function useInvalidateProductQueries() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productQueryKeys.root });
}
```

**페이지에서 사용하기:**

```tsx
function ProductListPage() {
  const [params, setParams] = useState<ProductSearchParams>({ page: 0, size: 20 });
  const { data, isFetching } = useProductListQuery(params);

  return (
    <>
      <ProductGrid data={data} loading={isFetching} />
      <Pagination
        pageResponse={data?.pageResponse}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      />
    </>
  );
}
```

#### `src/hooks/`는 신규 추가 금지

`src/hooks/`는 **전사 공통 훅**(예: `use-authorized`, `use-outside-click`, `create-query-hooks` 같은 팩토리)만 모아두는 영역입니다. 화면 단위 데이터 패칭 훅을 여기에 새로 추가하지 마세요.

> 만약 여러 화면에서 공통으로 필요한 커스텀 훅이 있다면, 직접 `src/hooks/`에 추가하지 말고 **공통 파트에 요청**해 주세요. 공통팀이 검토 후 `@vanta/common` 또는 `src/hooks/`에 반영합니다.

| 상황                           | 어디에 두는가                                           |
| ------------------------------ | ------------------------------------------------------- |
| 화면 단위 axios 호출           | `src/api/{도메인}-api.ts`                               |
| 화면 단위 React Query 훅       | `src/query/{도메인}-query.ts`                           |
| 화면 단위에서만 쓰이는 작은 훅 | 화면 컴포넌트 폴더 (`components/{도메인}/{화면}/`) 안에 |
| 전사 공용 훅 (인증·권한 등)    | (이미 정의된 것만 사용 — 신규 추가 X)                   |

> 기존 코드에서 `src/hooks/use-products.ts` 같은 도메인별 훅이 보일 수 있는데, 이는 **레거시 패턴**입니다. 새 코드는 `api/` + (선택적으로) `query/` 조합으로 작성합니다.

### 4.4 폼 처리 — 사용자 입력 다루기

이 프로젝트는 **react-hook-form(RHF, 값 연결·제출)** + **Zod(규칙)** 을 같이 씁니다.  
개념·패턴·팀 규칙(`validateForm`)은 **「6.3 폼 검증 가이드」** 에서 자세히 다룹니다.

```tsx
import { defineFormRules, showFormErrors, validateForm } from '@vanta/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormInput } from '@/components/common/form';
import { Button } from '@/components/common/ui';

const formRules = defineFormRules({
  name: {
    type: 'string',
    required: true,
    label: 'user.form.name', // i18n 키 — 기본 메시지 {{label}} 보간
  },
  email: {
    type: 'string',
    required: true,
    email: true,
    label: 'user.form.email',
    messages: { email: 'user.form.validation.emailCustom' }, // 선택 오버라이드
  },
});

const formSchema = validateForm(formRules);

type FormValues = z.infer<typeof formSchema>;

function CreateUserForm() {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <div className="space-y-4 max-w-md">
      <FormInput
        control={control}
        name="name"
        label={t(formRules.name.label!)}
        required={formRules.name.required}
      />
      <FormInput
        control={control}
        name="email"
        label={t(formRules.email.label!)}
        required={formRules.email.required}
      />
      <Button
        variant="primary"
        onClick={() => {
          void handleSubmit(
            async (data) => {
              await createUser(data);
            },
            (errors) => showFormErrors(errors, formRules),
          )();
        }}
      >
        저장
      </Button>
    </div>
  );
}
```

검증 실패 시 필드 아래 인라인 에러가 표시되는 동시에, `showFormErrors`가 첫 번째 실패 필드의 메시지를 팝업으로 띄웁니다.  
기본 문구는 `common.validation.msg.*` + `label` 보간(`"{{label}}은(는) 필수 입력 항목입니다."`). `messages`가 있으면 그 키로 오버라이드합니다. (상세는 §6.3)

### 4.5 폼 검증 유틸 (`validateForm` / `defineFormRules`)

`validateForm`은 필드 설정 객체를 받아 Zod 스키마를 자동 생성합니다. 각 필드는 `type`으로 종류를 구분하는 discriminated union이며, 규칙 객체를 변수로 분리할 때는 `defineFormRules`로 감싸면 `as const` 없이도 타입 추론이 정확해집니다.

| `type`      | 옵션                                                                                                  | 예시                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `'string'`  | `label`, `messages`, `required`, `email`, `phoneKR`, `optionalPhoneKR`, `minLength`, `maxLength`, `trim` | `{ type: 'string', required: true, label: 'user.form.name' }`     |
| `'boolean'` | `label`, `messages`, `mustBeTrue`                                                                     | `{ type: 'boolean', mustBeTrue: true, label: 'user.form.agree' }` |
| `'number'`  | `label`, `messages`, `required`, `min`, `max`                                                         | `{ type: 'number', min: 0, max: 150, label: 'user.form.age' }`    |
| `'enum'`    | `label`, `messages`, `values` (필수), `required`                                                      | `{ type: 'enum', values: ['a', 'b'] as const, label: '상태' }`       |

- **`label`**: 기본 검증 메시지가 바라보는 값. **i18n 키 권장**. UI에는 `t(label)`로 전달.
- **`messages`**: 필요 시 `required` / `email` / `maxLength` / `minLength` / `phone` / `numberInvalid` / `mustAgree` 를 오버라이드 (i18n 키, `{{label}}` 보간).

### 4.6 라우팅 — URL과 페이지 연결

이 프로젝트는 **파일 기반 라우팅**을 사용합니다. `src/pages/` 안에 파일을 만들면 **자동으로 URL이 생성**됩니다.

| 파일 경로                   | URL            |
| --------------------------- | -------------- |
| `src/pages/index.tsx`       | `/`            |
| `src/pages/Users.tsx`       | `/users`       |
| `src/pages/Settings.tsx`    | `/settings`    |
| `src/pages/admin/list.tsx`  | `/admin/list`  |
| `src/pages/system/Menu.tsx` | `/system/menu` |

> **규칙:** PascalCase 파일명은 camelCase URL로 변환됩니다. (`UserDetail.tsx` → `/userDetail`)

### 4.7 전역 상태 관리 (Zustand)

Zustand는 두 갈래로 나뉩니다.

#### 공통 스토어 — `@vanta/common`

인증·로딩·메뉴·탭·팝업·공통코드처럼 **모든 프로젝트가 동일하게 쓰는 스토어**는 `@vanta/common`이 제공합니다. **로컬 `src/store/`에 같은 종류의 스토어를 새로 만들지 않습니다.**

| 스토어            | 저장하는 데이터        |
| ----------------- | ---------------------- |
| `useAuthStore`    | 로그인 유저 정보, 토큰 |
| `useLoadingStore` | API 로딩 상태          |
| `useProgramStore` | 사이드바 메뉴 구조     |
| `useTabStore`     | 열린 탭 목록           |
| `usePopupStore`   | 모달/alert/confirm     |
| `useCodeStore`    | 공통코드 캐시          |

```tsx
import { useAuthStore } from '@vanta/common';

function UserProfile() {
  const user = useAuthStore((state) => state.user);
  return <p>{user?.name}님 안녕하세요!</p>;
}
```

> 공통 스토어의 메서드 시그니처와 사용 패턴(예: `useCodeStore.getCodeList`, `useTabStore.openInNewTab` / `removeTab`, `messageUtil`)은 [`docs/developer/common-feature-developer-guide.md`](common-feature-developer-guide.md)를 참고하세요.

#### 업무용 스토어 — `src/store/biz/`

특정 업무 도메인에서만 공유하는 클라이언트 상태(예: 화면 간에 유지되는 선택 항목, 임시 필터 등)는 **`src/store/biz/{name}-store.ts`** 에 둡니다. 공통 스토어와 섞이지 않도록 반드시 `biz/` 하위에 둡니다.

```ts
// src/store/biz/sample-store.ts
import { create } from 'zustand';

interface SampleBizState {
  selectedId: string | null;
  keyword: string;
}

interface SampleBizActions {
  select: (id: string | null) => void;
  setKeyword: (keyword: string) => void;
  reset: () => void;
}

export const useSampleBizStore = create<SampleBizState & SampleBizActions>()((set) => ({
  selectedId: null,
  keyword: '',
  select: (id) => set({ selectedId: id }),
  setKeyword: (keyword) => set({ keyword }),
  reset: () => set({ selectedId: null, keyword: '' }),
}));
```

> 서버에서 받아온 목록·상세는 React Query가 캐시하므로 **business 스토어에 다시 저장하지 않습니다.** 화면 간 공유가 필요한 클라이언트 상태(선택, 토글, 임시 필터 등)만 둡니다.

---

## 5. 새 기능 추가하기 (단계별 튜토리얼)

**예시:** "상품(Product) 관리 페이지"를 추가한다고 가정합니다.

### Step 1. 타입 정의

```ts
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
```

### Step 2. API 모듈 생성

axios 호출 함수를 도메인 단위로 모읍니다. 페이지/컴포넌트에서는 항상 이 모듈을 거칩니다.

```ts
// src/api/product-api.ts
import { http } from '@vanta/common';
import type { Product, ProductSearchParams } from '@/types/product';

export async function getProductList(params: ProductSearchParams) {
  const { data } = await http.get('/products', { params });
  return data;
}

export async function createProduct(payload: Omit<Product, 'id' | 'regDtm' | 'updDtm' | 'delDtm'>) {
  const { data } = await http.post('/products', payload);
  return data;
}
// 필요한 만큼만 정의 — getById, update, delete 등
```

### Step 3. (Optional) React Query 모듈 생성 — 캐싱이 필요할 때만

단순 한 번의 호출이면 페이지에서 `useState` + `useEffect`로 호출해도 됩니다. **여러 화면이 공유**하거나 **저장 후 자동 재요청**이 필요하면 React Query를 얹습니다.

```ts
// src/query/product-query.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getProductList } from '@/api/product-api';
import type { ProductSearchParams } from '@/types/product';

export const productQueryKeys = {
  root: ['products'] as const,
  list: (params: ProductSearchParams) => [...productQueryKeys.root, 'list', params] as const,
};

export function useProductListQuery(params: ProductSearchParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProductList(params),
  });
}

export function useInvalidateProductQueries() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productQueryKeys.root });
}
```

> **`src/hooks/`에 새 훅을 추가하지 마세요.** 거기는 전사 공통 훅 영역입니다. 화면 단위 데이터 호출은 `src/api/`(필수) + `src/query/`(선택) 조합으로 둡니다.

### Step 4. 페이지 생성

모든 페이지는 **`PageTitle` → `PageSearch` → 본문**(그리드·폼 등) 순서로 조합합니다.

- **`PageTitle`**: 제목 영역 (즐겨찾기, 툴팁, 액션 버튼 포함). `breadcrumb`을 생략하면 현재 라우트의 메뉴 경로를 자동으로 표시한다.
- **`PageSearch`**: 조회 영역 (내부에 화면 전용 검색 컴포넌트를 넣음)
- **본문**: 그리드·폼 등 화면 전용 컴포넌트(`components/{도메인}/{화면}/`)로 분리

검색·본문 UI 덩어리는 화면 전용 컴포넌트(`components/{도메인}/{화면}/`)로 분리해 페이지를 얇게 유지합니다.  
등록·상세처럼 조회 영역이 없는 화면은 `PageSearch`를 생략하고 본문에 폼을 바로 조합합니다.

```tsx
// src/pages/products/ProductList.tsx  → URL: /products/productList
import { PageSearch, PageTitle } from '@vanta/common';
import { useForm } from 'react-hook-form';

import ProductContent from '@/components/products/list/ProductContent';
import ProductSearch from '@/components/products/list/ProductSearch';
import { useProductQuery } from '@/query/product-query';
import { productFormSchema } from '@/components/product/form/validation/formSchema';

export default function ProductList() {
  const { control, reset } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', status: '' },
  });

  const { data, isLoading, refetch } = useProductQuery(/* params */);

  const handleSearch = () => {
    void refetch();
  };

  return (
    <>
      {/* 1. 타이틀 영역 — breadcrumb, 즐겨찾기 등은 공통 컴포넌트에서 주입 */}
      <PageTitle title={t('product.title')} actionButtonsProps={{ onSearch: handleSearch }} />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch control={control}>
        <ProductSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 그리드·폼은 화면 전용 컴포넌트로 분리 */}
      <ProductContent data={data} isLoading={isLoading} />
    </>
  );
}
```

### Step 5. 번역 추가

대메뉴별로 파일을 분리합니다. 해당 대메뉴 파일이 없으면 새로 만들면 되고, `import.meta.glob`이 자동 로드하므로 init 코드 수정은 불필요합니다.

```json
// src/i18n/locales/ko/product.json
{
  "product": {
    "list": {
      "title": "상품 관리",
      "name": "상품명",
      "price": "가격",
      "category": "카테고리",
      "status": "상태"
    },
    "form": {
      "create": "상품 등록"
    }
  }
}
```

```json
// src/i18n/locales/en/product.json
{
  "product": {
    "list": {
      "title": "Product Management",
      "name": "Product Name",
      "price": "Price",
      "category": "Category",
      "status": "Status"
    },
    "form": {
      "create": "Create Product"
    }
  }
}
```

### 체크리스트

새 기능을 추가할 때 확인하세요:

- [ ] 타입을 정의했나요?
- [ ] API 모듈을 `src/api/{도메인}-api.ts`에 axios 호출로 만들었나요?
- [ ] React Query가 필요한 화면이라면 `src/query/{도메인}-query.ts`에 정리했나요? (캐싱·공유 불필요하면 불필요)
- [ ] `src/hooks/`에 화면 단위 훅을 새로 추가하지 않았나요? 필요하다면 공통 파트 문의해주세요.
- [ ] 페이지 구조를 `PageTitle` → `PageSearch` → 본문(그리드·폼) 순으로 맞췄나요?
- [ ] 페이지는 얇게 두고, 검색·본문 UI는 화면 전용 컴포넌트(`components/{도메인}/{화면}/`)로 분리했나요?
- [ ] 모든 사용자 표시 문자열에 `t()` 함수를 사용했나요?
- [ ] 색상에 테마 토큰을 사용했나요? (raw hex 금지)
- [ ] 폼 검증에 Zod + `zodResolver`를 연결했나요? (흐름은 §6.3, 기본 메시지는 `label` + `common.validation.msg.*`, 필요 시 `messages` 오버라이드)

---

## 6. 컴포넌트 가이드

경로는 모두 `src/` 기준이며, import 시 `@/` 별칭을 사용합니다.

### 6.1 UI 컴포넌트 (`components/common/ui/`)

순수 UI 조각입니다. `import { Button, Modal, … } from '@/components/common/ui'` 형태로 가져옵니다.

**Button** — 기본 버튼 (`type` 기본값은 `button`; 폼 제출 시 `type="submit"` 명시)

```tsx
import { Button } from '@/components/common/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  저장
</Button>;

// variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
// size: 'sm' | 'md' | 'lg'
// loading, icon props 지원
```

`permission` prop으로 액션 코드 기반 권한 제어를 할 수 있다. 자세한 내용은 **§8.4**를 참고한다.

**Modal** — 포털·오버레이·Esc 처리 포함 모달 셸

```tsx
import { Modal } from '@/components/common/ui';

<Modal open={open} onClose={() => setOpen(false)} title="확인">
  <p>정말 삭제하시겠습니까?</p>
</Modal>;
```

**ConfirmDialog** — 확인/취소 패턴이 자주 필요할 때 `Modal` 대신 검토

**Spinner** — 로딩 인디케이터

```tsx
import { Spinner } from '@/components/common/ui';

<Spinner size="lg" />;
// size: 'sm' | 'md' | 'lg'
```

**Badge** — 상태 라벨

```tsx
import { Badge } from '@/components/common/ui';

<Badge variant="success">활성</Badge>
<Badge variant="danger">중지</Badge>

// variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'
```

**기타** — `Card`, `Empty`, `Tooltip` 등 동일 폴더에서 export

**Pagination (목록 + 백엔드 연동)** — `PageResponse` 메타와 맞춘 바는 **`@/components/common/Pagination`** (별도 파일).  
`page`는 **0-base**, `onPageChange`에도 0-base 페이지 번호가 전달됩니다.

```tsx
import Pagination from '@/components/common/Pagination';

<Pagination
  pageResponse={{
    page: 0,
    size: 20,
    totalElements: 100,
    totalPages: 5,
    hasNext: true,
    hasPrevious: false,
  }}
  onPageChange={(nextPage) => setPage(nextPage)}
/>;
```

`components/common/ui/Pagination.tsx`는 **1-base `page` + `total` 건수** 기반의 다른 API를 쓰므로, 백엔드 목록과 묶을 때는 위 **common/Pagination**을 사용합니다.

### 6.2 폼 컴포넌트 (`components/common/form/`)

react-hook-form과 연동되는 필드입니다. `import { FormInput, … } from '@/components/common/form'`.

공통적으로 **`control`**과 **`name`**(필드 키)을 넘깁니다. 검증 연결·에러 처리·`validateForm` 사용법은 **§6.3** 을 따릅니다.

| 컴포넌트         | 용도                        |
| ---------------- | --------------------------- |
| `FormInput`      | 텍스트·숫자 등 단일 행 입력 |
| `FormSelect`     | 선택 (단일 / 멀티)          |
| `FormCheckbox`   | 체크박스                    |
| `FormRadioGroup` | 라디오 그룹                 |
| `FormTextarea`   | 여러 줄 텍스트              |
| `FormDatePicker` | 연·월·일·시간·기간 (`mode`) |
| `FormTiptap`     | 리치 텍스트(HTML 문자열)    |

샘플 페이지: `src/pages/samples/form/*`, 검증 패턴: `src/pages/samples/form/SampleFormValidation.tsx`

### 6.3 폼 검증 가이드 (RHF + Zod)

입력값이 “허용되는지”는 **Zod 스키마**가 판단하고, **언제** 그 검사를 돌릴지는 **`handleSubmit`** 이 담당합니다. RHF는 필드와 값을 연결만 해 줍니다.

#### 한눈에 보는 흐름

```
1) 규칙을 코드로 적는다 (Zod 스키마)
      ↓
2) useForm({ resolver: zodResolver(schema) }) 로 연결
      ↓
3) 저장/전송에서 handleSubmit(성공 콜백, 실패 콜백) 호출 → 이때 검증 실행
      ↓
4) 성공: 콜백의 data로 API 호출 / 실패: 필드 에러 / 토스트 등
```

#### 패턴 A — `validateForm` + `defineFormRules` (팀 표준)

대부분의 일반 폼/화면에서 사용합니다. 필드 규칙을 객체로 정의하고, `validateForm`에 넘기면 자동으로 Zod 스키마를 생성합니다.  
UI 표시(`required`, `maxLength` 등)와 검증 조건을 **동일한 규칙 객체에서 꺼내 사용**하면 항상 일치할 수 있어 유지보수가 쉽습니다.

```ts
import { defineFormRules, showFormErrors, validateForm } from '@vanta/common';
import { z } from 'zod';

// 1. 필드 검증 규칙 정의
//    - label: 기본 메시지가 바라봄 (i18n 키 권장)
//    - messages: 필요 시 common.validation.msg.* 오버라이드
const myFormRules = defineFormRules({
  name: {
    type: 'string',
    required: true,
    maxLength: 50,
    label: 'samples.form.validationLabelDisplayName',
    messages: { required: 'samples.form.validationMsgDisplayNameRequired' },
  },
  email: { type: 'string', required: true, email: true, label: 'samples.form.validationLabelEmail' },
  age: { type: 'number', min: 0, max: 150, label: 'samples.form.validationLabelAge' },
  agree: { type: 'boolean', mustBeTrue: true, label: 'samples.form.validationLabelAgree' },
});

// 2. Zod 스키마 생성
const myFormSchema = validateForm(myFormRules);

// 3. 타입 자동 유추
type MyFormValues = z.infer<typeof myFormSchema>;
```

```tsx
// 4. FormInput — UI label은 같은 i18n 키를 t()로
<FormInput
  control={control}
  name="name"
  label={t(myFormRules.name.label!)}
  required={myFormRules.name.required}
  maxLength={myFormRules.name.maxLength}
/>;

// 5. 검증 실패 시 showFormErrors (label·messages 반영된 문구)
void handleSubmit(onSave, (errors) => showFormErrors(errors, myFormRules))();
```

- 예: `sampleFormRules`/`sampleFormSchema` (`src/components/samples/form/validation/form-schema.ts`)
- `label`, `required`, `maxLength` 등 **UI 속성도 같은 규칙 객체에서 추출** — 규칙과 화면이 항상 일치
- 검증 규칙을 화면에서 재사용하려면 반드시 변수로 분리 + `defineFormRules` 사용
- 단순한 1~2개 필드에도 사용할 수 있음

상세 주석·라이브 예시:

- `src/pages/samples/form/SampleFormValidation.tsx` (페이지)
- `src/components/samples/form/validation/form-schema.ts` (규칙 + 스키마)

---

#### 패턴 B — `z.object` 직접 작성 (커스텀이 필요한 복잡한 경우)

폼 로직이나 유효성 규칙이 매우 복잡하거나, 규약 패턴을 벗어날 필요가 있을 때는 Zod의 `z.object`를 직접 선언합니다.  
직접 메시지를 넣거나, 고급 커스텀 밸리데이션이 필요할 때 적합합니다.

```ts
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'common.validation.msg.required'),
  email: z.string().email('common.validation.msg.email'),
});
```

- 검증 규칙/화면 재사용성이 낮거나, 동적 필드 등 복잡한 조건일 때 권장
- 이 경우에도 메시지는 i18n 키(`common.validation.msg.*`)로 맞추세요

#### 에러 메시지 (i18n)

`validateForm`(패턴 A) 기본 메시지:

| 항목 | 설명 |
| ---- | ---- |
| 기본 키 | `@vanta/common` `common.validation.msg.*` (`required`, `email`, …) |
| `label` | 메시지 `{{label}}`에 보간. **i18n 키 권장** |
| `messages` | 필드별로 기본 키를 오버라이드 (같은 `{{label}}` 보간) |

표시는 필드 하단 인라인 + `showFormErrors(errors, formRules)` 팝업.  
`showFormErrors`는 검증 시점에 이미 label·messages가 반영된 문구를 그대로 띄우거나, 남은 i18n 키를 번역합니다 (§4.4 예시).

#### 제출 시점·`<form>` 태그

검증은 **`handleSubmit`이 호출될 때** 돌아갑니다. `<form onSubmit={…}>` 없이도 `Button` `onClick`에서 `void handleSubmit(… )()` 만 호출하면 됩니다. (팀 샘플 페이지도 이 패턴을 사용)

#### 막힐 때 읽을 순서 (추천)

1. `src/pages/samples/form/SampleFormValidation.tsx` 상단 안내 + 라이브 폼
2. `form-schema.ts` 의 `sampleFormRules` / `validateForm`
3. `@vanta/common` `formUtils.ts` 의 `FormFieldConfig` 옵션 (`label`, `messages`)
4. 그 외 필드별 샘플: `src/pages/samples/form/SampleInputTextarea.tsx` 등

### 6.4 DataGrid / GridBtn

신규 화면의 그리드는 **`@vanta/common`의 `DataGrid` + `GridBtn`** 을 사용합니다.

> 기존 TUI Grid(`components/common/tui/`) 레거시입니다. 새 화면에서 TUI Grid를 사용하지 마세요.

#### 기본 구조

```tsx
import { DataGrid, GridBtn, createColumns } from '@vanta/common';
import type { DataGridHandle } from '@vanta/common';
import { useRef } from 'react';

type ProductRow = { id: number; name: string; status: string };

// 컬럼 정의는 컴포넌트 밖에서 (매 렌더마다 재생성 방지)
const COLUMNS = createColumns<ProductRow>([
  { header: 'ID', name: 'id', width: 60 },
  { header: '상품명', name: 'name', width: 200, editor: 'text', validation: { required: true } },
  {
    header: '상태',
    name: 'status',
    width: 120,
    editor: 'select',
    selectOptions: [
      { label: '활성', value: 'active' },
      { label: '중지', value: 'inactive' },
    ],
  },
]);

const GRID_OPTIONS = {
  rowHeaders: [{ type: 'rowNum' as const }, { type: 'checkbox' as const }],
  editingEvent: 'click' as const,
  height: 400,
};

function ProductGrid({ data, onSave }: Props) {
  const gridRef = useRef<DataGridHandle<ProductRow>>(null);

  return (
    <div className="flex flex-col gap-3">
      <GridBtn
        gridRef={gridRef}
        gridTitle="상품 목록"
        gridBtn={{
          isPlus: true,
          isMinus: true,
          extraButtons: [{ label: '저장', onClick: onSave, variant: 'primary' }],
        }}
      />
      <DataGrid ref={gridRef} columns={COLUMNS} data={data} options={GRID_OPTIONS} />
    </div>
  );
}
```

#### 컬럼 에디터 타입

| `editor`     | 동작                                        | 비고   |
| ------------ | ------------------------------------------- | ------ |
| `'text'`     | 더블클릭(또는 클릭) → 인라인 텍스트 입력    | 기본값 |
| `'number'`   | 숫자 입력, 표시는 천단위 콤마 자동 포맷     |        |
| `'select'`   | 드롭다운, `selectOptions` 필수              |        |
| `'date'`     | 날짜 선택기, `yyyy-MM-dd` 출력              |        |
| `'checkbox'` | 클릭 즉시 토글, `checkboxOptions`로 값 지정 |        |
| (없음)       | 읽기 전용, 배경색 회색 자동 적용            |        |

#### 셀 렌더러

`@vanta/common`에서 import해 `cellRenderer`로 지정합니다.

```tsx
import { BadgeCell, CheckboxCell, DateTimeCell } from '@vanta/common';

createColumns<ProductRow>([
  { header: '상태', name: 'status', cellRenderer: BadgeCell },
  {
    header: '활성여부',
    name: 'isActive',
    cellRenderer: CheckboxCell,
    editor: 'checkbox',
    checkboxOptions: { trueValue: 'Y', falseValue: 'N' },
  },
  { header: '등록일', name: 'regDtm', cellRenderer: DateTimeCell },
]);
```

| 렌더러         | 용도                                   |
| -------------- | -------------------------------------- |
| `BadgeCell`    | 문자열을 색상 배지로 표시              |
| `CheckboxCell` | Y/N, true/false, 1/0 체크박스로 표시   |
| `DateTimeCell` | ISO 문자열을 날짜·시간으로 포맷        |
| `LinkCell`     | `{ href, label }` 객체를 링크로 렌더링 |
| `ProgressCell` | 0–100 숫자를 프로그레스 바로 표시      |

#### 이벤트 처리 — `onReady` + `api.bind`

DataGrid는 `on*` 콜백 prop이 없습니다. **이벤트는 `onReady`에서 `api.bind()`로만 등록**합니다.

```tsx
<DataGrid
  ref={gridRef}
  columns={COLUMNS}
  data={data}
  options={GRID_OPTIONS}
  onReady={(api) => {
    // 행 클릭 → 상세 패널 갱신
    api.bind('cellClick', (e) => {
      const row = e.row as ProductRow;
      onRowSelect(row.id);
    });

    // 저장 전 검증 차단
    api.bind('beforeChange', (e) => {
      if (e.columnId === 'name' && !String(e.value).trim()) {
        toast.error('상품명은 필수입니다.');
        e.preventDefault?.();
      }
    });
  }}
/>
```

> `onReady` 안에서 외부 상태(state, props)를 참조할 때는 **`useRef`로 최신값을 유지**하세요.  
> `onReady`는 마운트 시 한 번만 실행되므로, 클로저가 초기 값을 캡처합니다.

```tsx
const onRowSelectRef = useRef(onRowSelect);
onRowSelectRef.current = onRowSelect; // 렌더마다 최신값 갱신

<DataGrid
  onReady={(api) => {
    api.bind('cellClick', (e) => {
      onRowSelectRef.current((e.row as ProductRow).id); // 항상 최신 콜백 호출
    });
  }}
/>;
```

#### 저장 패턴 — `getModifiedRows`

```tsx
const handleSave = async () => {
  const api = gridRef.current;
  if (!api) return;

  const { createdRows, updatedRows, deletedRows } = api.getModifiedRows();

  if (!createdRows.length && !updatedRows.length && !deletedRows.length) {
    toast('저장할 변경이 없습니다.');
    return;
  }

  try {
    for (const row of deletedRows) {
      if (row.id > 0) await deleteProduct(row.id);
    }
    for (const row of updatedRows) {
      await updateProduct(row.id, { name: row.name, status: row.status });
    }
    for (const row of createdRows) {
      if (!row.name.trim()) {
        toast.error('상품명을 입력하세요.');
        return;
      }
      await createProduct({ name: row.name, status: row.status });
    }

    toast.success('저장했습니다.');
    await invalidateProductQueries();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '저장에 실패했습니다.');
  }
};
```

#### 행 추가 / 체크된 행 삭제

> ⚠️ **기본적으로 GridBtn은 `isPlus`, `isMinus` 옵션만 켜면 addRow/체크삭제 기능을 내장합니다.  
> 아래와 같은 커스텀 함수는 행 추가·삭제 시 _추가 전처리/후처리_ 또는 _기본 동작과 다른 커스텀이 반드시 필요한 경우에만_ 직접 구현하세요.  
> (예: 삭제 전 서버 데이터가 있는 경우 컨펌 호출 등)**

```tsx
// (🔒일반적으로 필요 없음) 행 추가 커스텀 – 추가로 처리할 로직이 있을 때만
const handleAddRow = () => {
  gridRef.current?.addRow(
    { id: 0, name: '', status: 'active' },
    'first', // 'first' | 'last'
  );
};

// (🔒일반적으로 필요 없음) 체크된 행 삭제 커스텀 – 예: 서버 데이터가 있으면 컨펌 후 삭제
const handleRemoveChecked = async () => {
  const api = gridRef.current;
  if (!api) return;

  const checkedRows = api.getCheckedRows() as ProductRow[];
  if (!checkedRows.length) {
    toast('삭제할 행을 선택하세요.');
    return;
  }

  const persisted = checkedRows.filter((r) => r.id > 0);
  if (persisted.length > 0) {
    // 서버 데이터가 있으면 확인 후 삭제
    openConfirm({
      title: '삭제',
      message: `${persisted.length}건을 삭제하시겠습니까?`,
      onOk: async () => {
        for (const row of persisted) await deleteProduct(row.id);
        await invalidateProductQueries();
        toast.success('삭제했습니다.');
      },
    });
  } else {
    // 미저장 신규 행은 바로 제거
    api.removeCheckedRows();
  }
};
```

#### GridBtn 옵션

```tsx
<GridBtn
  gridRef={gridRef}
  gridTitle="제목"
  gridBtn={{
    isPlus: true, // + 버튼(기본: addRow) 표시
    isMinus: true, // - 버튼(기본: 체크 삭제) 표시
    // ⚠️ plusFunction/minusFunction은 '기본 동작 대신 커스텀 처리가 반드시 필요할 때만' 지정
    plusFunction: handleAddRow, // ex) + 클릭 시 커스텀 행 추가 함수
    minusFunction: handleRemoveChecked, // ex) - 클릭 시 커스텀 체크 삭제 함수
    extraButtons: [
      // 추가 버튼 (주요 버튼 왼쪽에 자동으로 배치)
      { label: '저장', onClick: onSave, variant: 'primary' },
      { label: '삭제', onClick: onDelete, variant: 'danger' },
    ],
  }}
/>
// variant: 'primary' | 'danger' | 'default'
```

#### 주요 grid options

```ts
const options: DataGridOptions<T> = {
  height: 400, // 필수 — 가상화에 필요
  rowHeaders: [{ type: 'rowNum' }, { type: 'checkbox' }], // 행번호 + 체크박스
  editingEvent: 'click', // 'click' | 'dblclick' (기본: dblclick)
  showRowStatus: false, // 추가/수정/삭제 상태 점 표시 X
};
```

#### 실제 구현 참고 파일

| 파일                                                                                         | 참고할 내용                 |
| -------------------------------------------------------------------------------------------- | --------------------------- |
| [src/pages/system/Code.tsx](src/pages/system/Code.tsx)                                       | `getModifiedRows` 저장 패턴 |
| [src/components/system/label/LabelContent.tsx](src/components/system/label/LabelContent.tsx) | `extraButtons` 패턴         |

### 6.5 페이지 구성 · 레이아웃 (템플릿 폴더 없음)

`components/page/` 같은 **고정 ListPage/DetailPage 래퍼는 사용하지 않습니다.** 대신 다음을 조합합니다.

| 위치                                   | 역할                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `components/layout/MainLayout.tsx`     | 사이드바·헤더·탭·`<main>` 안 `TabbedOutlet`. **메인 영역 전역 로딩**은 여기서 TanStack Query 기준으로 처리 |
| `PageTitle` (`@vanta/common`)          | 페이지 제목 + 제목 아래 보조 영역(안내, 버튼 등). `breadcrumb` 생략 시 현재 라우트 메뉴 경로 자동 표시     |
| `components/common/LoadingOverlay.tsx` | `relative` 부모 위에 덮는 반투명 로딩 마스크(필요 시 국소적으로)                                           |
| `components/도메인/화면/*.tsx`         | 화면별 검색·본문(그리드·폼) 조각 — 예: `system/label/LabelSearch.tsx`                                      |

**목록 화면(개략)**

```
PageTitle (제목 · 액션)
  → (선택) 검색/필터 영역
  → 테이블 또는 그리드
  → Pagination (common/Pagination + PageResponse)
```

**상세·등록 화면(개략)**

```
PageTitle
  → 폼 섹션(Form* + control)
  → 하단 액션 버튼(저장·취소 등)
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind CSS 테마 토큰

**반드시 테마 토큰을 사용하세요. `#605cff` 같은 직접 색상 코드는 사용 금지입니다.**

```tsx
// ✅ 올바른 사용
<div className="bg-primary text-text-heading border-border">

// ❌ 잘못된 사용
<div className="bg-[#605cff] text-[#111827] border-[#e5e7eb]">
```

### 7.2 색상 토큰 목록

| 용도           | 클래스                                   | 실제 색상   |
| -------------- | ---------------------------------------- | ----------- |
| 주 색상        | `bg-primary`, `text-primary`             | 보라색 계열 |
| 주 색상 (밝은) | `bg-primary-light`, `text-primary-light` | 밝은 보라색 |
| 본문 텍스트    | `text-text`                              | 회색        |
| 제목 텍스트    | `text-text-heading`                      | 진한 검정   |
| 배경           | `bg-bg`                                  | 밝은 회색   |
| 카드 배경      | `bg-bg-white`                            | 흰색        |
| 테두리         | `border-border`                          | 연한 회색   |
| 위험/삭제      | `bg-danger`, `text-danger`               | 빨간색      |

### 7.3 자주 쓰는 패턴

```tsx
// 카드 스타일
<div className="rounded-lg border border-border bg-bg-white p-4 shadow-sm">

// 섹션 간격
<div className="space-y-4">

// 가로 나열 (간격 포함)
<div className="flex items-center gap-2">

// 반응형 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 8. 인증과 권한

### 8.1 로그인 방식

1. **로컬 로그인** — 이메일 + 비밀번호
2. **Keycloak SSO** — 통합 인증 서버 이용

### 8.2 역할(Role) 체계

```
viewer (뷰어) → manager (매니저) → admin (관리자)
   낮음                                 높음
```

| 역할      | 할 수 있는 것                            |
| --------- | ---------------------------------------- |
| `viewer`  | 사용자 조회, 워크스페이스 조회           |
| `manager` | + 사용자/워크스페이스 수정, 설정 조회    |
| `admin`   | + 모든 삭제 권한, 설정 수정, 관리자 접근 |

### 8.3 권한 체크 방법

```tsx
import { useAuthorized } from '@vanta/common';

function AdminPanel() {
  const { hasPermission, hasMinRole } = useAuthorized();

  return (
    <div>
      {/* 특정 권한이 있을 때만 표시 */}
      {hasPermission('user:write') && <Button>사용자 수정</Button>}

      {/* 최소 역할 체크 */}
      {hasMinRole('admin') && <Button variant="danger">관리자 설정</Button>}
    </div>
  );
}
```

### 8.4 버튼 권한 제어 (PageTitle · Button)

페이지 URL에서 자동으로 권한 코드 prefix를 추출해 버튼 표시 여부를 결정한다. 개발자가 별도로 코드를 명시하지 않아도 된다.

#### 액션 코드 명명 규칙

```
{PAGE_PREFIX}_API_R   조회 (Read)
{PAGE_PREFIX}_API_C   등록 (Create)
{PAGE_PREFIX}_API_U   수정 (Update)
{PAGE_PREFIX}_API_D   삭제 (Delete)
```

PAGE_PREFIX는 파일명(PascalCase) → URL(camelCase) → UPPER_SNAKE_CASE로 자동 변환된다.

| 파일명           | URL                  | PREFIX        | 등록 코드 예시      |
| ---------------- | -------------------- | ------------- | ------------------- |
| `Program.tsx`    | `/system/program`    | `PROGRAM`     | `PROGRAM_API_R`     |
| `UserRole.tsx`   | `/system/userRole`   | `USER_ROLE`   | `USER_ROLE_API_C`   |
| `UserManage.tsx` | `/system/userManage` | `USER_MANAGE` | `USER_MANAGE_API_U` |

백엔드에서 API 프로그램 등록 시 이 컨벤션을 따른다.

#### PageTitle 자동 권한 필터링

`actionButtonsProps`에 핸들러를 넘기면 자동으로 권한을 체크해 버튼 표시 여부를 결정한다. 권한이 없으면 핸들러가 있어도 버튼이 렌더링되지 않는다.

```tsx
<PageTitle
  title="역할 관리"
  actionButtonsProps={{
    onSearch: handleSearch, // {PREFIX}_API_R 보유 시에만 표시
    onCreate: handleCreate, // {PREFIX}_API_C 보유 시에만 표시
    onSave: handleSave, // {PREFIX}_API_C 또는 {PREFIX}_API_U 보유 시에만 표시
    onDelete: handleDelete, // {PREFIX}_API_D 보유 시에만 표시
  }}
/>
```

`extraButtons`에 커스텀 버튼을 추가할 때는 `permissionCode`로 직접 지정한다.

```tsx
<PageTitle
  actionButtonsProps={{
    onSearch: handleSearch,
    extraButtons: [
      {
        label: '엑셀 다운로드',
        onClick: handleExport,
        permissionCode: 'USER_ROLE_API_R', // 이 코드 보유 시에만 표시
      },
    ],
  }}
/>
```

#### Button 개별 권한 제어

`<Button>`에 직접 권한을 걸고 싶을 때 `permission` prop을 사용한다.  
`useAuthorized()`로 조건을 평가한 결과 `boolean`을 `allowed`에 전달한다.

```tsx
const { hasProgramCode, hasMinRole, hasAnyPermission } = useAuthorized();

// visible: 권한 없으면 버튼 자체가 사라짐
<Button permission={{ allowed: hasProgramCode('USER_ROLE_API_C'), type: 'visible' }} onClick={handleCreate}>
  등록
</Button>

// disabled: 권한 없으면 버튼이 비활성화됨 (자리 유지)
<Button permission={{ allowed: hasMinRole('WORKSPACE_ADMIN'), type: 'disabled' }} onClick={handleEdit}>
  수정
</Button>

// 복합 조건
<Button permission={{ allowed: hasAnyPermission(['A_API_C', 'B_API_C']), type: 'visible' }}>
  등록
</Button>
```

### 8.5 라우트 보호

- **`<AuthGuard />`** — 로그인하지 않은 사용자를 로그인 페이지로 이동시킵니다
- **`<GuestGuard />`** — 이미 로그인한 사용자를 홈으로 이동시킵니다
- **`<Authorized />`** — 특정 권한이 있는 사용자에게만 컴포넌트를 보여줍니다

---

## 9. 다국어 처리 (i18n)

### 9.1 기본 사용법

```tsx
function MyComponent() {
  // useTranslation은 auto-import 되어 있어 별도 import 불필요
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.confirm')}</h1>
      <p>{t('common.auth.login')}</p>
    </div>
  );
}
```

### 9.2 로컬 JSON 구조

대메뉴별로 파일을 분리합니다.

```
src/i18n/locales/
├── ko/
│   ├── common.json       # 공통 (인증 전 화면 + 글로벌 공통 문구)
│   └── {대메뉴}.json     # 대메뉴별 키 (system.json, monitoring.json 등)
└── en/
    └── (동일 구조)
```

- `src/i18n/index.ts`가 `import.meta.glob('./locales/ko/*.json', { eager: true })` 로 자동 로드합니다. **새 파일을 추가하면 init 코드 수정 없이 자동 인식됩니다.**
- 한 locale 폴더 내 파일들은 deep merge로 병합됩니다. 같은 prefix를 여러 파일에 분산해도 동작은 하지만, **분리 기준은 대메뉴별 1파일**을 권장합니다.
- 키는 점(`.`)으로 구분하고 **3-depth 권장**: `{대메뉴}.{화면|기능}.{key}` (예: `common.confirm`, `system.code.title`).

### 9.3 번역 데이터 소스와 우선순위

번역 데이터는 두 곳에서 옵니다.

| 레이어    | 소스                              | 로드 시점      |
| --------- | --------------------------------- | -------------- |
| 로컬 JSON | `src/i18n/locales/{ko,en}/*.json` | 앱 초기화 시점 |
| DB 캐시   | `GET /system/i18n/cache`          | 인증 완료 후   |

**우선순위: 로컬 JSON > DB 캐시.**

`LabelI18nSync`(common-front)는 `addResourceBundle(..., overwrite=false)` 로 호출하므로, **로컬 JSON에 이미 있는 키는 DB 값으로 덮이지 않습니다.** DB 캐시는 JSON에 없는 키만 채워 넣는 보조 소스입니다.

운영 중 문구를 수정하려면 로컬 JSON을 변경한 뒤 재배포해야 합니다. DB 캐시 업데이트만으로는 JSON에 동일 키가 있다면 반영되지 않습니다.

### 9.4 namespace 구조

현재 `'default'`라는 단일 네임스페이스만 사용합니다. 모든 공통 번역 키를 `default` 네임스페이스에 등록합니다.

- DB에서 키를 등록할 때 namespace는 `default`로 지정합니다.
- 키 구조는 `{대메뉴}.{화면|기능}.{key}` 3-depth를 권장합니다.

```
default namespace 키 예시:
  common.confirm           → 확인
  common.cancel            → 취소
  common.auth.login        → 로그인
  system.code.addGroup     → 그룹 추가
  monitoring.dashboard.kpi → KPI
```

> **추후 namespace 분리**: 키 수가 늘거나 부분 로드가 필요해지면 `LabelI18nSync`에 namespace를 추가해 확장할 수 있습니다.
> `<LabelI18nSync namespaces={['default', 'user', 'menu']} />` 형태로 확장하도록 설계되어 있습니다.
> 컴포넌트에서 `t()` 호출 코드는 키 구조가 동일하므로 변경이 없습니다.

#### 관련 파일

| 파일                                  | 역할                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| `src/i18n/index.ts`                   | `import.meta.glob` 으로 locales 디렉터리 자동 로드               |
| `@vanta/common`의 `LabelI18nSync`     | 인증 완료 후 DB 번역을 `translation` NS에 병합 (overwrite=false) |
| `@vanta/common`의 `system/label-api`  | `fetchI18nCache`, `i18nCacheToResourceBundles`                   |
| `@vanta/common`의 `query/label-query` | `useI18nCacheQuery` (`staleTime: Infinity`)                      |
| `src/components/auth/AuthGuard.tsx`   | `LabelI18nSync`를 감싸 인증 후에만 로드                          |

### 9.5 새 번역 키 추가 방법

1. 키가 속할 대메뉴를 정합니다 (`common`, `system`, `monitoring` 등).
2. `src/i18n/locales/ko/{대메뉴}.json`, `en/{대메뉴}.json` 에 키를 추가합니다. 파일이 없으면 새로 만들면 됩니다 (자동 로드).
3. 키 구조는 3-depth: `{대메뉴}.{화면|기능}.{key}` 권장.
4. ko/en 양쪽에 모두 반영합니다.

> **인증 전 화면(로그인 등)에서 쓰는 키는 반드시 로컬 JSON에 있어야 합니다.** DB 캐시는 인증 완료 후 로드되므로 그 전에는 fallback 키만 표시됩니다.

### 9.6 규칙

- **모든 사용자 표시 문자열**은 `t()` 함수를 사용합니다.
- 하드코딩된 한국어/영어 문자열을 직접 넣지 마세요.
- **새 번역 키는 로컬 JSON에 추가합니다.** DB 캐시는 동적/운영 변경용 보조 소스이며 JSON 키를 덮어쓰지 못합니다.
- 인증 전 화면(`/login`, 에러 페이지 등)에서 쓰는 키는 반드시 로컬 JSON에 포함되어 있어야 합니다.

---

## 10. 코드 컨벤션

### 10.1 파일/폴더 네이밍

| 종류                                     | 규칙                                                     | 예시                                                   |
| ---------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| 일반 파일                                | kebab-case                                               | `create-crud-service.ts`                               |
| 컴포넌트 파일                            | PascalCase                                               | `Button.tsx`, `FormInput.tsx`                          |
| 훅 파일                                  | kebab-case + `use-` 접두사                               | `use-authorized.ts`, `use-outside-click.ts`            |
| API 모듈 (`src/api/`)                    | `{도메인}-api` (kebab)                                   | `user-api.ts`, `system/label-api.ts`, `http-client.ts` |
| React Query (`src/query/`, **Optional**) | `{도메인}-query` / 설정은 `query-client.ts`              | `label-query.ts`                                       |
| Zustand (`src/store/biz/`)               | `{도메인}-store` (kebab) — 업무 도메인 전용 스토어만 둠  | `sample-store.ts`                                      |
| 라우트 설정 (`src/routes/`)              | kebab-case (폴더가 역할을 나타냄; 진입 `index.tsx` 유지) | `auth.ts`, `main-layout-outlet.ts`, `popup-window.ts`  |
| 타입 파일                                | kebab-case                                               | `sample-domains.ts`, `types/system/label-i18n.ts`      |

### 10.2 코드 네이밍

| 종류            | 규칙                   | 예시                                   |
| --------------- | ---------------------- | -------------------------------------- |
| 컴포넌트        | PascalCase             | `function ProductList()`               |
| 훅              | camelCase + use 접두사 | `useProducts()`                        |
| 변수/함수       | camelCase              | `const userName`, `function getData()` |
| 타입/인터페이스 | PascalCase             | `interface Product`                    |
| 상수            | UPPER_SNAKE_CASE       | `const MAX_PAGE_SIZE`                  |

### 10.3 Import 규칙

- `@/`를 경로 별칭으로 사용 (`@/` = `src/`)
- React, React Router, useTranslation은 auto-import (import 문 불필요)
- import 정렬은 ESLint가 자동 처리

```tsx
// ✅ 경로 별칭 사용
import { Button } from '@/components/common/ui';
import { useProductListQuery } from '@/query/product-query';

// ❌ 상대 경로 사용 금지 (깊은 참조 시)
import { Button } from '../../../components/common/ui/Button';
```

### 10.4 커밋 메시지 규칙

Conventional Commits 형식을 따릅니다 (commitlint로 검사됨):

```
feat: 상품 목록 페이지 추가
fix: 로그인 시 토큰 갱신 오류 수정
refactor: API 서비스 팩토리 패턴 적용
docs: README 업데이트
chore: ESLint 설정 변경
```

---

## 11. 자주 묻는 질문 (FAQ)

### Q: API 응답 구조는 어떻게 되나요?

모든 API는 동일한 응답 구조를 사용합니다:

```json
{
  "success": true,
  "code": "200",
  "message": "성공",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

목록 조회 시 `data`는 페이지네이션 구조입니다:

```json
{
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### Q: 새 페이지를 만들면 자동으로 라우팅이 되나요?

네. `src/pages/` 아래에 `.tsx` 파일을 만들면 `vite-plugin-pages`가 자동으로 라우트를 생성합니다. 별도 라우트 설정이 필요 없습니다.

### Q: 로딩 표시는 어떻게 처리하나요?

두 가지 방법이 있습니다:

1. **자동 글로벌 로딩** — Axios 인터셉터가 API 호출 시 자동으로 로딩 오버레이를 표시합니다
2. **컴포넌트 레벨 로딩** — React Query를 사용한 화면이라면 `isLoading`/`isFetching`, axios 직접 호출 화면이라면 자체 `useState`로 처리합니다

글로벌 로딩을 건너뛰려면 요청 헤더에 `X-Skip-Loading: 'true'`를 추가하세요.

### Q: 에러 처리는 어떻게 하나요?

- **API 에러:** Axios 인터셉터가 전역으로 토스트 메시지를 표시합니다
- **401 에러:** 토큰 갱신을 자동 시도하고, 실패 시 로그아웃합니다
- **폼 검증 에러:** `handleSubmit`의 실패 콜백에서 `errors`를 처리하거나, 필드 컴포넌트가 `fieldState.error`를 표시합니다. (패턴은 §4.4·§6.3)

### Q: 환경별 빌드는 어떻게 하나요?

```bash
npm run build-dev   # 개발 환경 (.env.dev)
npm run build-stg   # 스테이징 환경 (.env.stg)
npm run build-prd   # 운영 환경 (.env.prd)
```

### Q: auto-import란 무엇인가요?

`unplugin-auto-import` 설정으로 다음을 import 없이 사용할 수 있습니다:

- React 훅 (`useState`, `useEffect`, `useMemo` 등)
- React Router (`useNavigate`, `useParams`, `useLocation` 등)
- `useTranslation` (i18n)

```tsx
// import 없이 바로 사용 가능!
function MyPage() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
}
```
