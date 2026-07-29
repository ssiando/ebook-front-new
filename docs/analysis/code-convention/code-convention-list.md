# FE 코드 컨벤션 가이드

> 정본: [vanta-admin-front/.claude/rules/page-pattern.md](../../../.claude/rules/page-pattern.md)
> 이 문서는 정본을 **가이드용으로 항목화**한 것이다.

## 요약

| No. | 항목                          | 내용                                                                                                 | 수정방향(위반 시)                                                 |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | 파일 헤더 주석                | 모든 소스 파일 최상단에 `@file`·`@description`·변경 이력 JSDoc 블록                                  | import로 바로 시작·경로 오기 → 헤더 추가·정정                     |
| 2   | 컴포넌트 내부 영역 구분       | 페이지=상태/함수/화면 3구역, 비페이지=상수·유틸/타입/컴포넌트 구분선                                 | 구분선 없음·`01/02/03` 비표준 → 표준 구분선                       |
| 3   | 페이지 레이아웃 구조          | `PageTitle → PageSearch → Content` 고정, `onSearch`로 조회 연결                                      | 레이아웃 어긋남·PageSearch 누락 → 3영역 구성                      |
| 4   | 파일 분리 규칙                | 화면별 `Xxx`·`XxxSearch`·`XxxContent`·`XxxModal`·`xxx-grid.ts`·`xxx-validation-schema.ts`·`types.ts` | 한 파일에 몰림·복붙 잔재 → 역할별 분리                            |
| 5   | Props 최소화·책임 분리        | "변경 이유가 다른 것은 분리". 페이지=업무 흐름, Content=목록 UI·query                                | 페이지네이션·query·로딩 props 흩뿌림 → 책임 제자리                |
| 6   | 전역 컨텍스트(workspaceId)    | `workspaceId`·옵션은 store에서 직접 읽음                                                             | props bag으로 내림 → store 직접 읽기                              |
| 7   | 조회 조건 상태·searchRevision | `appliedSearch`(페이지)·`pageRequest`(Content)·`searchRevision`, 저장은 페이지                       | 페이지가 목록 상태 소유·재조회 누락 → Content 이전·searchRevision |
| 8   | 그리드 컬럼·옵션 `grid.ts`    | `createColumns(...)`·옵션 상수를 `xxx-grid.ts`로 분리                                                | Content 인라인 → `*-grid.ts` 분리                                 |
| 9   | 버튼별 시나리오·messageUtil   | 알림·확인은 `messageUtil`(`common.msg.`*), 저장·삭제 전 confirm 필수                                 | `toast`·`popupStore` 직접 호출·confirm 누락 → messageUtil·confirm |
| 10  | 모달 패턴                     | `XxxModal` 분리, `editItem===null`=신규, open 시 reset, `onSaved()→onClose()`                        | reset·닫기 흐름 어긋남 → 표준 흐름                                |
| 11  | 버튼 비활성화 조건            | 동일 disabled 조건은 변수로 추출                                                                     | 조건 중복 → 변수화                                                |
| 12  | 유효성 검사 스키마            | `defineFormRules`+`validateForm`, `maxLength` 인라인, `FormInput`과 rules 공유                       | plain `z.object` shape만 → `defineFormRules` 전환                 |
| 13  | i18n 키 작성 규칙             | `t()` 3뎁스(점 2개), JSON 4뎁스, `useTranslation`으로 t 사용                                         | 4뎁스 호출·한글 하드코딩·`t` 직접 import → 정비                   |
| 14  | Import·auto-import            | `@/` 절대경로, React 훅·React Router·`useTranslation`은 auto-import(명시 import 금지)                | 명시 import·상대경로 → 제거·`@/`                                  |
| 15  | 경로·파일명                   | 페이지 3depth(`Xxx.tsx` PascalCase), 컴포넌트 4depth(kebab 폴더), `*.ts` kebab-case                  | 경로·파일명 규칙 위반 → 규칙대로                                  |

