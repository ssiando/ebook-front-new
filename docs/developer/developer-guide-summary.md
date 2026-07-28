# Vanta Admin Front - 개발 가이드

> 빠르게 화면 하나를 추가하기 위한 최소 가이드입니다. 더 자세한 설명은 [Frontend 개발 문서](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1375993927/Frontend), 공통 컴포넌트 사용법은 [공통 컴포넌트 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1432551434), 그리드는 [Tanstack Datagrid 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1380155437/Tanstack+Datagrid)를 참고하세요.

---

## 1. 화면 구조

모든 페이지는 `@vanta/common`이 제공하는 `**PageTitle` → `PageSearch` → (선택) `PageTabs` → 본문**(그리드·폼 등) 순서로 조합합니다. 검색 영역이 없는 등록·상세 화면은 `PageSearch`를, 단일 뷰 화면은 `PageTabs`를 생략하면 됩니다.

> 📷 **스크린샷 자리** — 공통 페이지 UI 예시 이미지를 여기에 첨부하세요.

### 페이지 공통 컴포넌트로 구성한 예시

```tsx
// src/pages/products/ProductList.tsx → URL: /products/productList
import { PageSearch, PageTabs, PageTitle } from '@vanta/common';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import ProductContent from '@/components/products/list/ProductContent';
import ProductSearch from '@/components/products/list/ProductSearch';
import { productFormSchema } from '@/components/products/list/validation/formSchema';

const TABS = [
  { key: 'all', label: t('product.list.tabAll') },
  { key: 'active', label: t('product.list.tabActive') },
  { key: 'inactive', label: t('product.list.tabInactive') },
] as const;

export default function ProductList() {
  const { control, reset } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', status: '' },
  });
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('all');

  return (
    <>
      {/* 1. 타이틀 */}
      <PageTitle
        title={t('product.list.title')}
        tooltipContent={t('product.list.tooltip')}
        actionButtonsProps={{
          onSearch: () => {
            /* 조회 트리거 */
          },
        }}
      />

      {/* 2. 조회 영역 */}
      <PageSearch control={control}>
        <ProductSearch control={control} />
      </PageSearch>

      {/* 3. 탭 — 단일 뷰면 생략. activeKey/onChange는 외부 state로 제어 */}
      <PageTabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {/* 4. 본문 — 그리드·폼은 화면 전용 컴포넌트로 분리 */}
      <ProductContent activeTab={activeTab} />
    </>
  );
}
```

- `**PageTitle**` — 제목, 즐겨찾기, 툴팁, 액션 버튼(`actionButtonsProps`).
- `**PageSearch**` — 폼 `control`을 받아 검색·초기화를 자동 연결. 내부에 화면 전용 검색 컴포넌트만 넣습니다.
- `**PageTabs**` — `items: { key, label }[]` + 외부에서 `activeKey`·`onChange`로 제어하는 단순 탭 스트립. 활성 탭 키는 부모 페이지에서 `useState`로 보관하고 본문 컴포넌트에 내려보냅니다. 라우트 분기까지 가는 경우라면 별도 라우팅으로 처리합니다.
- **본문** — 그리드, 폼 등 화면 전용 컴포넌트(`components/{도메인}/{화면}/`)로 분리해 페이지를 얇게 유지합니다.

---

## 2. 폼 (Form)

폼은 **react-hook-form(RHF) + Zod**, 입력 컴포넌트는 `@vanta/common`의 `Form`* 시리즈를 씁니다. 자세한 prop 표는 [공통 컴포넌트 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1432551434) §1.2, 검증 흐름은 [Frontend 개발 문서](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1375993927/Frontend) §6.3을 참고하세요.

### 2.1 입력 컴포넌트

`control`과 `name`을 넘기면 RHF와 자동 연결됩니다.


