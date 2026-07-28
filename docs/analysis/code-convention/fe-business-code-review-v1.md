# 1. 특이 케이스 질문

- 공통 컴포넌트를 wrapping 하여 사용하는 사례가 식별되었습니다. 어떤 요구사항에서 wrapping이 필요했는지 확인을 요청드리며, 특별한 사유가 없다면 직접 사용을 권고드립니다.
  - 대상 예시: `vanta-vfx-front/src/components/common/lookup/CommonLookup.tsx`

# 2. 컨벤션 목록


| No. | 항목                         | 내용                                                                                                   |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | 주석                         | 모든 소스 파일 최상단 `@file` JSDoc 헤더 + 컴포넌트 내부 3구역(상태/함수/화면) 주석 누락·경로 오기 정비                                 |
| 2   | props 과다 전달(컴포넌트 책임 분리)    | 페이지가 페이지네이션·query·로딩 상태까지 소유해 Content/Grid에 과도한 props를 내리는 패턴을 책임 분리 기준으로 정비                         |
| 3   | auto-import                | `useState`·`useTranslation`·`useNavigate` 등 auto-import 대상의 명시 import 제거                             |
| 4   | 다국어 처리(누락/컨벤션 위반)          | 한글 하드코딩 → `t()` 적용, 4뎁스 호출·비표준 키 등 3뎁스 키 컨벤션 위반 정비                                                   |
| 5   | .ts 분리 (grid.ts, types.ts) | 컬럼 정의는 `*-grid.ts`로, 화면 전용 타입(행·검색·폼 타입)은 `types.ts`로 분리한다. Content/Page 안에 인라인으로 두지 않음              |
| 6   | 파일명 kebab-case             | `*.ts`(grid·schema·util 등) 파일명은 kebab-case로 작성한다. camelCase·PascalCase 금지 (컴포넌트 `*.tsx`만 PascalCase) |


# 3. 주요 컨벤션 위반 사례

## 3.1 주석

**파일 최상단** — 모든 소스 파일 맨 위에 `@file` JSDoc 블록.

```typescript
/**
 * @file pages/node/NodeList.tsx
 * @description 노드 관리 페이지
 * ---------------------------------------------------------------------
 * Date                     AUTHOR                  MAJOR_ISSUE
 * ---------------------------------------------------------------------
 * 2026.06.18               vanta genx              신규 생성
 */
```

**컴포넌트 내부 3구역** — 페이지·Content 등에서 상태 / 함수 / 화면(또는 hook)을 구분.

```typescript
export default function NodeList() {
  /*
   * ---------------------------------------------------------------------
   * 상태/폼/서버 조회
   * ---------------------------------------------------------------------
   */
  const { control, handleSubmit } = useForm(...);
  const [appliedSearch, setAppliedSearch] = useState(...);

  /*
   * ---------------------------------------------------------------------
   * 함수
   * ---------------------------------------------------------------------
   */
  const handleSearch = handleSubmit((values) => { ... });

  /*
   * ---------------------------------------------------------------------
   * 화면
   * ---------------------------------------------------------------------
   */
  return ( ... );
}
```

## 3.2 props 과다 전달 (컴포넌트 책임 분리)

props 비대화는 줄여야 할 양의 문제가 아니라 **책임 경계가 어긋났다는 신호**다. 페이지네이션·목록 query·로딩처럼 자식의 내부 관심사를 부모가 대신 들고 내려보내는 구조는 지양한다.

상태는 그것을 실제로 사용하는 컴포넌트가 소유하고(상태 지역화), 부모는 자식이 스스로 처리할 수 없는 **업무 흐름**(검색 조건, 저장·삭제 액션)만 넘긴다. 책임이 제자리에 있으면 props는 자연히 정돈된다.

예) 목록 그리드는 page/size/sort·목록 query를 스스로 소유하는 관심사다. 부모 페이지는 이를 알 필요가 없으므로 관련 state·핸들러는 Content가 가진다.

### 수정 전 (genx `BbsList` — 페이지가 페이지네이션·query까지 소유, props 13개)

```typescript
// 페이지 — pageInfo·useQuery·페이지네이션 핸들러를 모두 소유
const [pageInfo, setPageInfo] = useState<PageRequest>({ page: 0, size: 15, ... });
const { data: bbsPage } = useQuery({
  queryKey: [BBS_LIST, workspaceId, ...getObjectValues(pageInfo)],
  queryFn: () => getAsBbsList(pageInfo),
});
const handlePageChange = (page: number) => setPageInfo((p) => ({ ...p, page }));
const handlePageSizeChange = (size: number) => setPageInfo((p) => ({ ...p, page: 0, size }));

<BbsListContent
  gridRef={gridRef}
  pageData={bbsPage}           // 목록 데이터
  bbsUpdanPage={bbsUpdanPage}
  isLoading={false}
  isError={false}
  pageInfo={pageInfo}          // 페이지네이션 state
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  onCellClick={handleCellClick}
  onPin={handlePin}
  onUnpin={handleUnpin}
  onDelete={handleDelete}
  onChangeOrder={handleOpenPinModal}
/>
```

### 수정 후 (`BbsList` 리팩터링 — 페이지네이션·목록 query를 Content로 이전, props 13 → 7개)

목록 상태(pageInfo)·목록 query·페이지네이션 핸들러는 Content가 소유한다. 페이지는 상단 고정 목록(`bbsUpdanPage`)·행 클릭·핀/삭제/순서변경 같은 **업무 흐름과 모달**만 남긴다. (검색 폼이 없는 화면이라 검색 조건 props는 없다.)

```typescript
// 페이지 — 업무 액션·모달 흐름만 소유 (gridRef + 업무 데이터/콜백 6개)
<BbsListContent
  gridRef={gridRef}
  bbsUpdanPage={bbsUpdanPage}   // 상단 고정 목록 — 모달과 공유하는 업무 데이터
  onCellClick={handleCellClick} // 행 클릭 → 등록/수정 모달(모달은 페이지가 소유)
  onPin={handlePin}
  onUnpin={handleUnpin}
  onDelete={handleDelete}
  onChangeOrder={handleOpenPinModal}
/>
```

```typescript
// Content — 목록 상태·query·페이지네이션을 내부에서 소유 (workspaceId는 store에서 직접 읽음)
const workspaceId = useActiveContextStore((s) => s.workspaceId);
const [pageInfo, setPageInfo] = useState<PageRequest>({
  page: 0,
  size: 15,
  sortField: 'id',
  sortDirection: 'DESC',
});

const { data: bbsPage } = useQuery({
  queryKey: [QueryKeyRoot.BBS_LIST, workspaceId, ...getObjectValues(pageInfo)],
  queryFn: () => getAsBbsList(pageInfo),
});

const handlePageChange = (page: number) => setPageInfo((p) => ({ ...p, page }));
const handlePageSizeChange = (size: number) => setPageInfo((p) => ({ ...p, page: 0, size }));
// → pageData·isLoading·isError·onPageChange·onPageSizeChange·pageInfo props가 사라진다(Content 내부 완결)
```

## 3.3 .ts 분리 (grid.ts, types.ts)

화면 컴포넌트 안에 인라인으로 두지 않고 별도 파일로 분리한다. **컬럼 정의(`createColumns(...)`)는 `*-grid.ts`**, **화면 전용 타입(행·검색·폼 타입 등)은 `types.ts`**.

목적:

- 화면 컴포넌트는 조회 흐름·이벤트·레이아웃에 집중하고, 컬럼 스키마·타입 정의는 별도 파일에서 관리한다.
- 정의가 길어져도 Content/Page 본문이 무너지지 않고, 재사용·테스트·리뷰가 쉬워진다.
- formatter·renderer·meta가 붙는 복잡한 그리드, 여러 컴포넌트가 공유하는 타입일수록 분리해야 변경 영향 범위가 선명해진다.

```typescript
// ❌ Content 안에 컬럼·타입 인라인 정의
export default function NodeListContent() {
  type NodeRow = { nodeId: number; nodeName: string };          // 타입 인라인
  const columns = createColumns<NodeRow>([                       // 컬럼 인라인
    { key: 'nodeId', header: 'ID' },
    { key: 'nodeName', header: '노드명' },
  ]);
  return <DataGrid columns={columns} ... />;
}
```

```typescript
// ✅ types.ts / node-list-grid.ts 로 분리
// types.ts
export type NodeRow = { nodeId: number; nodeName: string };
// node-list-grid.ts
export const NODE_LIST_COLUMNS = createColumns<NodeRow>([
  { key: 'nodeId', header: 'ID' },
  { key: 'nodeName', header: '노드명' },
]);

// Content
import type { NodeRow } from './types';
import { NODE_LIST_COLUMNS } from './node-list-grid';

export default function NodeListContent() {
  return <DataGrid columns={NODE_LIST_COLUMNS} ... />;
}
```

대표 위반 예: `createColumns(...)`를 컴포넌트 내부에 직접 선언(grid.ts 미분리)하거나, 행·폼 타입을 컴포넌트 파일에 인라인 정의(types.ts 미분리)한 경우.

## 3.4 auto-import