---

## 1. 파일 헤더 주석

**규칙** — 모든 파일 최상단에 JSDoc 헤더. `MAJOR_ISSUE`는 신규 생성이면 "신규 생성", 변경이면 변경 내용 요약.

```typescript
/**
 * @file pages/system/system-master/Program.tsx
 * @description 프로그램 관리 페이지
 * ---------------------------------------------------------------------
 * Date                     AUTHOR                  MAJOR_ISSUE
 * ---------------------------------------------------------------------
 * 2026.05.08               vanta admin             신규 생성
 */
```

**위반** — import로 바로 시작 / `@file` 경로가 실제와 다름(복붙 잔재).
**수정** — 헤더 블록 추가, `@file` 경로를 실제 경로로 정정.

---

## 2. 컴포넌트 내부 영역 구분

**규칙**

### 2-A. 페이지 컴포넌트 (3구역)

`상태/폼/서버 조회` → `함수` → `화면` 순서로 구분선을 둔다.

```typescript
/*
 * ---------------------------------------------------------------------
 * 상태/폼/서버 조회
 * ---------------------------------------------------------------------
 */
// useState, useForm, useQuery, useXxxQuery 등

/*
 * ---------------------------------------------------------------------
 * 함수
 * ---------------------------------------------------------------------
 */
// useCallback, 이벤트 핸들러, 데이터 변환 등

/*
 * ---------------------------------------------------------------------
 * 화면
 * ---------------------------------------------------------------------
 */
return ( ... );
```

### 2-B. 비페이지 컴포넌트 (XxxSearch·XxxContent·XxxModal 등)

파일 레벨은 `상수·유틸` → `타입` → `컴포넌트` 구분선, 컴포넌트 함수 내부는 다시 `상태/폼/서버 조회` → `함수` → `화면` 3구역을 둔다.

```typescript
/* ---- 상수·유틸 ---- */   // 모듈 레벨 상수, 타입 가드
/* ---- 타입 ---- */        export type XxxContentProps = { ... };
/* ---- 컴포넌트 ---- */
export default function XxxContent({ ... }: XxxContentProps) {
  /* -- 상태/폼/서버 조회 -- */
  /* -- 함수 -- */
  /* -- 화면 -- */
  return ( ... );
}
```

**위반** — 구분선 없음 / `01. 변수선언부` 같은 비표준 구분선.
**수정** — 표준 3구역(또는 2-B) 구분선으로 통일.

---

## 3. 페이지 레이아웃 구조

**규칙** — 페이지는 `PageTitle → PageSearch → Content` 세 영역 고정.

- `PageTitle` — 제목·액션 버튼(조회/저장)·설명 문구. 조회/저장은 `actionButtonsProps.onSearch`/`onSave`.
- `PageSearch` — 조회 폼 래퍼. 내부에 `XxxSearch`.
- `XxxContent` — 그리드·모달·엑셀 등 핵심 UI 전체.

```tsx
return (
  <>
    <PageTitle
      title="화면 제목"
      actionButtonsProps={{ onSearch: handleSearch, onSave: handleSave }}
    >
      <p>화면 설명 한 줄</p>
    </PageTitle>
    <PageSearch control={control}>
      <XxxSearch control={control} onSearch={handleSearch} />
    </PageSearch>
    <XxxContent ref={contentRef} appliedSearch={appliedSearch} onReload={handleReload} />
  </>
)
```

**Early return** — `workspaceId` 미선택이면 화면 구역 진입 전에 빈 상태를 반환한다. `화면` 구분선은 early return **이후**에 둔다.

```tsx
if (workspaceId <= 0) {
  return (
    <>
      <PageTitle title={t('xxx.title')} />
      <div className="...">{t('xxx.selectWorkspaceFirst')}</div>
    </>
  )
}
```