| 컴포넌트             | 용도                   |
| ---------------- | -------------------- |
| `FormInput`      | 텍스트·숫자 등 단일 행 입력     |
| `FormSelect`     | 단일 / 멀티 셀렉트          |
| `FormCheckbox`   | 체크박스                 |
| `FormRadioGroup` | 라디오 그룹               |
| `FormTextarea`   | 여러 줄 텍스트             |
| `FormDatePicker` | 연·월·일·시간·기간 (`mode`) |
| `FormTiptap`     | 리치 텍스트 (HTML 문자열)    |
| `FormSearchLookup` | 돋보기 팝업 기반 단일 선택 룩업 |
| `FormSearchChips` | 돋보기 팝업 기반 다중 선택(칩) |
| `FormAutocomplete` | 검색 기반 단일 선택 자동완성    |
| `FormAutocompleteChips` | 검색 기반 다중 선택(칩)     |


### 2.2 검증 — `validateForm` (권장)

대부분의 일반 폼/화면에서는 필드별 검증 규칙을 하나의 객체로 정의한 뒤, `validateForm`에 넣어 Zod 스키마를 자동 생성합니다.
커스텀이 필요한 경우에는 `z.object({...})`를 직접 사용합니다.

각 필드는 반드시 `type` 속성으로 `'string' | 'number' | 'boolean' | 'enum'` 중 하나를 지정하는 discriminated union 형태로 작성합니다.  
규칙 객체를 분리할 때는 `defineFormRules`로 감싸면 `as const` 없이도 타입 추론이 정확하게 동작합니다.

```tsx
import { defineFormRules, showFormErrors, validateForm } from '@vanta/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const userFormRules = defineFormRules({
  name: {
    type: 'string',
    required: true,
    maxLength: 50,
    label: 'product.list.name', // i18n 키 — 기본 메시지 {{label}} 보간
    messages: {
      // 선택 — 기본 common.validation.msg.required 오버라이드
      required: 'product.list.validation.nameRequired',
    },
  },
  email: { type: 'string', required: true, email: true, label: 'product.list.email' },
  age: { type: 'number', min: 0, max: 150, label: 'product.list.age' },
  agree: { type: 'boolean', mustBeTrue: true, label: 'product.list.agree' },
});

const schema = validateForm(userFormRules);

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '', age: 0, agree: false },
});

// FormInput label은 같은 i18n 키를 t()로 표시
<FormInput
  control={control}
  name="name"
  label={t(userFormRules.name.label!)}
  required={userFormRules.name.required}
  maxLength={userFormRules.name.maxLength}
/>;

// 저장 시 handleSubmit이 검증을 트리거, 실패 시 showFormErrors가 팝업 알림
<Button onClick={() => void handleSubmit(onSave, (errors) => showFormErrors(errors, userFormRules))()}>저장</Button>;
```

- `type`: `'string'` · `'boolean'` · `'number'` · `'enum'` 중 하나 (필수).
- `label`: 기본 검증 메시지가 바라보는 값. **i18n 키 권장**(리터럴도 가능). `FormInput`에는 `t(label)`로 넘긴다.
- `messages`: 필요 시 `required` / `email` / `maxLength` 등 기본 `common.validation.msg.*`를 **필드별로 오버라이드** (i18n 키, `{{label}}` 보간 가능).
- `showFormErrors`를 `handleSubmit` 두 번째 인자로 넘기면 검증 실패 시 label이 보간된 팝업을 띄웁니다.
- `<form onSubmit>` 없이 `Button.onClick`에서 `void handleSubmit(...)()` 패턴이 팀 표준입니다.

---

## 3. 그리드 (DataGrid)

신규 화면의 그리드는 `@vanta/common`의 `**DataGrid` + `GridBtn` + `createColumns**` 조합. 자세한 패턴은 [Frontend 개발 문서](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1375993927/Frontend) §6.4 또는 [Tanstack Datagrid 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1380155437/Tanstack+Datagrid).

### 3.1 기본 골격