React 훅(`useState`·`useEffect`·`useCallback`·`useMemo`·`useRef`·`useImperativeHandle` 등), React Router(`useNavigate`·`useParams`·`useLocation`·`Link`·`Navigate`·`Outlet` 등), `useTranslation`은 프로젝트 **auto-import** 대상이다(`auto.d.ts` 기준). 따라서 이들은 **명시적으로 import 하지 않는다**.

- `useNavigate`도 import 없이 `const navigate = useNavigate();`로 사용한다.

```typescript
// ❌ auto-import 대상을 명시 import
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ✅ — 훅은 import 없이 사용, @/ 절대경로 모듈만 import
import { PageTitle } from '@vanta/common';
import { useNodeListQuery } from '@/query/node-query';

export default function NodeList() {
  const { t } = useTranslation(); // import 없이 선언만
  const navigate = useNavigate(); // import 없이 선언만
  // ...
}
```

## 3.5 i18n — 라벨·메시지 키 구조

#### 라벨 위반 케이스


| 케이스           | 설명                                                        | ❌ 잘못                            | ✅ 올바름                              |
| ------------- | --------------------------------------------------------- | ------------------------------- | ---------------------------------- |
| t 직접 import   | `useTranslation` 대신 전역 `t`를 import — 언어 전환에 반응 안 함        | `import { t } from 'i18next'`   | `const { t } = useTranslation()`   |
| 업무 라벨이 3뎁스 아님 | 업무 화면 라벨은 3뎁스 고정인데 4뎁스로 호출                                | `t('bbs.list.col.bbsId')` (4뎁스) | `t('bbs.col.bbsId')` (3뎁스)         |
| 1뎁스 키가 시스템명   | JSON 최상위를 시스템명으로 래핑 → DB 이관 시 시스템 prefix와 중복(`aion.aion`) | `{ "aion": { … } }` (aion.json) | 중메뉴를 1뎁스로 `{ "dashboard": { … } }` |
| 한글 하드코딩       | UI 문자열을 `t()` 없이 한글 직접 기입                                 | `label: '전체'`                   | `t('deployment.search.statusAll')` |


```tsx
// ① t 직접 import — 언어 전환 미반응
import { t } from 'i18next';             // ❌
const { t } = useTranslation();          // ✅

// ② 업무 라벨이 3뎁스 아님
t('bbs.list.col.bbsId')                  // ❌ 4뎁스
t('bbs.col.bbsId')                       // ✅ 3뎁스

// ③ 1뎁스 키가 시스템명 (aion.json) — 추후 시스템 prefix와 aion.aion 중복
{
  "aion": {                              // ❌ 최상위 = 시스템명
    "dashboard": {
      "pageTitle": "프로젝트 현황 대시보드",
      "scheduleYear": "스케줄 연도",
      "noChartData": "표시할 차트 데이터가 없습니다.",
{ "dashboard": {...} }                   // ✅ 중메뉴 = 1뎁스

// ④ 한글 하드코딩
label: '전체'                             // ❌
label: t('deployment.search.statusAll')  // ✅
```

- 대표 사례: **genx**(bbs·node·nodehist·work)는 `namespace.list.area.key` 구조라 거의 모든 호출이 4뎁스 → `list` 단계를 없애 3뎁스로 재구성. **aion**은 `aion.json` 최상위가 시스템명 `aion`이라 중메뉴 단위로 분리 필요.

#### 배경 (JSON 파일 → DB i18n)

- **지금 (FE JSON)**: 중메뉴 단위 JSON 파일(`user-permission.json` 등)에 키를 넣고, 코드에서는 `t()` 인자를 3뎁스(점 2개)로 고정한다.
- **이후 (DB i18n)**: 맨 앞에 **시스템명**(`admin` · `genx` · `vfx` …)이 붙어 **저장·조회 키는 최종 4뎁스**가 된다.

```
[FE 코드 t() 호출]     namespace . area . specificKey     ← 3뎁스 (점 2개)
[DB 최종 키]     system . namespace . area . specificKey ← 4뎁스 (점 3개)
```

FE 단계에서부터 3뎁스만 쓰는 이유는, DB 이관 시 **시스템 prefix만 앞에 붙이면** 되도록 키 공간을 남겨 두기 위함이다.  
그래서 코드에서 **4뎁스로 `t()` 호출하는 것은 전부 위반**이다.

단, common-fe의 라벨은 시스템명이 common 이므로 4뎁스로 호출한다.

## 3.6 .ts 파일 kebab-case

`*.ts` 파일(grid·schema·util 등)의 파일명은 **kebab-case**로 작성한다. camelCase·PascalCase는 위반이다. (컴포넌트 `*.tsx`만 PascalCase)

```
// ❌
nodeListSearchSchema.ts
CreateVersionSchema.ts
buildBasicAssetReq.ts

// ✅
node-list-search-schema.ts
create-version-schema.ts
build-basic-asset-req.ts
```

# 4. 업무파트 FE 코드 컨벤션 점검 (총 486건 — 화면별 271 + types.ts 167 + kebab 48)

> 점검일: 2026-06-25  
> 대상: genx · vfx · aion · asset · 4dx (5개 시스템) desk · sx 는 업무 화면이 모두 `pages/project`·`components/project`(샘플) 하위라 식별 대상 없음  
> 제외: 전 시스템 `pages/project`·`components/project`(샘플), samples/popup 예시  
> 위반유형: ①주석 ②props·페이지네이션 책임 ③auto-import ④다국어 ⑤.ts 분리(grid.ts·types.ts) ⑥파일명 kebab-case

## types.ts 미분리 — 전 시스템 공통 (4개 시스템 · 167개)


| No. | 시스템명  | 화면(컴포넌트) | 컨벤션 위반         | 위반 소스코드(짧게)                                         | 수정 방향        | 작업여부 | 코드 위치                               |
| --- | ----- | -------- | -------------- | --------------------------------------------------- | ------------ | ---- | ----------------------------------- |
| 1   | genx  | genx 전반  | ⑤ types.ts 미분리 | 화면 전용 타입(행·폼)을 컴포넌트에 인라인 정의, types.ts 파일 없음(26개 파일) | types.ts로 분리 |      | genx 전 컴포넌트                         |
| 2   | vfx   | vfx 전반   | ⑤ types.ts 미분리 | 화면 전용 타입(행·폼)을 컴포넌트에 인라인 정의, types.ts 파일 없음(70개 파일) | types.ts로 분리 |      | vfx 전 컴포넌트(commmng·budget·stdmng 등) |
| 3   | aion  | aion 전반  | ⑤ types.ts 미분리 | 화면 전용 타입(행·폼)을 컴포넌트에 인라인 정의, types.ts 파일 없음(50개 파일) | types.ts로 분리 |      | aion 전 컴포넌트                         |
| 4   | asset | asset 전반 | ⑤ types.ts 미분리 | 화면 전용 타입(행·폼)을 컴포넌트에 인라인 정의, types.ts 파일 없음(21개 파일) | types.ts로 분리 |      | asset 전 컴포넌트                        |


## 파일명 kebab-case — 전 시스템 공통 (4개 시스템 · 48개)


| No. | 시스템명  | 화면(컴포넌트) | 컨벤션 위반           | 위반 소스코드(짧게)                      | 수정 방향          | 작업여부 | 코드 위치                                                   |
| --- | ----- | -------- | ---------------- | -------------------------------- | -------------- | ---- | ------------------------------------------------------- |
| 1   | genx  | genx 전반  | ⑥ 파일명 kebab-case | schema 5개 (camelCase·PascalCase) | kebab-case로 변경 |      | `nodeListSearchSchema.ts`·`CreateVersionSchema.ts` 등 5개 |
| 2   | vfx   | vfx 전반   | ⑥ 파일명 kebab-case | schema·util 9개                   | kebab-case로 변경 |      | `manCostChgSchema.ts`·`Distributor.ts` 등 9개             |
| 3   | aion  | aion 전반  | ⑥ 파일명 kebab-case | schema·util 20개                  | kebab-case로 변경 |      | `deploymentSchema.ts`·`buildGpuNodeLabel.ts` 등 20개      |
| 4   | asset | asset 전반 | ⑥ 파일명 kebab-case | schema·util 14개                  | kebab-case로 변경 |      | `categorySearchSchema.ts`·`buildBasicAssetReq.ts` 등 14개 |


## 화면별 점검