**위반** — 3영역 구성 안 됨 / `PageSearch` 래퍼 없이 바로 콘텐츠 / 조회 버튼이 `onSearch`가 아님.
**수정** — 3영역으로 구성, 조회를 `onSearch`로 연결.

---

## 4. 파일 분리 규칙

**규칙** — 한 화면은 역할별 파일로 나눈다.

```
pages/{대}/{중}/Xxx.tsx                  ← 라우트 진입점
components/{대}/{중}/xxx/XxxSearch.tsx    ← 조회 폼
components/{대}/{중}/xxx/XxxContent.tsx   ← 그리드·모달·엑셀 UI
components/{대}/{중}/xxx/XxxModal.tsx     ← 등록/수정 모달
components/{대}/{중}/xxx/xxx-grid.ts      ← 컬럼·옵션·행 변환
components/{대}/{중}/xxx/xxx-validation-schema.ts ← Zod 스키마·폼 타입
components/{대}/{중}/xxx/types.ts         ← 화면 전용 타입
```

### 각 파일의 책임

| 파일                     | 소유                                                                                        | 비소유                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 페이지                   | 조회·저장 업무 흐름, 검색 폼 상태·적용된 검색 조건, 저장 mutation, PageTitle 액션, 레이아웃 | UI 이벤트 세부(Enter 등), Content 내부 행 추가·삭제, 기본 페이지네이션 상태 |
| XxxSearch                | 조회 폼 렌더링, Enter→조회, 옵션(전역 컨텍스트에서 직접 조회)                               | 검색 결과, 그리드 조작, keydown을 부모에서 받기                             |
| XxxContent               | 그리드 표시, page/size/sort, 목록 query hook, 행 조작, 모달 열기/닫기, 엑셀                 | 조회 폼, PageTitle 액션, 업무 저장 로직                                     |
| xxx-grid.ts              | 컬럼 정의·옵션 상수·신규 행 초기값·행↔요청 변환                                             | React 훅·JSX                                                                |
| xxx-validation-schema.ts | Zod 스키마·폼 타입                                                                          | 비즈니스 로직                                                               |

### 그리드 ref·저장 API 소유 기준

```
PageTitle에 저장 버튼이 있는가?
├── YES
│   ├── 단일 그리드·단순 저장 → 페이지가 gridRef 직접 소유 허용
│   └── 다중 그리드·복합 저장 → Content가 ref 소유, useImperativeHandle로 좁은 저장용 API만 노출
└── NO
    └── ref는 Content 내부 소유
```

복합 저장은 raw `gridRef` 대신 화면 전용 handle을 노출한다.

```typescript
export type XxxContentHandle = { getSavePayload: () => XxxSavePayload; resetDirty?: () => void }
// 노출 API는 getSavePayload·getModifiedRows·resetDirty 같은 최소 명령으로 제한
```

**anti-pattern** — Content 내부용 핸들러를 페이지에서 선언해 props로 내리지 않는다.

```typescript
// ❌ 나쁨 — Content에서만 쓰는 핸들러를 페이지가 선언
<XxxContent onAddPrimaryRow={handleAddPrimaryRow} onRemovePrimaryChecked={...} />
// ✅ 좋음 — Content 내부에서 선언·사용
```

**위반** — 한 파일에 다 몰림 / `@file`·함수명·import가 다른 화면 복붙 / 컬럼·타입 인라인.
**수정** — 역할별 파일 분리, 복붙 잔재 정정.

---

## 5. Props 최소화·책임 분리

**규칙** — 역할 분리의 핵심은 **"변경 이유가 다른 것은 분리한다"**.

- "조회 조건에 날짜 추가" 같은 요청은 페이지를, "컬럼 순서·페이지 사이즈·무한 스크롤" 같은 요청은 Content를 건드린다.
- query hook은 검색 조건(props)과 page/size(내부 상태)를 합치므로 **page/size를 가진 Content 안**에 둔다.
- 저장·삭제는 후처리(invalidation·선택 초기화·메시지·상세 패널 초기화)가 페이지 전체에 영향을 주므로 **페이지가 소유**한다.