```tsx
import { DataGrid, GridBtn, createColumns } from '@vanta/common';
import type { DataGridHandle } from '@vanta/common';
import { useRef } from 'react';

type ProductRow = { id: number; name: string; status: string };

// ⚠️ 컬럼 정의는 컴포넌트 밖에 — 매 렌더마다 재생성하면 그리드 상태가 리셋됨
const COLUMNS = createColumns<ProductRow>([
  { header: 'ID', name: 'id', width: 60 },
  { header: '상품명', name: 'name', width: 200, editor: 'text', validation: { required: true } },
  {
    header: '상태',
    name: 'status',
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

### 3.2 핵심 포인트

- **컬럼 정의는 컴포넌트 밖에**: `createColumns(...)` 결과와 `options` 객체는 모듈 레벨 상수로 두거나 `useMemo`로 안정화. 매 렌더마다 새 배열·객체를 넘기면 그리드 내부 상태가 리셋됩니다.
- **컬럼 에디터**: `text` · `number` · `select` · `date` · `checkbox` · 없음(읽기 전용). `editor` 미지정 컬럼은 자동으로 회색 배경이 적용됩니다.
- **셀 렌더러**: `BadgeCell`, `CheckboxCell`, `DateTimeCell`, `LinkCell`, `ProgressCell` — 모두 `@vanta/common`에서 import. 커스텀이 필요하면 `cellRenderer: ComponentType<CellRendererProps<T>>`.
- **이벤트 처리**: `on*` prop 없음. `**onReady` 콜백에서 `api.bind('cellClick', ...)`** 또는 `**gridRef.current?.bind(...)**`. `before*` 이벤트(`beforeChange` / `beforeRemoveRow` / `beforeCellClick` 등)는 핸들러에서 `e.preventDefault()`로 후속 동작 차단 가능.
- **편집 중 키보드**: 내장 에디터는 Enter 커밋 / Escape 취소 / Tab → 커밋 후 다음 편집 셀로 이동·자동 편집 시작 (Shift+Tab은 이전 셀). 별도 옵션·코드 없이 동작.
- **체크박스가 행 처리의 표준**: 체크된 행은 `getCheckedRows()` / `getCheckedRowKeys()`로 조회, 일괄 삭제는 `removeCheckedRows()`. `selectionConstraint` 기반의 `getSelectedRow*()`는 셀 단위 선택 등 별도 시나리오에만 사용.
- **GridBtn `isMinus` default 동작**: `minusFunction` 미제공 시 *체크된 행 중* `'I'`(신규 추가) 상태인 행만 즉시 제거합니다. 기존 행을 백엔드와 함께 지우려면 `minusFunction`을 직접 주입하거나 `extraButtons`로 별도 "삭제" 버튼을 추가하세요.

### 3.3 변경 추적과 저장

DataGrid는 행마다 `_rowStatus`(`normal`/`I`/`U`/`D`)를 자동 추적합니다. 저장 시 `getModifiedRows()` 한 번이면 백엔드로 보낼 페이로드가 분류돼 나옵니다.

```tsx
const handleSave = async () => {
  const { createdRows, updatedRows, deletedRows } = gridRef.current!.getModifiedRows();
  if (createdRows.length === 0 && updatedRows.length === 0 && deletedRows.length === 0) {
    toast('저장할 변경이 없습니다.');
    return;
  }
  await api.saveProducts({ createdRows, updatedRows, deletedRows });
  await refetch();
};
```

`showRowStatus`는 기본값 `true`로 좌측에 색상 점이 표시돼 어떤 행이 추가·수정됐는지 사용자에게도 보입니다. 숨기려면 `showRowStatus: false`로 설정합니다.

### 3.4 페이지네이션 연동

- **page size**: `GridBtn` — `isPaging`, `totalCount`, `pageSize`, `setPageSize`, `setCurrentPage`
- **페이지 이동**: `Pagination` — `pageResponse`, `onPageChange`

```tsx
<GridBtn
  gridRef={gridRef}
  gridBtn={{
    isPaging: true,
    totalCount: pageData?.totalElements,
    pageSize,
    setPageSize,
    setCurrentPage: setPageIndex,
  }}