| No. | 시스템명  | 화면(컴포넌트)                                  | 컨벤션 위반                          | 위반 소스코드(짧게)                                                                                                        | 수정 방향                          | 작업여부 | 코드 위치                                                                                               |
| --- | ----- | ----------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---- | --------------------------------------------------------------------------------------------------- |
| 1   | genx  | BbsList                                   | ① 파일 헤더 없음                      | `/* eslint-disable */`로 시작, JSDoc 없음                                                                               | `@file` 헤더 추가                  |      | `pages/bbs/BbsList.tsx:1`                                                                           |
| 2   | .     | .                                         | ① 페이지 3구역 주석 없음                 | 상태/함수/화면 구분선 없음                                                                                                    | 3구역 구분선 추가                     |      | `pages/bbs/BbsList.tsx:27-200`                                                                      |
| 3   | .     | .                                         | ② 페이지네이션 책임 위치                  | `pageInfo`·`useQuery`·`isLoading` 소유 후 Content 전파                                                                  | Content로 이전                    |      | `pages/bbs/BbsList.tsx:37-52,149-185`                                                               |
| 4   | .     | NodeList                                  | ① 파일 헤더 없음                      | import로 바로 시작                                                                                                      | 헤더 추가                          |      | `pages/node/NodeList.tsx:1`                                                                         |
| 5   | .     | .                                         | ② 페이지네이션 책임 위치                  | `pageInfo`·query·`isLoading` 소유 후 전파                                                                               | Content로 이전                    |      | `pages/node/NodeList.tsx:60-70,141-169`                                                             |
| 6   | .     | WorkList                                  | ① 파일 헤더 없음                      | `eslint-disable`+import                                                                                            | 헤더 추가                          |      | `pages/work/WorkList.tsx:1`                                                                         |
| 7   | .     | .                                         | ① 페이지 3구역 주석 없음                 | 구분선 없음                                                                                                             | 추가                             |      | `pages/work/WorkList.tsx:36-127`                                                                    |
| 8   | .     | .                                         | ② 페이지네이션 책임 위치                  | `pageInfo`·query·`isLoading` 소유 후 전파                                                                               | Content로 이전                    |      | `pages/work/WorkList.tsx:61-71,103-123`                                                             |
| 9   | .     | BbsListContent                            | ① 파일 헤더 없음                      | css import로 시작                                                                                                     | 헤더 추가                          |      | `components/bbs/list/BbsListContent.tsx:1`                                                          |
| 10  | .     | .                                         | ① 구역 주석 중복                      | "함수" 구분선 2회                                                                                                        | 정리                             |      | `components/bbs/list/BbsListContent.tsx:135,219-222`                                                |
| 11  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<AsBbsListResDto>([...])` 인라인                                                                        | `bbs-list-grid.ts` 분리          |      | `components/bbs/list/BbsListContent.tsx:92-132`                                                     |
| 12  | .     | NodeListContent                           | ① 파일 헤더 없음                      | import로 시작                                                                                                         | 헤더 추가                          |      | `components/node/list/NodeListContent.tsx:1`                                                        |
| 13  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns`+renderer 인라인                                                                                       | `node-list-grid.ts` 분리         |      | `components/node/list/NodeListContent.tsx:165-220`                                                  |
| 14  | .     | WorkListContent                           | ① 파일 헤더 없음                      | import로 시작                                                                                                         | 헤더 추가                          |      | `components/work/list/WorkListContent.tsx:1`                                                        |
| 15  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<AsWrkListResDto>([...])` 인라인                                                                        | `work-list-grid.ts` 분리         |      | `components/work/list/WorkListContent.tsx:62-74`                                                    |
| 16  | .     | NodeHistListContent                       | ① 파일 헤더 없음                      | 깨진 주석으로 시작                                                                                                         | 헤더 추가                          |      | `components/nodehist/NodeHistListContent.tsx:1-3`                                                   |
| 17  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<AsNdHistListResDto>([...])` 인라인                                                                     | `nodehist-list-grid.ts` 분리     |      | `components/nodehist/NodeHistListContent.tsx:57-88`                                                 |
| 18  | .     | NodeHistListModal                         | ① 파일 헤더 없음                      | `eslint-disable`+import                                                                                            | 헤더 추가                          |      | `components/nodehist/NodeHistListModal.tsx:1`                                                       |
| 19  | .     | .                                         | ③ auto-import                   | `import { useTranslation } from 'react-i18next'`                                                                   | 명시 import 제거                   |      | `components/nodehist/NodeHistListModal.tsx:6`                                                       |
| 20  | .     | NodeHistListSearch                        | ① 파일 헤더 없음                      | import로 시작                                                                                                         | 헤더 추가                          |      | `components/nodehist/NodeHistListSearch.tsx:1`                                                      |
| 21  | .     | NodeListSearch                            | ① 파일 헤더 없음                      | import로 시작                                                                                                         | 헤더 추가                          |      | `components/node/list/NodeListSearch.tsx:1`                                                         |
| 22  | .     | WorkListSearch                            | ① 파일 헤더 없음                      | import로 시작                                                                                                         | 헤더 추가                          |      | `components/work/list/WorkListSearch.tsx:1`                                                         |
| 23  | .     | .                                         | ③ auto-import                   | `useRef`·`useState` 명시 import                                                                                      | 제거(DragEvent type만 유지)         |      | `components/bbs/list/BoardPostModal.tsx:27`                                                         |
| 24  | .     | .                                         | ④ 한글 하드코딩                       | `aria-label="첨부 삭제/제거"`                                                                                            | `t()` 처리                       |      | `components/bbs/list/BoardPostModal.tsx:291,350`                                                    |
| 25  | .     | .                                         | ③ auto-import                   | `useState` 명시 import                                                                                               | 제거                             |      | `components/bbs/list/BoardPinOrderModal.tsx:15`                                                     |
| 26  | .     | BbsList                                   | ④ i18n 4뎁스 호출                   | `t('bbs.list.btn.register')` 등 4뎁스(8건)                                                                             | 3뎁스로 재구성                       |      | `pages/bbs/BbsList.tsx`                                                                             |
| 27  | .     | BbsListContent                            | ④ i18n 4뎁스 호출                   | `t('bbs.list.btn.changeOrder')` 등 4뎁스(10건)                                                                         | 3뎁스로 재구성                       |      | `components/bbs/list/BbsListContent.tsx`                                                            |
| 28  | .     | BoardPinOrderModal                        | ④ i18n 4뎁스 호출                   | `t('bbs.pinOrderModal.msg.updanSeqSaveFail')` 등 4뎁스(2건)                                                            | 3뎁스로 재구성                       |      | `components/bbs/list/BoardPinOrderModal.tsx`                                                        |
| 29  | .     | BoardPostModal                            | ④ i18n 4뎁스 호출                   | `t('bbs.postModal.msg.alertNoSystem')` 등 4뎁스(21건)                                                                  | 3뎁스로 재구성                       |      | `components/bbs/detail/BoardPostModal.tsx`                                                          |
| 30  | .     | NodeList                                  | ④ i18n 4뎁스 호출                   | `t('node.list.btn.noUseAll')` 등 4뎁스(6건)                                                                            | 3뎁스로 재구성                       |      | `pages/node/NodeList.tsx`                                                                           |
| 31  | .     | NodeListContent                           | ④ i18n 4뎁스 호출                   | `t('node.list.btn.noUseAll')` 등 4뎁스(10건)                                                                           | 3뎁스로 재구성                       |      | `components/node/list/NodeListContent.tsx`                                                          |
| 32  | .     | NodeListSearch                            | ④ i18n 4뎁스 호출                   | `t('node.list.col.displayNm')` 등 4뎁스(3건)                                                                           | 3뎁스로 재구성                       |      | `components/node/list/NodeListSearch.tsx`                                                           |
| 33  | .     | NodeHistListContent                       | ④ i18n 4뎁스 호출                   | `t('nodehist.list.col.chgCnts')` 등 4뎁스(4건)                                                                         | 3뎁스로 재구성                       |      | `components/nodehist/NodeHistListContent.tsx`                                                       |
| 34  | .     | NodeHistListSearch                        | ④ i18n 4뎁스 호출                   | `t('nodehist.list.col.ndNm')` 등 4뎁스(3건)                                                                            | 3뎁스로 재구성                       |      | `components/nodehist/NodeHistListSearch.tsx`                                                        |
| 35  | .     | WorkList                                  | ④ i18n 4뎁스 호출                   | `t('work.list.msg.workResultNotCompleted')` 등 4뎁스(1건)                                                              | 3뎁스로 재구성                       |      | `pages/work/WorkList.tsx`                                                                           |
| 36  | .     | WorkListContent                           | ④ i18n 4뎁스 호출                   | `t('work.list.col.pjtNm')` 등 4뎁스(8건)                                                                               | 3뎁스로 재구성                       |      | `components/work/list/WorkListContent.tsx`                                                          |
| 37  | .     | .                                         | ④ 한글 하드코딩                       | `filename:'인건비목록.xlsx'`                                                                                            | `t()`                          |      | `pages/budget/labor/ManCostReqMng.tsx:85`                                                           |
| 38  | .     | UnitprcMng/Dtl/Reg                        | ① @file 경로 오기                   | `@file pages/budget/UnitprcMng.tsx`(unitprice 누락)                                                                  | 실제 경로로                         |      | `pages/budget/unitprice/*.tsx:2`                                                                    |
| 39  | .     | .                                         | ④ i18n 키 오타                     | `t('budget.lineup.reg.msg..mkFgCdRequired')`(점 2개)                                                                 | 키 수정                           |      | `pages/budget/lineup/LineupReg.tsx:60-156`                                                          |
| 40  | .     | ManCostChgForm                            | ⑤ 그리드 컬럼 미분리                    | `createColumns<HisRow>([...])` 인라인                                                                                 | `*-grid.ts` 분리                 |      | `components/budget/labor/ManCostChgForm.tsx:66-114`                                                 |
| 41  | .     | ManCostChgGrid                            | ⑤ 그리드 컬럼 미분리                    | `createColumns` 인라인                                                                                                | 분리                             |      | `components/budget/labor/ManCostChgGrid.tsx:56-153`                                                 |
| 42  | .     | .                                         | ④ 하드코딩 헤더                       | `header:'변경요청번호'` 등                                                                                                | `t()`                          |      | `components/budget/labor/ManCostChgGrid.tsx:71-145`                                                 |
| 43  | .     | ManCostRegGrid                            | ⑤ 그리드 컬럼 미분리                    | `createColumns` 인라인                                                                                                | 분리                             |      | `components/budget/labor/ManCostRegGrid.tsx:188-264`                                                |
| 44  | .     | .                                         | ④ 하드코딩                          | `templateFilename="인건비_업로드양식.xlsx"`, `'이메일','이름'`                                                                  | `t()`                          |      | `components/budget/labor/ManCostRegGrid.tsx:56-62`                                                  |
| 45  | .     | ManCostReqForm                            | ① @file 복붙                      | `@file ManCostChgForm`(실제 ReqForm), `@description` 빈값                                                              | 정정                             |      | `components/budget/labor/ManCostReqForm.tsx:2-3`                                                    |
| 46  | .     | ManCostReqGrid                            | ① @file 복붙                      | `@file ...ContentGrid.tsx`                                                                                         | 정정                             |      | `components/budget/labor/ManCostReqGrid.tsx:2`                                                      |
| 47  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<ManCostRow>([...])`                                                                                 | 분리                             |      | `components/budget/labor/ManCostReqGrid.tsx:69-128`                                                 |
| 48  | .     | ManCostExcelResultPopup                   | ① 파일 헤더 없음                      | 헤더 누락                                                                                                              | 헤더 추가                          |      | `components/budget/labor/ManCostExcelResultPopup.tsx:1`                                             |
| 49  | .     | .                                         | ④ 한글 하드코딩                       | `</strong>건`                                                                                                       | `t()`                          |      | `components/budget/labor/ManCostExcelResultPopup.tsx:40-42`                                         |
| 50  | .     | manCostChgSchema                          | ④ zod 메시지 하드코딩                  | `.int('변경 인건비는 정수만...')`                                                                                           | i18n 키                         |      | `components/budget/labor/manCostChgSchema.ts:36-42`                                                 |
| 51  | .     | LineupDetail(budget)                      | ④ 하드코딩 헤더                       | `'개봉연도','타이틀명','배급사'...`                                                                                           | `t()`                          |      | `components/budget/lineup/LineupDetail.tsx:101-188`                                                 |
| 52  | .     | LineupGrid                                | ① @file 복붙                      | `@file ...ContentGrid.tsx`                                                                                         | 정정                             |      | `components/budget/lineup/LineupGrid.tsx:2`                                                         |
| 53  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<LineupRow>([...13개...])`                                                                            | 분리                             |      | `components/budget/lineup/LineupGrid.tsx:61-160`                                                    |
| 54  | .     | LineupHisGrid                             | ⑤ 그리드 컬럼 미분리                    | `createColumns<HisRow>([...])`                                                                                     | 분리                             |      | `components/budget/lineup/LineupHisGrid.tsx:26-72`                                                  |
| 55  | .     | lineupSchema/unitpriceSchema              | ① 파일 헤더 없음                      | `import dayjs...`로 시작                                                                                              | 헤더 추가                          |      | `components/budget/lineup/lineupSchema.ts:1`, `.../unitprice/unitpriceSchema.ts:1`                  |
| 56  | .     | RegForm(lineup)                           | ④ 하드코딩                          | `'개봉연도'`, `'Q1 (1~3월)'`, `'${i+1}월'`                                                                               | `t()`                          |      | `components/budget/lineup/RegForm.tsx:80-263`                                                       |
| 57  | .     | SearchForm(lineup)                        | ① @file 복붙                      | `@file ...Search.tsx`                                                                                              | 정정                             |      | `components/budget/lineup/SearchForm.tsx:2`                                                         |
| 58  | .     | .                                         | ④ 하드코딩                          | `label="개봉연도"`, `'Q1'`                                                                                             | `t()`                          |      | `components/budget/lineup/SearchForm.tsx:28-133`                                                    |
| 59  | .     | GradeGrid                                 | ⑤ 그리드 컬럼 미분리                    | `createColumns` 인라인                                                                                                | 분리                             |      | `components/budget/unitprice/GradeGrid.tsx:42`                                                      |
| 60  | .     | GradeHisGrid                              | ⑤ 그리드 컬럼 미분리                    | `createColumns` 인라인                                                                                                | 분리                             |      | `components/budget/unitprice/GradeHisGrid.tsx:26`                                                   |
| 61  | .     | UnitpriceGrid                             | ① @file 복붙                      | `@file ...ContentGrid.tsx`                                                                                         | 정정                             |      | `components/budget/unitprice/UnitpriceGrid.tsx:2`                                                   |
| 62  | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns` 인라인                                                                                                | 분리                             |      | `components/budget/unitprice/UnitpriceGrid.tsx:61`                                                  |
| 63  | .     | SearchForm(unitprice)                     | ① @file 복붙                      | `@file ...Search.tsx`                                                                                              | 정정                             |      | `components/budget/unitprice/SearchForm.tsx:2`                                                      |
| 64  | .     | .                                         | ④ 하드코딩                          | `label:'전체'`, `placeholder="선택"`                                                                                   | `t()`                          |      | `components/budget/unitprice/SearchForm.tsx:42-86`                                                  |
| 65  | .     | ManCostApprvMng                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostApprvMng.tsx`                                                            |
| 66  | .     | ManCostChgDtl                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostChgDtl.tsx`                                                              |
| 67  | .     | ManCostChgMng                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostChgMng.tsx`                                                              |
| 68  | .     | ManCostChgReg                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostChgReg.tsx`                                                              |
| 69  | .     | ManCostReqDtl                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostReqDtl.tsx`                                                              |
| 70  | .     | ManCostReqMng                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostReqMng.tsx`                                                              |
| 71  | .     | ManCostReqReg                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/labor/ManCostReqReg.tsx`                                                              |
| 72  | .     | ManCostApprvSearchForm                    | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostApprvSearchForm.tsx`                                                |
| 73  | .     | ManCostChgApprvGrid                       | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgApprvGrid.tsx`                                                   |
| 74  | .     | ManCostChgForm                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgForm.tsx`                                                        |
| 75  | .     | ManCostChgGrid                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgGrid.tsx`                                                        |
| 76  | .     | ManCostChgPopup                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgPopup.tsx`                                                       |
| 77  | .     | ManCostChgRegForm                         | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgRegForm.tsx`                                                     |
| 78  | .     | ManCostChgSearchForm                      | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostChgSearchForm.tsx`                                                  |
| 79  | .     | ManCostExcelResultPopup                   | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostExcelResultPopup.tsx`                                               |
| 80  | .     | ManCostRegGrid                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostRegGrid.tsx`                                                        |
| 81  | .     | ManCostReqApprvGrid                       | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostReqApprvGrid.tsx`                                                   |
| 82  | .     | ManCostReqForm                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostReqForm.tsx`                                                        |
| 83  | .     | ManCostReqGrid                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostReqGrid.tsx`                                                        |
| 84  | .     | ManCostReqPopup                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/ManCostReqPopup.tsx`                                                       |
| 85  | .     | SearchForm(labor)                         | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/labor/SearchForm.tsx`                                                            |
| 86  | .     | LineupDtl                                 | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/lineup/LineupDtl.tsx`                                                                 |
| 87  | .     | LineupMng                                 | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/lineup/LineupMng.tsx`                                                                 |
| 88  | .     | LineupReg                                 | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/lineup/LineupReg.tsx`                                                                 |
| 89  | .     | LineupDetail                              | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/lineup/LineupDetail.tsx`                                                         |
| 90  | .     | LineupGrid                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/lineup/LineupGrid.tsx`                                                           |
| 91  | .     | LineupHisGrid                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/lineup/LineupHisGrid.tsx`                                                        |
| 92  | .     | RegForm(lineup)                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/lineup/RegForm.tsx`                                                              |
| 93  | .     | SearchForm(lineup)                        | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/lineup/SearchForm.tsx`                                                           |
| 94  | .     | UnitprcDtl                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/unitprice/UnitprcDtl.tsx`                                                             |
| 95  | .     | UnitprcMng                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/unitprice/UnitprcMng.tsx`                                                             |
| 96  | .     | UnitprcReg                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/budget/unitprice/UnitprcReg.tsx`                                                             |
| 97  | .     | GradeGrid                                 | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/unitprice/GradeGrid.tsx`                                                         |
| 98  | .     | GradeHisGrid                              | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/unitprice/GradeHisGrid.tsx`                                                      |
| 99  | .     | RegForm(unitprice)                        | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/unitprice/RegForm.tsx`                                                           |
| 100 | .     | SearchForm(unitprice)                     | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/unitprice/SearchForm.tsx`                                                        |
| 101 | .     | UnitpriceGrid                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/budget/unitprice/UnitpriceGrid.tsx`                                                     |
| 102 | .     | .                                         | ① @file 오기                      | `@file pages/scrtyChkItem/...`(commmng 누락)                                                                         | 정정                             |      | `pages/commmng/scrtyChkItem/securityCheckItemDtl.tsx:2`                                             |
| 103 | .     | .                                         | ① @file 오기                      | commmng 누락                                                                                                         | 정정                             |      | `pages/commmng/scrtyChkItem/securityCheckItemReg.tsx:2`                                             |
| 104 | .     | .                                         | ④ i18n 4뎁스 호출                   | `t('commmng.tpnVendorCreate.message.saveSuccess')`                                                                 | 3뎁스로 재구성                       |      | `pages/commmng/scrtyChkItem/securityCheckItemReg.tsx:101`                                           |
| 105 | .     | TpnVendorReg                              | ④ i18n 4뎁스 호출                   | `t('commmng.tpnVendorCreate.message.deleteComplete')` 등 4뎁스(2건)                                                    | 3뎁스로 재구성                       |      | `pages/commmng/tpnVenMng/TpnVendorReg.tsx`                                                          |
| 106 | .     | TpnVendorDtlGrid                          | ④ i18n 4뎁스 호출                   | `t('commmng.tpnVendorVisit.col.chrgrNm')` 등 4뎁스(6건)                                                                | 3뎁스로 재구성                       |      | `components/commmng/tpnvendor/TpnVendorDtlGrid.tsx`                                                 |
| 107 | .     | TpnVendorVisitRegModal                    | ④ i18n 4뎁스 호출                   | `t('commmng.tpnVendorCreate.message.saveSuccess')` 등 4뎁스(6건)                                                       | 3뎁스로 재구성                       |      | `components/commmng/tpnvendor/TpnVendorVisitRegModal.tsx`                                           |
| 108 | .     | ScrtyChkItemGridForm                      | ④ i18n 4뎁스 호출                   | `t('commmng.scrtyChkItem.col.checkItem')` 등 4뎁스(7건)                                                                | 3뎁스로 재구성                       |      | `components/commmng/scrtyChkItem/ScrtyChkItemGridForm.tsx`                                          |
| 109 | .     | TpnVendorGrid                             | ④ i18n 4뎁스 호출                   | `t('commmng.tpnVendor.col.chrgrId')` 등 4뎁스(8건)                                                                     | 3뎁스로 재구성                       |      | `components/commmng/tpnvendor/TpnVendorGrid.tsx`                                                    |
| 110 | .     | WorkReqGridForm                           | ④ i18n 4뎁스 호출                   | `t('commmng.workReq.col.procRstCd')` 등 4뎁스(8건)                                                                     | 3뎁스로 재구성                       |      | `components/commmng/workReq/WorkReqGridForm.tsx`                                                    |
| 111 | .     | ScrtyChkItemRegForm                       | ④ i18n 4뎁스 호출                   | `t('commmng.scrtyChkItem.col.checkItem')` 등 4뎁스(15건)                                                               | 3뎁스로 재구성                       |      | `components/commmng/scrtyChkItem/ScrtyChkItemRegForm.tsx`                                           |
| 112 | .     | WorkReqRegForm                            | ④ i18n 4뎁스 호출                   | `t('commmng.scrtyChkItem.col.checkItem')` 등 4뎁스(16건)                                                               | 3뎁스로 재구성                       |      | `components/commmng/workReq/WorkReqRegForm.tsx`                                                     |
| 113 | .     | TpnVendor/Dtl/Reg                         | ① @file 복붙(다른 도메인 파일)           | `@file pages/budget/UnitprcMng.tsx`                                                                                | 정정                             |      | `pages/commmng/tpnVenMng/*.tsx:2`                                                                   |
| 114 | .     | workReqDtl/List/Reg                       | ① @file·@description 복붙         | `@file scrtyChkItem`, `@description 업체보안항목`                                                                        | 정정                             |      | `pages/commmng/workReq/workReqDtl.tsx:2-46`, `workReqReg.tsx:2`                                     |
| 115 | .     | ScrtyChkItemGridForm                      | ⑤ 그리드 컬럼 미분리                    | `createColumns(...)` 인라인                                                                                           | 분리                             |      | `components/commmng/scrtyChkItem/ScrtyChkItemGridForm.tsx:57-113`                                   |
| 116 | .     | .                                         | ① @file 빈값                      | @file 비어있음                                                                                                         | 헤더 작성                          |      | `components/commmng/scrtyChkItem/ScrtyChkItemGridForm.tsx:2`                                        |
| 117 | .     | ScrtyChkItemRegForm                       | ① 파일 헤더 없음                      | 헤더 누락                                                                                                              | 헤더 추가                          |      | `components/commmng/scrtyChkItem/ScrtyChkItemRegForm.tsx:1`                                         |
| 118 | .     | .                                         | ④ 한글 하드코딩                       | `label:'전체'` 등                                                                                                     |                                |      | `components/commmng/scrtyChkItem/ScrtyChkItemRegForm.tsx:110-162`                                   |
| 119 | .     | .                                         | ① @description 복붙               | 비표준 설명                                                                                                             | 정정                             |      | `components/commmng/scrtyChkItem/ScrtyChkItemSearchForm.tsx:2`                                      |
| 120 | .     | ScrtyChkItemSchema                        | ① 파일 헤더 없음                      | 헤더 누락                                                                                                              | 헤더 추가                          |      | `components/commmng/scrtyChkItem/ScrtyChkItemSchema.tsx:1`                                          |
| 121 | .     | .                                         | ④ 하드코딩 검증메시지                    | `min(1,'카테고리는 필수입니다.')`                                                                                            | i18n 키                         |      | `components/commmng/scrtyChkItem/ScrtyChkItemSchema.tsx:18-19`                                      |
| 122 | .     | .                                         | ① @description 복붙               | `@description 게시판 목록 조회 폼`                                                                                         | 정정                             |      | `components/commmng/tpnvendor/TpnVendorSearch.tsx:2`                                                |
| 123 | .     | TpnVendorGrid                             | ① @file 복붙                      | `@file components/budget/unitprice/ContentGrid`                                                                    | 정정                             |      | `components/commmng/tpnvendor/TpnVendorGrid.tsx:2`                                                  |
| 124 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns(...)` 인라인                                                                                           | 분리                             |      | `components/commmng/tpnvendor/TpnVendorGrid.tsx:57-118`                                             |
| 125 | .     | TpnVendorDtlGrid                          | ① @file 복붙                      | 다른 도메인 파일 복붙                                                                                                       | 정정                             |      | `components/commmng/tpnvendor/TpnVendorDtlGrid.tsx:2`                                               |
| 126 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns(...)` 인라인                                                                                           | 분리                             |      | `components/commmng/tpnvendor/TpnVendorDtlGrid.tsx:103-191`                                         |
| 127 | .     | .                                         | ④ 하드코딩                          | `'월','일','없음'`                                                                                                     | `t()`                          |      | `components/commmng/tpnvendor/TpnVendorDtlGrid.tsx:103-191`                                         |
| 128 | .     | .                                         | ④ 하드코딩                          | `'벤더ID는 필수입니다.'`                                                                                                   | i18n                           |      | `components/commmng/tpnvendor/TpnVendorSchema.tsx:26-34`                                            |
| 129 | .     | TpnVendorRegForm                          | ① 파일 헤더 없음 + ④ 하드코딩             | 헤더 누락, `label="선택"`                                                                                                |                                |      | `components/commmng/tpnvendor/TpnVendorRegForm.tsx`                                                 |
| 130 | .     | TpnVendorVisitRegModal                    | ① 파일 헤더 없음 + ④ 하드코딩             | `title="파일 업로드"`                                                                                                   |                                |      | `components/commmng/tpnvendor/TpnVendorVisitRegModal.tsx`                                           |
| 131 | .     | TpnVendorVisitSchema                      | ① 파일 헤더 없음 + ④ 검증메시지 한글         | 헤더 누락, 한글 메시지                                                                                                      |                                |      | `components/commmng/tpnvendor/TpnVendorVisitSchema.tsx`                                             |
| 132 | .     | TpnVendorFileModal                        | ① @file 복붙                      | `@file pages/samples/files/SampleFileUpload`                                                                       | 정정                             |      | `components/commmng/tpnvendor/TpnVendorFileModal.tsx:2`                                             |
| 133 | .     | .                                         | ④ 하드코딩                          | `'업로드 완료'` 등                                                                                                       | `t()`                          |      | `components/commmng/tpnvendor/TpnVendorFileModal.tsx:96-216`                                        |
| 134 | .     | WorkReqGridForm                           | ① @file 빈값                      | @file 비어있음                                                                                                         | 헤더 작성                          |      | `components/commmng/workReq/WorkReqGridForm.tsx:2`                                                  |
| 135 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns(...)` 인라인                                                                                           | 분리                             |      | `components/commmng/workReq/WorkReqGridForm.tsx:57-132`                                             |
| 136 | .     | WorkReqCmntForm                           | ① 파일 헤더 없음 + ④ 하드코딩             | `label:'최신순'`, `'댓글 총 …건'`                                                                                         |                                |      | `components/commmng/workReq/WorkReqCmntForm.tsx`                                                    |
| 137 | .     | WorkReqRegForm                            | ① 파일 헤더 없음                      | 헤더 누락                                                                                                              |                                |      | `components/commmng/workReq/WorkReqRegForm.tsx`                                                     |
| 138 | .     | WorkReqSchema                             | ① 파일 헤더 없음 + ④ 검증메시지 한글         | 헤더 누락, 한글 메시지                                                                                                      |                                |      | `components/commmng/workReq/WorkReqSchema.tsx`                                                      |
| 139 | .     | securityCheckItemDtl                      | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/scrtyChkItem/securityCheckItemDtl.tsx`                                               |
| 140 | .     | securityCheckItemList                     | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/scrtyChkItem/securityCheckItemList.tsx`                                              |
| 141 | .     | securityCheckItemReg                      | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/scrtyChkItem/securityCheckItemReg.tsx`                                               |
| 142 | .     | TpnVendor                                 | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/tpnVenMng/TpnVendor.tsx`                                                             |
| 143 | .     | TpnVendorDtl                              | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/tpnVenMng/TpnVendorDtl.tsx`                                                          |
| 144 | .     | TpnVendorReg                              | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/tpnVenMng/TpnVendorReg.tsx`                                                          |
| 145 | .     | workReqDtl                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/workReq/workReqDtl.tsx`                                                              |
| 146 | .     | workReqList                               | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/workReq/workReqList.tsx`                                                             |
| 147 | .     | workReqReg                                | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/commmng/workReq/workReqReg.tsx`                                                              |
| 148 | .     | ScrtyChkItemGridForm                      | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/scrtyChkItem/ScrtyChkItemGridForm.tsx`                                          |
| 149 | .     | ScrtyChkItemRegForm                       | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/scrtyChkItem/ScrtyChkItemRegForm.tsx`                                           |
| 150 | .     | ScrtyChkItemSearchForm                    | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/scrtyChkItem/ScrtyChkItemSearchForm.tsx`                                        |
| 151 | .     | TpnVendorDtlGrid                          | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/tpnvendor/TpnVendorDtlGrid.tsx`                                                 |
| 152 | .     | TpnVendorFileModal                        | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/tpnvendor/TpnVendorFileModal.tsx`                                               |
| 153 | .     | TpnVendorGrid                             | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/tpnvendor/TpnVendorGrid.tsx`                                                    |
| 154 | .     | TpnVendorRegForm                          | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/tpnvendor/TpnVendorRegForm.tsx`                                                 |
| 155 | .     | TpnVendorSearch                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/tpnvendor/TpnVendorSearch.tsx`                                                  |
| 156 | .     | WorkReqCmntForm                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/workReq/WorkReqCmntForm.tsx`                                                    |
| 157 | .     | WorkReqGridForm                           | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/workReq/WorkReqGridForm.tsx`                                                    |
| 158 | .     | WorkReqRegForm                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/workReq/WorkReqRegForm.tsx`                                                     |
| 159 | .     | WorkReqSearchForm                         | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `components/commmng/workReq/WorkReqSearchForm.tsx`                                                  |
| 160 | .     | VendorReg/VendorUsrDtl/VendorUsrReg       | ① @file 복붙                      | `@file ...VendorDtl.tsx`                                                                                           | 정정                             |      | `pages/stdmng/vendor/*.tsx:2`                                                                       |
| 161 | .     | DistributorContent                        | ⑤ 그리드 컬럼 미분리 + ④ '없음'           | `createColumns`, `${value ?? '없음'}`                                                                                |                                |      | `components/stdmng/distributor/DistributorContent.tsx:57`                                           |
| 162 | .     | VendorContent                             | ⑤ 그리드 컬럼 미분리 + ④ '없음'           | 동일                                                                                                                 |                                |      | `components/stdmng/vendor/.../VendorContent.tsx:60`                                                 |
| 163 | .     | VendorUsrContent                          | ⑤ 그리드 컬럼 미분리 + ④ '없음'           | 동일                                                                                                                 |                                |      | `components/stdmng/vendor/.../VendorUsrContent.tsx:55`                                              |
| 164 | .     | Distributor Content/DtlContent/RegContent | ① @file 복붙                      | `@description 벤더사`, `@file ApiIntegrationContent`                                                                  | 정정                             |      | `components/stdmng/distributor/*.tsx:2-7`                                                           |
| 165 | .     | LineupListContent(publish)                | ⑤ 그리드 컬럼 미분리 + ④ 하드코딩           | `createColumns`, `'라인업 상세','조회'`                                                                                   |                                |      | `pages/publish/lineup/LineupListContent.tsx`                                                        |
| 166 | .     | lineupDetail(publish)                     | ① 파일 헤더 없음 + ④ 하드코딩             | 헤더 누락, 한글 라벨                                                                                                       |                                |      | `pages/publish/lineup/lineupDetail.tsx`                                                             |
| 167 | .     | CommonDistributorPopup                    | ⑤ 컬럼 인라인                        | `createPopupColumns`                                                                                               |                                |      | `components/common/CommonDistributorPopup.tsx`                                                      |
| 168 | .     | CommonUserPopup                           | ⑤ 컬럼 인라인                        | `createPopupColumns`                                                                                               |                                |      | `components/common/CommonUserPopup.tsx`                                                             |
| 169 | .     | CommonVendorPopup                         | ⑤ 컬럼 인라인                        | `createPopupColumns`                                                                                               |                                |      | `components/common/CommonVendorPopup.tsx`                                                           |
| 170 | .     | FileUploadModal                           | ① 파일 헤더 없음 + ④ 하드코딩             | `title='파일 선택'`, `'파일을 여기에 드래그하세요.'`                                                                               |                                |      | `components/common/FileUploadModal.tsx:1,54-225`                                                    |
| 171 | .     | Distributor/User/VendorLookup             | ① @description 비표준              | `@description jhan`(작성자)                                                                                           | 설명 기재                          |      | `components/common/lookup/*Lookup.tsx:3`                                                            |
| 172 | aion  | DeploymentContent                         | ③ auto-import                   | `useCallback,useMemo,useState`·`useTranslation` 명시                                                                 |                                |      | `components/deployment/DeploymentContent.tsx:23-24`                                                 |
| 173 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<DeploymentResponse>([...])`                                                                         | `deployment-grid.ts`           |      | `components/deployment/DeploymentContent.tsx:109-206`                                               |
| 174 | .     | .                                         | ④ 한글 하드코딩                       | `label:'신규'`                                                                                                       | `t()`                          |      | `components/deployment/DeploymentContent.tsx:98`                                                    |
| 175 | .     | .                                         | ④ 하드코딩 헤더                       | `header:'Traffic %'`, `'control'`                                                                                  | `t('aion.col.*')`              |      | `components/deployment/DeploymentContent.tsx:170,191`                                               |
| 176 | .     | DeploymentSearch                          | ④ 하드코딩                          | `{value:'',label:'전체'}`                                                                                            | `t()`                          |      | `components/deployment/DeploymentSearch.tsx:23,31`                                                  |
| 177 | .     | DeploymentModal                           | ③ auto-import                   | `useCallback,useEffect,useMemo,useState` 명시                                                                        |                                |      | `components/deployment/DeploymentModal.tsx:45,47`                                                   |
| 178 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.deploymentModal.createTitle')`                                                                            | 3뎁스로 재구성                       |      | `components/deployment/DeploymentModal.tsx:495 외`                                                   |
| 179 | .     | .                                         | ① 내부 3구역 주석 없음                  | 화면 구역만 존재                                                                                                          | 구분선 추가                         |      | `components/deployment/DeploymentModal.tsx:302~`                                                    |
| 180 | .     | .                                         | ④ 하드코딩                          | `placeholder="host-...(비우면...)"`                                                                                   | `t()`                          |      | `components/deployment/DeploymentModal.tsx:667`                                                     |
| 181 | .     | DevEnvironmentContent                     | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/devenvironment/DevEnvironmentContent.tsx:22-23`                                         |
| 182 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `BOARD_GRID_COLUMNS` createColumns 인라인                                                                             | 분리                             |      | `components/devenvironment/DevEnvironmentContent.tsx:168-345`                                       |
| 183 | .     | DevEnvironmentSearch                      | ④ 하드코딩                          | `{value:'',label:'전체'}`                                                                                            | `t()`                          |      | `components/devenvironment/DevEnvironmentSearch.tsx:30,38`                                          |
| 184 | .     | DevEnvironmentModal                       | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/devenvironment/DevEnvironmentModal.tsx:50,52`                                           |
| 185 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.devenvironment.modal.createTitle')`                                                                       | 3뎁스로 재구성                       |      | `components/devenvironment/DevEnvironmentModal.tsx:385 외`                                           |
| 186 | .     | DevEnvironmentResourceRequest             | ③ auto-import                   | `useEffect`·`useTranslation` 명시                                                                                    |                                |      | `components/devenvironment/DevEnvironmentResourceRequest.tsx:26,28`                                 |
| 187 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.devenvironment.resource.valueCount')`                                                                     | 3뎁스로 재구성                       |      | `components/devenvironment/DevEnvironmentResourceRequest.tsx:150 외`                                 |
| 188 | .     | ExternalAssetContent                      | ③ auto-import                   | `useMemo` 명시                                                                                                       |                                |      | `components/externalAssets/ExternalAssetContent.tsx:19`                                             |
| 189 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<ExternalAssetGridRow>([...])`                                                                       | 분리                             |      | `components/externalAssets/ExternalAssetContent.tsx:98-183`                                         |
| 190 | .     | ModelContent                              | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/model/ModelContent.tsx:16-17`                                                           |
| 191 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<ModelResponse>([...])`                                                                              | `model-grid.ts`                |      | `components/model/ModelContent.tsx:111-209`                                                         |
| 192 | .     | .                                         | ④ 한글 하드코딩                       | `label:'신규'`, `labelText:'배포'`, `header:'Task'` 등                                                                  | `t()`                          |      | `components/model/ModelContent.tsx:100,200,137-194`                                                 |
| 193 | .     | ModelModal                                | ③ auto-import                   | `useEffect` 명시                                                                                                     |                                |      | `components/model/ModelModal.tsx:23,25`                                                             |
| 194 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.model.modal.createTitle')`                                                                                | 3뎁스로 재구성                       |      | `components/model/ModelModal.tsx:96,107`                                                            |
| 195 | .     | ServiceGroup(page)                        | ③ auto-import                   | `useState`·`useTranslation` 명시                                                                                     |                                |      | `pages/serviceGroup/ServiceGroup.tsx:12,15`                                                         |
| 196 | .     | .                                         | ① 페이지 3구역 없음                    | 구분선 없음                                                                                                             | 추가                             |      | `pages/serviceGroup/ServiceGroup.tsx:49~`                                                           |
| 197 | .     | ServiceGroupContent                       | ③ auto-import                   | `useCallback,useMemo` 명시                                                                                           |                                |      | `components/serviceGroup/ServiceGroupContent.tsx:11-12`                                             |
| 198 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns`+defaultRow 인라인                                                                                     | 분리                             |      | `components/serviceGroup/ServiceGroupContent.tsx:92-140`                                            |
| 199 | .     | .                                         | ① 내부 3구역 없음                     | 구분선 없음                                                                                                             | 추가                             |      | `components/serviceGroup/ServiceGroupContent.tsx:30~`                                               |
| 200 | .     | Storage(page)                             | ③ auto-import                   | `useState` 명시                                                                                                      |                                |      | `pages/storage/Storage.tsx:12,14`                                                                   |
| 201 | .     | .                                         | ① 내부 3구역 없음                     | 구분선 없음                                                                                                             | 추가                             |      | `pages/storage/Storage.tsx:28~`                                                                     |
| 202 | .     | StorageContent                            | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/storage/StorageContent.tsx:11-12`                                                       |
| 203 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `createColumns<StorageResponse>([...])`                                                                            | 분리                             |      | `components/storage/StorageContent.tsx:64-98`                                                       |
| 204 | .     | StorageModal                              | ③ auto-import                   | `useEffect` 명시                                                                                                     |                                |      | `components/storage/StorageModal.tsx:12,14`                                                         |
| 205 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.storage.modal.createTitle')`                                                                              | 3뎁스로 재구성                       |      | `components/storage/StorageModal.tsx:96`                                                            |
| 206 | .     | .                                         | ④ 하드코딩                          | `placeholder="shared-storage"`, select 직접구현                                                                        | 공통 컴포넌트                        |      | `components/storage/StorageModal.tsx:119`                                                           |
| 207 | .     | TrainingContent                           | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/training/TrainingContent.tsx:11-12`                                                     |
| 208 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `GRID_COLUMNS` createColumns 인라인                                                                                   | `training-grid.ts`             |      | `components/training/TrainingContent.tsx:99-213`                                                    |
| 209 | .     | TrainingSearch                            | ④ 하드코딩                          | `{value:'',label:'전체'}`                                                                                            | `t()`                          |      | `components/training/TrainingSearch.tsx:29`                                                         |
| 210 | .     | TrainingListPanel                         | ③ auto-import                   | `useCallback,useImperativeHandle,useMemo,useRef,useState` 명시                                                       |                                |      | `components/training/TrainingListPanel.tsx:25`                                                      |
| 211 | .     | TrainingModal                             | ③ auto-import                   | `useMemo` 명시                                                                                                       |                                |      | `components/training/TrainingModal.tsx:30,31`                                                       |
| 212 | .     | .                                         | ④ 4뎁스 t()                       | `t('aion.trainingDetail.metrics')` 다수                                                                              | 3뎁스로 재구성                       |      | `components/training/TrainingModal.tsx:175,233,348 외`                                               |
| 213 | .     | .                                         | ④ 하드코딩 URL                      | `http://localhost:5001/#/experiments`                                                                              | 상수/환경값 분리                      |      | `components/training/TrainingModal.tsx:578`                                                         |
| 214 | .     | ExperimentContent                         | ③ auto-import                   | `useCallback,useMemo,useState` 명시                                                                                  |                                |      | `components/training/ExperimentContent.tsx:11`                                                      |
| 215 | .     | .                                         | ⑤ 그리드 컬럼 미분리                    | `GRID_COLUMNS` createColumns(useMemo 없음)                                                                           | 분리                             |      | `components/training/ExperimentContent.tsx:71-125`                                                  |
| 216 | .     | .                                         | ④ 하드코딩(전면)                      | `header:'상태/이름/실험 유형'`, `label:'신규'`, `gridTitle="실험 목록"`                                                          | `t()`                          |      | `components/training/ExperimentContent.tsx:71-129`                                                  |
| 217 | .     | ExperimentSearch                          | ④ 하드코딩(전면)                      | `label="상태/내 실험"`, `{label:'전체'}`                                                                                  | `t()`                          |      | `components/training/ExperimentSearch.tsx:20-37`                                                    |
| 218 | .     | ExperimentModal                           | ④ 하드코딩(전면)                      | `title '실험 등록/조회'`, `label "실험 이름"`, `'닫기'`                                                                        | `t()`                          |      | `components/training/ExperimentModal.tsx:91-179`                                                    |
| 219 | .     | aion 전반(systemic)                         | ④ i18n 파일 구조                    | `aion.json` 최상위를 시스템명 `aion`으로 래핑(`{ aion: { dashboard, training, … }}`) — 추후 시스템명이 prefix로 붙으면 `aion.aion.`*로 중복됨 | 시스템명 최상위 래핑 제거 → 중메뉴 단위로 파일 분리 |      | `locales/{ko,en}/aion.json`                                                                         |
| 220 | asset | CategoryList                              | ③ auto-import                   | react·react-router-dom·react-i18next 명시                                                                            |                                |      | `pages/std/category/CategoryList.tsx:12-15`                                                         |
| 221 | .     | .                                         | ① @file 경로 오기                   | `@file pages/stg/CategoryList`(실제 std)                                                                             | 정정                             |      | `pages/std/category/CategoryList.tsx:2`                                                             |
| 222 | .     | CategoryListContent                       | ⑤ 그리드 컬럼 미분리                    | `createColumns<DataRow>([...])`                                                                                    | `category-grid.ts`             |      | `components/std/category/categoryList/CategoryListContent.tsx:90-149`                               |
| 223 | .     | .                                         | ① @file 경로 오기                   | `@file CategoryContent`(실제 CategoryListContent)                                                                    | 정정                             |      | `components/std/category/categoryList/CategoryListContent.tsx:2`                                    |
| 224 | .     | .                                         | ③ auto-import                   | react·react-i18next 명시                                                                                             |                                |      | `components/std/category/categoryList/CategoryListContent.tsx:19-20`                                |
| 225 | .     | CategoryListSearch                        | ① @file/export 오기(복붙)           | `@file CategorySearch`, `function CategorySearch`                                                                  | 정정                             |      | `components/std/category/categoryList/CategoryListSearch.tsx:2,21`                                  |
| 226 | .     | .                                         | ③ auto-import                   | `useTranslation` 명시                                                                                                |                                |      | `components/std/category/categoryList/CategoryListSearch.tsx:12`                                    |
| 227 | .     | CategoryReg                               | ① 주석 비표준                        | `01/02/03 react hook event` 구분선                                                                                    | 표준 3구역                         |      | `pages/std/category/CategoryReg.tsx:24-105`                                                         |
| 228 | .     | .                                         | ① @file 경로 오기                   | `@file pages/stg/CategoryReg`                                                                                      | 정정                             |      | `pages/std/category/CategoryReg.tsx:2`                                                              |
| 229 | .     | .                                         | ③ auto-import                   | `useRef`·`useTranslation`·`useSearchParams` 명시                                                                     |                                |      | `pages/std/category/CategoryReg.tsx:12-14`                                                          |
| 230 | .     | CategoryRegContent                        | ① 주석 비표준                        | `01/02/03` 구분선                                                                                                     | 표준 구조                          |      | `components/std/category/categoryReg/CategoryRegContent.tsx:55-202`                                 |
| 231 | .     | .                                         | ① @file 경로 오기                   | 중간 폴더 누락                                                                                                           | 정정                             |      | `components/std/category/categoryReg/CategoryRegContent.tsx:2`                                      |
| 232 | .     | .                                         | ③ auto-import                   | react·react-hook-form·react-i18next 명시                                                                             |                                |      | `components/std/category/categoryReg/CategoryRegContent.tsx:23-26`                                  |
| 233 | .     | CategoryDetail                            | ① 주석 비표준                        | `01/02/03` 구분선                                                                                                     | 표준 3구역                         |      | `pages/std/category/CategoryDetail.tsx:18-41`                                                       |
| 234 | .     | .                                         | ④ t 직접 import                   | `import { t } from 'i18next'`                                                                                      | Import — `useTranslation` 사용   |      | `pages/std/category/CategoryDetail.tsx:11`                                                          |
| 235 | .     | .                                         | ① @file 경로 오기                   | `@file pages/stg/CategoryDetail`                                                                                   | 정정                             |      | `pages/std/category/CategoryDetail.tsx:2`                                                           |
| 236 | .     | CategoryDetailContent                     | ① 주석 비표준 + @file 오기             | `01/02/03`, 폴더 누락                                                                                                  |                                |      | `components/std/category/categoryDetail/CategoryDetailContent.tsx:2,19-56`                          |
| 237 | .     | .                                         | ③ auto-import                   | `useEffect`·`useTranslation`·`useSearchParams` 명시                                                                  |                                |      | `components/std/category/categoryDetail/CategoryDetailContent.tsx:12-14`                            |
| 238 | .     | FileFormatList                            | ① 페이지 3구역 없음                    | 구분선 없음                                                                                                             | 추가                             |      | `pages/std/fileFormat/FileFormatList.tsx:27-98`                                                     |
| 239 | .     | .                                         | ③ auto-import                   | react·react-hook-form·react-i18next·react-router-dom 명시                                                            |                                |      | `pages/std/fileFormat/FileFormatList.tsx:12-15`                                                     |
| 240 | .     | FileFormatListContent                     | ⑤ 그리드 컬럼 미분리                    | `createColumns<DataRow>([...])`                                                                                    | `file-format-grid.ts`          |      | `components/std/fileFormat/fileFormatList/FileFormatListContent.tsx:83-133`                         |
| 241 | .     | .                                         | ① 내부 주석 없음 + ③ auto-import      | 3구역 없음, react·react-i18next 명시                                                                                     |                                |      | `components/std/fileFormat/fileFormatList/FileFormatListContent.tsx:19-20,51`                       |
| 242 | .     | FileFormatListSearch                      | ① 내부 주석 없음 + ③ auto-import      | 구분선 없음, `useTranslation` 명시                                                                                        |                                |      | `components/std/fileFormat/fileFormatList/FileFormatListSearch.tsx:12`                              |
| 243 | .     | FileFormatReg                             | ① 페이지 3구역 없음 + ③ auto-import    | 구분선 없음, `useRef`·`useTranslation`·`useSearchParams` 명시                                                             |                                |      | `pages/std/fileFormat/FileFormatReg.tsx:12-14,23-87`                                                |
| 244 | .     | FileFormatRegContent                      | ① 주석 비표준 + ③ auto-import        | `01/02/03`, react·react-hook-form·react-i18next 명시                                                                 |                                |      | `components/std/fileFormat/fileFormatReg/FileFormatRegContent.tsx:21-24,49-141`                     |
| 245 | .     | FileFormatDetail                          | ④ t 직접 import + ① 주석 없음         | `import { t } from 'i18next'`, 3구역 없음                                                                              |                                |      | `pages/std/fileFormat/FileFormatDetail.tsx:11`                                                      |
| 246 | .     | FileFormatDetailContent                   | ① 주석 비표준 + ③ auto-import        | `01/02/03`, react·react-i18next·react-router-dom 명시                                                                |                                |      | `components/std/fileFormat/fileFormatDetail/FileFormatDetailContent.tsx:12-14,19-56`                |
| 247 | .     | AssetFormatBasicList                      | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `pages/std/assetFormatBasic/AssetFormatBasicList.tsx:12-15,39`                                      |
| 248 | .     | AssetFormatBasicListContent               | ⑤ 컬럼 미분리 + ① 주석 + ③ auto-import | `createColumns` 인라인                                                                                                | Import                         |      | `components/std/assetFormatBasic/assetFormatBasicList/AssetFormatBasicListContent.tsx:19-20,89-140` |
| 249 | .     | AssetFormatBasicListSearch                | ① 주석 없음 + ③ auto-import         | 구분선 없음, `useMemo`·`useTranslation` 명시                                                                              |                                |      | `components/std/assetFormatBasic/assetFormatBasicList/AssetFormatBasicListSearch.tsx:11-13`         |
| 250 | .     | AssetFormatBasicReg                       | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `pages/std/assetFormatBasic/AssetFormatBasicReg.tsx:12-14`                                          |
| 251 | .     | AssetFormatBasicRegContent                | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `components/std/assetFormatBasic/assetFormatBasicReg/AssetFormatBasicRegContent.tsx:21-24`          |
| 252 | .     | AssetFormatBasicDetail                    | ④ t 직접 import + ① 주석 없음         | `import { t } from 'i18next'`, 3구역 없음                                                                              |                                |      | `pages/std/assetFormatBasic/AssetFormatBasicDetail.tsx:11`                                          |
| 253 | .     | AssetFormatBasicDetailContent             | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `components/std/assetFormatBasic/assetFormatBasicDetail/AssetFormatBasicDetailContent.tsx:12-14`    |
| 254 | .     | AssetMetaBasicMng                         | ① 주석 비표준 + ③ auto-import        | `01/02/03`, react·react-hook-form·react-i18next 명시                                                                 |                                |      | `pages/std/assetMetaBasic/AssetMetaBasicMng.tsx:13-15,34-86`                                        |
| 255 | .     | AssetMetaBasicMngContent                  | ⑤ 컬럼 미분리(이중)                    | `masterColumns`·`detailColumns` createColumns 인라인                                                                  | 분리                             |      | `components/std/assetMetaBasic/assetMetaBasicMng/AssetMetaBasicMngContent.tsx:226-314`              |
| 256 | .     | .                                         | ④ 4뎁스/없는 키                      | `t('common.grid.msg.validationFailedTitle')`(점 3개, JSON 부재)                                                        | 3뎁스·실존 키                       |      | `components/std/assetMetaBasic/assetMetaBasicMng/AssetMetaBasicMngContent.tsx:189`                  |
| 257 | .     | .                                         | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `components/std/assetMetaBasic/assetMetaBasicMng/AssetMetaBasicMngContent.tsx:20-21`                |
| 258 | .     | AssetMetaBasicMngSearch                   | ① 주석 없음 + ③ auto-import         | 구분선 없음, `useMemo`·`useTranslation` 명시                                                                              |                                |      | `components/std/assetMetaBasic/assetMetaBasicMng/AssetMetaBasicMngSearch.tsx:11-13`                 |
| 259 | .     | AssetMetaBasicRegPopup                    | ④ 모듈 t 바인딩                      | `const t = i18n.t.bind(i18n)` + `useTranslation` 혼용                                                                | `useTranslation` 단일화           |      | `components/std/assetMetaBasic/AssetMetaBasicRegPopup.tsx:34-47`                                    |
| 260 | .     | .                                         | ① 주석 없음 + ③ auto-import         | 구분선 없음, 명시 import                                                                                                  |                                |      | `components/std/assetMetaBasic/AssetMetaBasicRegPopup.tsx:24-26`                                    |
| 261 | .     | BasicAssetList                            | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `pages/assetInw/basicAsset/BasicAssetList.tsx:12-15,39`                                             |
| 262 | .     | BasicAssetListContent                     | ⑤ 컬럼 미분리 + ① 주석 + ③ auto-import | `createColumns` 인라인                                                                                                | Import                         |      | `components/assetInw/basicAsset/basicAssetList/BasicAssetListContent.tsx:19-20,98-197`              |
| 263 | .     | BasicAssetListSearch                      | ① 주석 없음 + ③ auto-import         | 구분선 없음, 명시 import                                                                                                  |                                |      | `components/assetInw/basicAsset/basicAssetList/BasicAssetListSearch.tsx:18-20`                      |
| 264 | .     | BasicAssetReg                             | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `pages/assetInw/basicAsset/BasicAssetReg.tsx:12-14`                                                 |
| 265 | .     | BasicAssetRegContent                      | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `components/assetInw/basicAsset/basicAssetReg/BasicAssetRegContent.tsx:24-34`                       |
| 266 | .     | BasicAssetDetail                          | ④ t 직접 import + ① 주석 없음         | `import { t } from 'i18next'`, 3구역 없음                                                                              |                                |      | `pages/assetInw/basicAsset/BasicAssetDetail.tsx:12`                                                 |
| 267 | .     | BasicAssetDetailContent                   | ① 주석 없음 + ③ auto-import         | 3구역 없음, 명시 import                                                                                                  |                                |      | `components/assetInw/basicAsset/basicAssetDetail/BasicAssetDetailContent.tsx:12-14`                 |
| 268 | .     | CategoryDetail                            | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/std/category/CategoryDetail.tsx`                                                             |
| 269 | .     | FileFormatDetail                          | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/std/fileFormat/FileFormatDetail.tsx`                                                         |
| 270 | .     | AssetFormatBasicDetail                    | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/std/assetFormatBasic/AssetFormatBasicDetail.tsx`                                             |
| 271 | .     | BasicAssetDetail                          | ③ auto-import                   | react·react-i18next·react-router-dom 등 훅 명시 import                                                                 | 명시 import 제거                   |      | `pages/assetInw/basicAsset/BasicAssetDetail.tsx`                                                    |