**Props 개수 기준** — 개수가 아니라 **소유권**으로 판단.

- `XxxSearch`: `control`·`onSearch` 1~3개가 정상.
- 6개 초과면 소유권 재검토, **10개 이상이면 리팩터링 대상**.
- 같은 도메인 접두어가 반복되면 책임이 섞였다는 신호.

**축소 순서**

1. 조회·저장·API·invalidation은 페이지에 남긴다.
2. Enter·page change·sort change 같은 UI 이벤트 세부는 발생한 컴포넌트에서 처리.
3. 행 추가·삭제·체크 행 제거·그리드 선택은 Content로 내린다.
4. 자식이 버튼을 렌더하면 로직이 아니라 `onSearch`·`onSave` 콜백을 받는다.
5. 데이터가 많으면 의미 단위 업무 모델로 묶는다(`pagination` 같은 bag 금지).
6. 그리드 2개 이상이면 `XxxPrimarySection`처럼 하위 섹션으로 분리.

**Context 금지** — Props 많다는 이유로 화면 전용 Context를 만들지 않는다. (3단계 이상 떨어진 여러 곳에서 같은 상태를 읽고, 전역 스토어로 올리면 안 되고, 좁고 명확한 값일 때만 예외)

**위반** — 페이지가 `pageInfo`·목록 query·`isLoading`을 소유해 Content/Grid에 `onPageChange`·`pageData`·`isLoading` 등 흩뿌림.
**수정** — 목록 상태·query를 Content로 내리고, 페이지는 업무 흐름 콜백만 전달.

---

## 6. 전역 컨텍스트 (workspaceId)

**규칙** — `workspaceId`·옵션 목록은 Search/Content 내부에서 store(`useActiveContextStore`·`useAuthStore`)로 직접 읽는다. form/searchParams·props로 넘기지 않는다.

```typescript
// XxxSearch — 옵션도 내부에서 계산, Props는 control·onSearch만
export default function XxxSearch({ control, onSearch }: XxxSearchProps) {
  const user = useAuthStore((s) => s.user)
  const activeWorkspaceId = useActiveContextStore((s) => s.workspaceId)
  const systemSelectOptions = useMemo(
    () => systemOptionsForAuthUser(user, activeWorkspaceId ?? 0, SYSTEM_OPTIONS),
    [user, activeWorkspaceId],
  )

  const handleKeywordKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      onSearch() // Enter 처리는 Search 내부에서
    },
    [onSearch],
  )
}
```

**위반** — `workspaceOptions`·`systemOptions`·`workspaceId`를 props로 내림 / `onFilterKeyDown`을 페이지에서 만들어 Search로 넘김.
**수정** — store에서 직접 읽기, Enter 처리는 Search 내부에서.

---

## 7. 조회 조건 상태·searchRevision

**규칙**

- 폼 값(`control`)과 확정 조회 조건(`appliedSearch`)은 분리한다. 페이지는 조회 버튼으로 확정되는 검색 조건을 소유한다.
- Content는 `pageRequest`(page/size/sort)와 목록 query hook을 소유한다. query hook이 검색조건(props)+page/size(내부)를 합쳐 실행한다.
- 페이지네이션·정렬·사이즈 변경은 **Content 내부에서 완결**된다(부모에 알리지 않음).

| 소유자  | 소유하는 것                                                            | 변경 시점                    |
| ------- | ---------------------------------------------------------------------- | ---------------------------- |
| 페이지  | `appliedKeyword`·`appliedIsActive` 등 확정 검색 조건, `searchRevision` | 조회 버튼 클릭               |
| Content | `pageRequest` (page, size, sort)                                       | 페이지 이동·사이즈 변경·정렬 |

**searchRevision — 동일 조건 재조회** — `appliedSearch`가 동일하면 query key가 안 바뀌어 refetch가 안 된다. 정수 카운터를 query key에 포함하고 조회 시 `+1` 한다.