/>
<DataGrid ref={gridRef} columns={COLUMNS} data={pageData?.content ?? []} options={GRID_OPTIONS} />
<Pagination pageResponse={pageData} onPageChange={setPageIndex} />
```

`pageSizeOptions`는 화면마다 다를 때만 GridBtn에 명시. 생략 시 15/30/50 기본.

### 3.5 자주 쓰는 그리드 옵션


| 옵션                     | 효과                                                      |
| ---------------------- | ------------------------------------------------------- |
| `height`               | 스크롤 컨테이너 높이.                                            |
| `rowHeaders`           | 좌측 부가 컬럼 — `[{ type: 'rowNum' }, { type: 'checkbox' }]` |
| `editingEvent`         | 편집 진입 트리거 — `'click'` / `'dblclick'` (기본)               |
| `showRowStatus`        | 변경된 행에 색상 점 표시 (기본 `true`, 숨기려면 `false`)          |
| `enableRowDragDrop`    | 행 DnD                                                   |
| `enableColumnDragDrop` | 컬럼 순서 변경 DnD                                            |
| `enableRangeSelection` | 셀 범위 드래그 선택 + 클립보드                                      |
| `enableUndoRedo`       | Undo/Redo 스택 (`undo()` / `redo()` 메서드 사용 가능)            |
| `selectionConstraint`  | 선택 모드(`'singleRow'` 등) · 선택 가능 컬럼·행 제약                  |
| `footerData`           | 합계 행 표시                                                 |


### 3.6 트리 그리드

자식 노드를 가진 데이터는 `treeOptions`로 트리 그리드로 전환됩니다.

```tsx
<DataGrid
  data={deptTree}
  columns={treeColumns}
  treeOptions={{ keyField: 'code' }} // 자식 필드 기본값은 'subRows'
  options={{ height: 400, treeDefaultExpanded: true }}
/>
```

지연 로딩이 필요하면 `lazyLoadEmptyChildren: true` + `treeLazyRequest` 이벤트로 자식 로드를 처리합니다. 자세한 패턴은 [Tanstack Datagrid 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1380155437/Tanstack+Datagrid) §12 참고.

---

## 4. 스토어 (Zustand)

상태 관리는 두 갈래입니다. 공통 스토어는 **로컬에 같은 종류를 새로 만들지 않습니다.** 자세한 메서드 시그니처는 [공통 컴포넌트 가이드](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1432551434) §2 · §7, 패턴 배경은 [Frontend 개발 문서](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1375993927/Frontend) §4.7.

### 4.1 공통 스토어 — `@vanta/common`


| 스토어               | 저장 데이터               |
| ----------------- | -------------------- |
| `useAuthStore`    | 로그인 유저 정보, 토큰        |
| `useLoadingStore` | API 로딩 상태            |
| `useProgramStore` | 사이드바 메뉴 구조           |
| `useTabStore`     | 열린 탭 목록              |
| `usePopupStore`   | 모달 / alert / confirm |
| `useCodeStore`    | 공통코드 캐시              |


```tsx
import { EMPTY_CODE_LIST, useAuthStore, useCodeStore } from '@vanta/common';

const userName = useAuthStore((s) => s.user?.name);
const statusOptions = useCodeStore((s) => s.getCodeList('STATUS_CD')) ?? EMPTY_CODE_LIST;
```

> `**EMPTY_CODE_LIST` 사용 필수**: 셀렉터에서 인라인 `?? []`를 쓰면 매 렌더마다 새 배열 참조가 생겨 무한 리렌더를 유발합니다.

### 4.2 업무용 스토어 — `src/store/biz/`

특정 업무 도메인에서만 공유하는 클라이언트 상태(선택, 토글, 임시 필터 등)는 `**src/store/biz/{도메인}-store.ts`**. 공통 스토어와 섞이지 않게 반드시 `biz/` 하위에 둡니다.

```ts
// src/store/biz/sample-store.ts
import { create } from 'zustand';

interface SampleState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  reset: () => void;
}