```typescript
// 페이지
const [searchRevision, setSearchRevision] = useState(0)
const handleSearch = handleSubmit((v) => {
  setAppliedSearch(buildSearchReq(v))
  setSearchRevision((n) => n + 1) // 같은 조건이어도 재조회
})

// query hook — searchRevision은 queryKey에만, queryFn(API)에는 미전달
export function useXxxQuery(params, searchRevision?, enabled = true) {
  return useQuery({
    queryKey: xxxQueryKeys.list({ ...params, searchRevision }),
    queryFn: () => fetchXxx(params),
    enabled,
  })
}
```

- `useEffect`+`refetch()` 조합은 `react-hooks/set-state-in-effect` 경고를 유발하므로 쓰지 않는다.

**저장은 반드시 페이지가 소유** — 저장 API·유효성 메시지·invalidation은 페이지에만 둔다. Content는 `useImperativeHandle`로 저장 대상 데이터·reload 함수만 노출한다.

```typescript
// 페이지
const handleSave = useCallback(() => {
  const modified = contentRef.current?.getModifiedRows()
  if (!modified) return
  messageUtil.showConfirm('', t('common.msg.confirm_save'), async () => {
    await saveItems(modified)
    await invalidateXxxQueries() // invalidation: 페이지 책임
    await contentRef.current?.reload() // reload 트리거: 페이지가 요청
    messageUtil.showAlert('', t('common.msg.save_complete'))
  })
}, [t])
```

**서버 사이드 필터링** — `appliedSearch`는 클라이언트 필터용이 아니라 **서버 쿼리 파라미터**로 전달한다. 필수 조건은 `enabled`로 제어.

**예외(페이지가 query를 소유해야 할 때)** — 저장 후 invalidation·다중 Content 동시 조회·URL 동기화처럼 페이지 단위 조율이 필요하면 페이지가 query를 소유할 수 있다. 이때도 `onPageChange`를 낱개로 흩뿌리지 말고 `XxxListModel`(전용 훅)로 묶는다.

**위반** — 페이지가 `pageInfo`·목록 query 소유 / `removeQueries`로 캐시 선삭제 / searchRevision 없어 동일 조건 재조회 안 됨 / 저장 후 갱신 누락.
**수정** — 목록 상태·query는 Content, 재조회는 `searchRevision++`, 저장 후 `invalidateQueries`/`searchRevision++`.

---

## 8. 그리드 컬럼·옵션 `grid.ts`

**규칙** — 컬럼 정의·옵션 상수·신규 행·행↔요청 변환을 `xxx-grid.ts`로 분리한다(React 훅·JSX 금지).

**옵션 상수** — 빈 항목(전체/선택 안함)은 상수에 넣지 않고 사용처에서 앞에 붙인다.

```typescript
export const SOME_OPTIONS = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
]
// 검색: [{ value: '', label: '전체' }, ...SOME_OPTIONS]
// 등록: [{ value: '', label: '선택 안함' }, ...SOME_OPTIONS]
```

**신규 행·행 상태** — 신규 행은 음수 임시 id(`crypto.randomUUID()` clientKey). `id > 0`이면 저장된 행 → 읽기 전용(수정은 모달).

```typescript
export function isPersistedRow(idRaw: string | number): boolean {
  const id = typeof idRaw === 'number' ? idRaw : Number(String(idRaw ?? '').trim())
  return Number.isFinite(id) && id > 0
}
```

**바이트 검증** — DB `varchar(N)`은 UTF-8 바이트 기준 제한. 상한 상수·검증기 팩토리를 grid.ts에 둔다.

```typescript
export const XXX_GRID_MAX_BYTES = { code: 50, name: 200, description: 500 } as const
export const createXxxByteGridValidator = (t, maxBytes) =>
  createMaxByteLengthGridValidator(maxBytes, t('common.validation.maxLength'))
```

| DB 타입            | 바이트 검증                              |
| ------------------ | ---------------------------------------- |
| `varchar(N)`       | `byteFn(N)` (한글은 문자 수 ≠ 바이트 수) |
| `bigint`/`integer` | 없음 (`editor: 'number'`)                |
| `boolean`          | 없음 (`editor: 'checkbox'`)              |
| `jsonb`            | JSON 형식 검증만                         |

**트리 그리드** — `treeOptions`에 `parentField` 지정 시 DataGrid가 트리를 구성, 펼침 상태는 별도 state.

**위반** — `createColumns(...)`를 Content/Page 인라인 / `*Grid.tsx` 컴포넌트로만 존재.
**수정** — `xxx-grid.ts`로 컬럼·옵션 분리.

---

## 9. 버튼별 시나리오·messageUtil

**규칙** — 알림·확인은 `toast`/`popupStore` 직접 호출 대신 `messageUtil.showAlert`·`showConfirm`·`showMessage`. 제목은 `''`, 메시지는 `common.msg.*`. 저장·삭제 전 confirm 필수.

**주요 메시지 키**

| 키                                     | 설명                                 | 종류    |
| -------------------------------------- | ------------------------------------ | ------- |
| `common.msg.no_changes`                | 변경 사항이 없습니다                 | alert   |
| `common.msg.confirm_save`              | 저장하시겠습니까?                    | confirm |
| `common.msg.save_complete`             | 저장이 완료되었습니다                | alert   |
| `common.msg.confirm_new_write`         | 작성중인 내용이 있습니다. 새로 작성? | confirm |
| `common.msg.required_search_condition` | 필수 조회조건을 설정해 주세요        | alert   |
| `common.msg.saved_only_deletable`      | 저장한 데이터만 삭제 가능            | alert   |
| `common.msg.confirm_delete`            | 삭제하시겠습니까?                    | confirm |
| `common.msg.delete_complete`           | 삭제 완료되었습니다                  | alert   |
| `common.msg.select_row_to_delete`      | 삭제할 행을 선택해 주세요            | alert   |

**버튼 흐름**

| 버튼 | 흐름                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| 저장 | 변경 없음→`no_changes` / 변경 있음→`confirm_save`→저장→`save_complete`                                                   |
| 신규 | 미저장 있음→`confirm_new_write`→폼 / 없음→폼 바로                                                                        |
| 삭제 | 선택 없음→`select_row_to_delete` / 미저장 포함→`saved_only_deletable` / 저장행만→`confirm_delete`→삭제→`delete_complete` |
| 조회 | 필수 조건 미설정→`required_search_condition`                                                                             |

```typescript
const handleSave = useCallback(() => {
  const newRows = gridRef.current?.getModifiedRows().createdRows ?? []
  if (newRows.length === 0) {
    messageUtil.showAlert('', t('common.msg.no_changes'))
    return
  }
  messageUtil.showConfirm('', t('common.msg.confirm_save'), async () => {
    for (const row of newRows) await createXxx(workspaceId, gridRowToCreateRequest(row))
    messageUtil.showAlert('', t('common.msg.save_complete'))
    await invalidateXxxQueries()
  })
}, [workspaceId, t])
```

**위반** — `toast.success(...)` / `popupStore.openConfirm` 직접 / 저장·삭제에 confirm 없이 즉시 mutate.
**수정** — `messageUtil` + `common.msg.*`로 통일, 저장·삭제 전 confirm.

---

## 10. 모달 패턴

**규칙**

- 등록·수정 모달은 `XxxModal`로 분리. `editItem: Xxx | null` (null=신규, 값=수정).
- open 시 `useEffect`로 reset(`isEdit` 분기). 닫기 핸들러는 `useCallback`. `keepDefaultValues: true` 사용 안 함.
- 저장 성공 시 `onSaved()` → `onClose()` 순서. 편집 모드에서 변경 없으면 `isDirty`로 guard.
- 폼 기본값은 상수(`XXX_FORM_DEFAULTS`)로 추출해 `defaultValues`·`reset` 양쪽 재사용.