export const useSampleStore = create<SampleState>()((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  reset: () => set({ selectedId: null }),
}));
```

> 서버에서 받아온 목록·상세는 React Query가 캐시하므로 **biz 스토어에 다시 저장하지 않습니다.** 화면 간 공유가 필요한 클라이언트 상태만 둡니다.

---

## 5. 개발 예시

상품(Product) 관리 화면을 새로 만든다고 가정합니다.

### 5.1 메뉴 등록

`admin-dev`(관리자 개발 화면)에서 **메뉴 / 프로그램 / API**를 먼저 등록합니다. 메뉴 코드와 라우트 경로(`/products/productList`)가 일치해야 권한 매핑이 올바르게 동작합니다.

> 📷 **스크린샷 자리** — admin-dev 메뉴 등록 화면 이미지를 여기에 첨부하세요.

### 5.2 페이지 공통 컴포넌트로 구성

위 §1 예시와 동일한 구조로 `src/pages/products/ProductList.tsx`를 작성합니다. 검색 영역은 `components/products/list/ProductSearch.tsx`, 본문은 `components/products/list/ProductContent.tsx`로 분리합니다.

```tsx
// src/components/products/list/ProductSearch.tsx
import { FormInput, FormSelect } from '@/components/common/form';
import type { Control } from 'react-hook-form';

export default function ProductSearch({ control }: { control: Control }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormInput control={control} name="name" label={t('product.list.name')} />
      <FormSelect
        control={control}
        name="status"
        label={t('product.list.status')}
        options={[
          { label: t('product.list.statusActive'), value: 'active' },
          { label: t('product.list.statusInactive'), value: 'inactive' },
        ]}
      />
    </div>
  );
}
```

본문(`ProductContent`)은 그리드를 쓸 경우 위 §3 예시처럼 `DataGrid` + `GridBtn`을 조합합니다.

#### 페이지 단위 풀 조합 예시 — `PageTitle` + `PageSearch` + `PageTabs` + 도메인 컨텐트

탭으로 활성/중지 상태를 분기하고 본문은 도메인 컴포넌트(`ProductContent`)로 위임하는 패턴입니다. 본문 컴포넌트 내부에는 그리드·폼·페이지네이션 등이 캡슐화돼 있다고 보고, 페이지는 **상태와 핸들러 조합·레이아웃**만 담당합니다.

```tsx
// src/pages/products/ProductList.tsx → URL: /products/productList
import { PageSearch, PageTabs, PageTitle } from '@vanta/common';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import ProductContent from '@/components/products/list/ProductContent';
import ProductSearch from '@/components/products/list/ProductSearch';
import type { ProductSearchValues, ProductTabKey } from '@/components/products/list/types';
import { productFormSchema } from '@/components/products/list/validation/formSchema';

const TABS: { key: ProductTabKey; label: string }[] = [
  { key: 'all', label: t('product.list.tabAll') },
  { key: 'active', label: t('product.list.tabActive') },
  { key: 'inactive', label: t('product.list.tabInactive') },
];