```typescript
const XXX_FORM_DEFAULTS: XxxFormValues = { code: '', name: '' /* … */ }

useEffect(() => {
  if (!open) return
  reset(isEdit ? { code: editItem.code /* … */ } : XXX_FORM_DEFAULTS)
}, [open, isEdit, editItem, reset])

const onSubmit = handleSubmit(async (values) => {
  if (isEdit && !isDirty) {
    messageUtil.showAlert('', t('common.msg.no_changes'))
    return
  }
  // ...
})
```

모달 렌더 조건이 복잡하면 타입 가드 함수로 분리해 TS narrowing을 활용한다.

**위반** — reset/닫기 흐름 어긋남 / `keepDefaultValues:true` / 디버그 `console.log` 잔재.
**수정** — 표준 reset·`onSaved→onClose` 흐름.

---

## 11. 버튼 비활성화 조건

**규칙** — 그리드 위 버튼들의 동일 `disabled` 조건은 변수로 추출.

```typescript
const actionsDisabled = !workspaceId || !systemId
extraButtons: [
  { label: '단 건 등록', onClick: handleAdd, variant: 'primary', disabled: actionsDisabled },
  { label: '삭제', onClick: handleRemove, variant: 'danger', disabled: actionsDisabled },
]
```

**위반** — 동일 조건을 버튼마다 반복.
**수정** — 공통 조건 변수화.

---

## 12. 유효성 검사 스키마

**규칙** — `defineFormRules`+`validateForm`으로 스키마 작성. `required`·`maxLength`를 인라인 명시해 `FormInput`의 `required`/`maxLength`와 같은 객체 재사용.

**varchar** — `formMaxLengthForAsciiVarchar`/`formMaxLengthForKoreanVarchar`로 길이 계산. `superRefine`로 maxLength 동적 제어 금지(FormInput이 정적 상한으로 제한).

```typescript
export const XXX_FORM_MAX_BYTES = { cd: 100, nm: 200, descp: 500 } as const;
export const XXX_FORM_MAX_LENGTH = {
  cd: formMaxLengthForAsciiVarchar(XXX_FORM_MAX_BYTES.cd),
  nm: formMaxLengthForKoreanVarchar(XXX_FORM_MAX_BYTES.nm),
} as const;

export const xxxFormRules = defineFormRules({
  code: { type: 'string', required: true, maxLength: XXX_FORM_MAX_LENGTH.cd },
  name: { type: 'string', required: true, maxLength: XXX_FORM_MAX_LENGTH.nm },
  isActive: { type: 'boolean' },
});
export const xxxFormSchema = validateForm(xxxFormRules);
export type XxxFormValues = z.infer<typeof xxxFormSchema>;

// FormInput — rules 객체 직접 참조 (별도 상수 중복 import 금지)
<FormInput control={control} name="code" required={xxxFormRules.code.required} maxLength={xxxFormRules.code.maxLength} />
```

**위반** — plain `z.object`로 shape·타입만 정의(검증 규칙 없음).
**수정** — `defineFormRules`+`validateForm` 전환(검색 전용 선택 조건은 예외).

---

## 13. i18n 키 작성 규칙

**규칙**

- `t()` 호출은 **3뎁스**(`namespace.area.specificKey`, 점 2개). JSON은 4뎁스(값 포함). DB 이관 시 시스템 prefix가 붙어 최종 4뎁스가 되므로 FE는 3뎁스로 둔다.
- `t`는 `const { t } = useTranslation();`으로 얻는다(`useTranslation`은 auto-import).

**라벨 종류별 depth**

| 라벨 종류            | depth                  | 예시                      |
| -------------------- | ---------------------- | ------------------------- |
| 업무 화면별          | 3 (추후 4로 DB insert) | `system-master.col.price` |
| 시스템 공통          | 3 (추후 4로 DB insert) | `common.user.status`      |
| 전역 공통(common-fe) | 4 (항상)               | `common.ui.btn.confirm`   |

**JSON 파일 구조** — 파일 루트 = namespace(중메뉴·파일명, kebab-case) → area → specificKey(camelCase).

```json
// user-permission.json
{
  "user-permission": {
    "title": { "userManage": "사용자 관리" },
    "col": { "userId": "ID", "userName": "이름" },
    "msg": { "userDeleteConfirm": "삭제하시겠습니까?" }
  }
}
```

- **네임스페이스(파일) 결정**: 화면이 속한 **중메뉴(2 depth)** = JSON 파일명. 화면명은 파일 분리 기준이 아니다.
- **area 예약어**: `title`·`msg`·`search`·`col`·`btn`·`modal`·`excel`·`detail`. 화면 전용이 필요하면 `{화면명}{Area}` 조합(`i18nSearch`).

**위반 케이스**

| 케이스               | ❌                               | ✅                                        |
| -------------------- | -------------------------------- | ----------------------------------------- |
| t 직접 import        | `import { t } from 'i18next'`    | `const { t } = useTranslation()`          |
| 업무 라벨 3뎁스 아님 | `t('bbs.list.col.bbsId')`(4뎁스) | `t('bbs.col.bbsId')`(3뎁스)               |
| 1뎁스가 시스템명     | `{ "aion": { … } }`              | 중메뉴를 1뎁스로 `{ "dashboard": { … } }` |
| 한글 하드코딩        | `label: '전체'`                  | `t('deployment.search.statusAll')`        |

**수정** — 3뎁스로 재구성, `useTranslation` 사용, 하드코딩 → `t()`, 시스템명 최상위 래핑 제거(중메뉴 단위 파일).

---

## 14. Import·auto-import

**규칙** — 모든 import는 `@/` 절대경로(상대경로 `../`는 같은 폴더 형제 정도로 제한). 아래는 **auto-import 대상**이라 명시 import 하지 않는다(`auto.d.ts` 기준).

- React 훅: `useState`·`useEffect`·`useCallback`·`useMemo`·`useRef`·`useImperativeHandle` 등
- React Router: `useNavigate`·`useParams`·`useLocation`·`Link`·`Navigate`·`Outlet` 등
- i18n: `useTranslation`

```typescript
// ❌
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SomeComponent } from '../../components/SomeComponent'
// ✅ — 훅은 선언 없이 사용, @/ 절대경로만 import
import { useXxxQuery } from '@/query/xxx-query'
const { t } = useTranslation()
const navigate = useNavigate()
```

**위반** — auto-import 대상을 명시 import / 상대경로(`../`).
**수정** — 명시 import 제거, `@/` 절대경로.

---

## 15. 경로·파일명

**규칙**

| depth | 의미                  | 형식       | 예시                               |
| ----- | --------------------- | ---------- | ---------------------------------- |
| 1     | 대메뉴                | kebab-case | `system`, `sales`                  |
| 2     | 중메뉴                | kebab-case | `system-master`, `user-permission` |
| 3     | 화면명(페이지 파일)   | PascalCase | `Program.tsx`                      |
| 3→4   | 화면명(컴포넌트 폴더) | kebab-case | `program/`                         |

- 페이지는 **3 depth**(`pages/{대}/{중}/Xxx.tsx`), 컴포넌트는 **4 depth**(`components/{대}/{중}/xxx/...`).
- 페이지·컴포넌트 파일(`*.tsx`)은 **PascalCase**, `*.ts` 파일(grid·schema·util 등)은 **kebab-case**.

```
// ❌  nodeListSearchSchema.ts, CreateVersionSchema.ts
// ✅  node-list-search-schema.ts, create-version-schema.ts
```

**위반** — 경로 depth 불일치 / `*.ts`가 camelCase·PascalCase.
**수정** — 경로 규칙 정렬, `*.ts`는 kebab-case로 rename.