export default function ProductList() {
  const [activeTab, setActiveTab] = useState<ProductTabKey>('all');
  const [appliedSearch, setAppliedSearch] = useState<ProductSearchValues>({ name: '', status: '' });

  const { control, handleSubmit, reset } = useForm<ProductSearchValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', status: '' },
  });

  const handleSearch = handleSubmit((values) => setAppliedSearch(values));
  const handleReset = () => {
    reset({ name: '', status: '' });
    setAppliedSearch({ name: '', status: '' });
  };

  return (
    <>
      {/* 1. 타이틀 + 액션 (조회 버튼 클릭 시 form submit) */}
      <PageTitle
        title={t('product.list.title')}
        tooltipContent={t('product.list.tooltip')}
        actionButtonsProps={{ onSearch: handleSearch }}
      />

      {/* 2. 조회 영역 */}
      <PageSearch control={control}>
        <ProductSearch control={control} />
      </PageSearch>

      {/* 3. 탭 — 활성 상태 키만 본문에 전달, 본문 내부에서 데이터 분기 */}
      <PageTabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {/* 4. 본문 — 그리드/페이지네이션/저장 로직은 컴포넌트 내부에 캡슐화 */}
      <ProductContent activeTab={activeTab} search={appliedSearch} />
    </>
  );
}
```

- **검색 트리거 일원화**: `PageTitle.actionButtonsProps.onSearch`와 `PageSearch.onReset` 모두 같은 `handleSubmit` / `reset` 흐름을 거치므로 탭과 폼이 따로 놀지 않습니다.
- `**ProductContent`는 컴포넌트 경계**: 그리드, 정렬·필터·페이지네이션, 저장 로직은 이 컴포넌트 내부에 모이고, 페이지는 `activeTab`과 `search` 두 props만 내려줍니다.
- **탭 분기는 본문에서 처리**: `activeTab`을 받아 React Query 키나 클라이언트 필터 조건으로 변환합니다. 라우트까지 분리해야 한다면 `PageTabs` 대신 자식 라우트로 가세요.

### 5.3 API 작성 및 호출

axios 호출 함수는 도메인별로 `src/api/{도메인}-api.ts`에 모읍니다. 인증·로딩·에러 처리는 `@vanta/common`의 `http` 인터셉터가 자동으로 해 줍니다.

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

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await http.patch(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  await http.delete(`/products/${id}`);
}
```

페이지에서는 호출 결과를 `useState` + `useEffect`로 다루는 게 기본입니다. **여러 화면이 공유하거나 저장 후 재요청·캐시 무효화가 필요하면** `src/query/{도메인}-query.ts`에 React Query 훅을 추가합니다(Optional).

### 5.4 다국어 처리

번역 파일은 `**src/i18n/locales/{ko,en}/`** 아래에 둡니다. **대메뉴별로 파일을 분리**하며, 파일명이 곧 1-depth 키입니다.

- 위치: `src/i18n/locales/ko/{대메뉴}.json`, `src/i18n/locales/en/{대메뉴}.json`
- 키 구조: **3-depth** — `{대메뉴}.{화면|기능}.{key}` (1-depth 명 = 파일명 = 대메뉴 명)
- 파일을 새로 추가하면 `src/i18n/index.ts`의 `import.meta.glob`이 자동으로 로드합니다 (init 코드 수정 불필요).

```json
// src/i18n/locales/ko/product.json
{
  "product": {
    "list": {
      "title": "상품 관리",
      "name": "상품명",
      "status": "상태",
      "statusActive": "활성",
      "statusInactive": "중지"
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
      "status": "Status",
      "statusActive": "Active",
      "statusInactive": "Inactive"
    },
    "form": {
      "create": "Create Product"
    }
  }
}
```

> 사용자에게 보이는 **모든 문자열은 `t()` 함수**로 감쌉니다. `useTranslation`은 auto-import 되어 있어 별도 import가 필요 없습니다. ko/en 양쪽 파일에 동일 키를 반드시 함께 추가하세요.

---

## 6. 프로젝트 구조

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
│   └── {도메인}/     🎯 화면 전용 조각 (예: products/list/)
├── pages/            📱 파일 기반 라우팅 — PascalCase.tsx → camelCase URL
├── query/            🔄 React Query 훅 (도메인별 *-query.ts, Optional)
├── store/biz/        🗄️ 업무 도메인 전용 Zustand (공통 store는 @vanta/common)
├── hooks/            🪝 전사 공통 훅 — 신규 추가 금지
├── lib/              📚 keycloak 등 외부 라이브러리 설정
├── utils/            🛠️ 순수 유틸 (formUtils 등)
├── types/            📋 공통 타입
├── i18n/             🌐 다국어 (locales/{ko,en}/{대메뉴}.json)
├── providers/        🔌 앱 레벨 Provider
└── data/             📁 정적 데이터 (menu.json 등)
```

핵심 원칙:

- **페이지는 얇게.** UI 덩어리는 `components/{도메인}/{화면}/`로 분리합니다.
- **서버 상태 vs 클라이언트 상태 분리.** 서버 데이터는 axios + (Optional) React Query, 화면 간 공유 클라이언트 상태만 `store/biz/`에.
- **공통 스토어**(auth/popup/loading/menu/tab/code)는 `@vanta/common`에서 제공 — 로컬에 같은 종류를 새로 만들지 않습니다.
- **신규 화면의 그리드**는 `@vanta/common`의 `DataGrid` + `GridBtn`. 기존 TUI Grid 화면은 수정 시 패턴 존중.

---

## 7. 코드 컨벤션

### 7.1 파일/폴더 네이밍


| 종류                         | 규칙                                      | 예시                                      |
| -------------------------- | --------------------------------------- | --------------------------------------- |
| 일반 파일                      | kebab-case                              | `create-crud-service.ts`                |
| 컴포넌트 파일                    | PascalCase                              | `Button.tsx`, `ProductSearch.tsx`       |
| 페이지 컴포넌트                   | PascalCase (`vite-plugin-pages` 자동 라우트) | `ProductList.tsx` → `/productList`      |
| 훅 파일                       | `use-*.ts` (kebab-case)                 | `use-authorized.ts`                     |
| API 모듈                     | `{도메인}-api.ts`                          | `product-api.ts`                        |
| Query 모듈                   | `{도메인}-query.ts`                        | `product-query.ts`                      |
| Zustand (`src/store/biz/`) | `{도메인}-store.ts`                        | `sample-store.ts`                       |
| 화면 전용 상수/타입                | `constants.ts`, `types.ts`              | `components/products/list/constants.ts` |
| i18n 번역 파일                 | `{대메뉴}.json`                            | `i18n/locales/ko/product.json`          |


### 7.2 코드 네이밍


| 종류                | 규칙               | 예시                                      |
| ----------------- | ---------------- | --------------------------------------- |
| 컴포넌트 / 타입 / 인터페이스 | PascalCase       | `ProductList`, `interface Product`      |
| 함수 / 변수 / 훅       | camelCase        | `getProductList`, `useProductListQuery` |
| 상수                | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`                         |


### 7.3 Import 규칙

- 경로 별칭 `@/` (= `src/`) 사용. 깊은 상대 경로(`../../../`) 금지.
- React 훅 / React Router / `useTranslation`은 **auto-import** — 별도 import 불필요.
- import 정렬은 ESLint(`simple-import-sort`)가 자동 처리.

```tsx
import { Button } from '@/components/common/ui';
import { getProductList } from '@/api/product-api';
import { http } from '@vanta/common';
```

### 7.4 페이지 / API / Query export 규칙

- **페이지 컴포넌트는 기본 export** (vite-plugin-pages 요구).
- 그 외(API 함수, query 훅, util, 일반 컴포넌트, 상수)는 **named export** 기본.

### 7.5 스타일 — 테마 토큰

`#605cff` 같은 raw hex 금지. 반드시 Tailwind 테마 토큰(`bg-primary`, `text-text-heading`, `border-border` 등)을 사용합니다. 자주 쓰는 토큰 목록은 [Frontend 개발 문서](https://cj4dplex.atlassian.net/wiki/spaces/VANTA/pages/1375993927/Frontend) §7 참고.

### 7.6 감사 컬럼 (DB 표준)


| 변경 전        | 변경 후     | 용도     |
| ----------- | -------- | ------ |
| `createdAt` | `regDtm` | 등록일시   |
| `updatedAt` | `updDtm` | 수정일시   |
| `deletedAt` | `delDtm` | 삭제일시   |
| `createdBy` | `regrId` | 등록자 ID |
| `updatedBy` | `updrId` | 수정자 ID |


### 7.7 커밋 메시지

Conventional Commits + 한국어 본문. commitlint가 검사합니다.

```
feat: 상품 목록 페이지 추가
fix: 로그인 시 토큰 갱신 오류 수정
refactor: API 서비스 팩토리 패턴 적용
docs: 가이드 요약본 추가
```

