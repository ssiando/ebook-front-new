---
name: new-screen
description: Scaffold a new admin list screen in the ebook project (types/api/query/components/{domain}/list + page + sidebar entry), following the project's established PageTitle → PageSearch → 본문 convention with Ag-Grid, react-hook-form+Zod, and a dev-mock API layer. Use whenever asked to add a new "OO 관리" / "OO 목록" screen, or to replicate the 사용자 관리 / 프로그램 관리 pattern for a new domain.
user-invocable: true
---

# 새 관리 화면 스캐폴딩

이 스킬은 `c:\AI\ebook` 프로젝트에서 이미 확립된 화면 규격으로 새 도메인 목록 화면을 만듭니다.
전체 규격 문서는 **[CLAUDE.md](../../../CLAUDE.md)** 이고, 실제 정본 구현은
`src/pages/UserManagement.tsx`(검색 기간+페이지네이션 포함, full) 와
`src/pages/ProgramManagement.tsx`(다중 필터+인라인 편집 그리드) 입니다.
새로 만들기 전에 이 둘을 먼저 읽고 그대로 따라가세요 — 구조를 재해석하거나 새 패턴을 만들지 마세요.

## 이미 있는 공통 인프라 (재생성 금지)

| 조각                  | 위치                                                                     | 비고                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 앱 셸                 | `components/layout/{Header,Sidebar,TabBar,MainLayout}.tsx`               | 손대지 않음                                                                                                                                                          |
| 페이지 제목/조회 영역 | `components/common/{PageTitle,PageSearch}.tsx`                           | `@vanta/common` 로컬 대체                                                                                                                                            |
| 페이지네이션          | `components/common/Pagination.tsx`                                       | 번호형, `totalPages<=1`이면 렌더 안 함                                                                                                                               |
| 기본 UI               | `components/common/ui/{Button,Modal,Badge}.tsx`                          |                                                                                                                                                                      |
| 폼 입력               | `components/common/form/{FormInput,FormSelect}.tsx`                      | `<TFieldValues extends FieldValues>` 제네릭, `control`/`useController` 기반, `FormProvider`·`any` 안 씀, `id`/`htmlFor` 연결됨, `required` prop 주면 라벨에 `*` 표시 |
| 폼 검증 유틸          | `utils/formUtils.ts` (`defineFormRules`/`validateForm`/`showFormErrors`) | `@vanta/common` 로컬 대체, 패턴 A 기본                                                                                                                               |
| 토스트 팝업           | `store/useToastStore.ts` + `components/common/ui/ToastHost.tsx`          | `showFormErrors`가 사용, `AppProviders`에 이미 마운트됨                                                                                                              |
| axios 인스턴스        | `lib/axios.ts`                                                           |                                                                                                                                                                      |
| ag-grid 모듈 등록     | `lib/ag-grid.ts` (providers에서 import됨)                                | 화면마다 다시 등록할 필요 없음                                                                                                                                       |
| mock 지연 유틸        | `utils/delay.ts`                                                         |                                                                                                                                                                      |
| 사이드바 메뉴 데이터  | `data/menu.json`                                                         | 새 화면은 여기 항목만 추가                                                                                                                                           |
| 라우팅                | `router/index.tsx`                                                       | `pages/PascalCase.tsx` → `/pascalCase` 자동 매핑, 손대지 않음                                                                                                        |
| 전역 UI 상태          | `store/useUiStore.ts` (탭/사이드바)                                      | 도메인 전용 상태만 `store/biz/`에 추가                                                                                                                               |

## 체크리스트 (도메인명을 `{Domain}` = PascalCase, `{domain}` = camelCase 라 하자)

1. **`types/{domain}.ts`** — 도메인 아이템 인터페이스, `{Domain}ListResponse { items, totalCount }`,
   검색 파라미터 인터페이스, (등록 폼이 있으면) `Create{Domain}Payload`.
2. **`api/{domain}-api.ts`** — `fetchXxx(params)`가 `import.meta.env.DEV`일 때 모듈 스코프 mock 배열을 필터링해
   반환. **주의**: 반환하는 `items`는 항상 새 배열(`filtered` 또는 `[...MOCK]`)이어야 함 — mock 배열
   참조를 그대로 넘기면 등록 후 그리드가 갱신되지 않는 실제 버그가 남(과거에 한 번 발생했음). 상단에
   "백엔드 연동 전까지 mock 사용, 실 연동 시 분기 제거" 주석 남기기.
3. **`query/{domain}-query.ts`** — `use{Domain}sQuery(params)` (`queryKey`에 params 포함, `placeholderData: prev => prev`),
   등록 화면이 있으면 `useCreate{Domain}Mutation()` (`onSuccess`에서 `invalidateQueries`).
4. **`components/{domain}/list/{domain}SearchSchema.ts`** — `defineFormRules` + `validateForm`(`@/utils/formUtils`, 패턴 A)로
   필드별 `label`/`required` 등을 정의하고 스키마 생성 + `type {Domain}SearchFormValues`. enum select처럼
   패턴 A 규칙 모양을 벗어나는 필드가 있으면 `z.object`를 직접 쓰는 패턴 B로 (예: `UserCreateModal`의 `role`).
   CLAUDE.md "폼 검증 가이드" 참고.
5. **`components/{domain}/list/{Domain}Search.tsx`** — 검색 필드만 렌더 (래퍼/리셋버튼 없음 — `PageSearch`가 담당).
   `control: Control<{Domain}SearchFormValues>` prop을 (제네릭으로 열어두지 말고 해당 폼의 구체 타입으로)
   받아 각 `FormInput`/`FormSelect`에 그대로 전달할 것 (`FormProvider`는 쓰지 않는다).
6. **`components/{domain}/list/{Domain}ListGrid.tsx`** — `AgGridReact`, `themeQuartz.withParams({...})` 재사용
   (다른 Grid 컴포넌트에서 그대로 복사), 컬럼: No → 도메인 필드들 → 링크형 컬럼 → 수정일.
7. **`components/{domain}/list/{Domain}Content.tsx`** — 총 건수(`● 목록 총 N건`, 앞에 rose-500 점) +
   페이지 크기 선택(필요시) + Grid + `Pagination`(페이지네이션 필요한 화면만).
8. **(선택) `components/{domain}/list/{Domain}CreateModal.tsx`** — `Modal` + RHF+Zod 폼, `MenuCreateModal.tsx`
   또는 `UserCreateModal.tsx` 복사해서 필드만 교체.
9. **`pages/{Domain}.tsx`** — 아래 뼈대 그대로:

```tsx
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { {Domain}Search } from '@/components/{domain}/list/{Domain}Search'
import { {domain}SearchRules, {domain}SearchSchema, type {Domain}SearchFormValues } from '@/components/{domain}/list/{domain}SearchSchema'
import { {Domain}Content } from '@/components/{domain}/list/{Domain}Content'
// import { {Domain}CreateModal } from '@/components/{domain}/list/{Domain}CreateModal' // 등록 있을 때만
import { use{Domain}sQuery } from '@/query/{domain}-query'
import type { {Domain}SearchParams } from '@/types/{domain}'
import { showFormErrors } from '@/utils/formUtils'

export default function {Domain}() {
  const [params, setParams] = useState<{Domain}SearchParams>({ /* 기본값 */ })
  const [createOpen, setCreateOpen] = useState(false) // 등록 있을 때만

  const methods = useForm<{Domain}SearchFormValues>({
    resolver: zodResolver({domain}SearchSchema),
    defaultValues: { /* 기본값 */ },
  })

  const { data, isFetching } = use{Domain}sQuery(params)

  const handleSearch = methods.handleSubmit(
    (values) => setParams((prev) => ({ ...prev, ...values })),
    (errors) => showFormErrors(errors, {domain}SearchRules), // 검증 실패 시 토스트 요약
  )
  const handleReset = () => {
    const defaults = { /* 기본값 */ }
    methods.reset(defaults) // PageSearch는 폼을 들고 있지 않으므로 리셋은 페이지가 직접 호출
    setParams((prev) => ({ ...prev, ...defaults }))
  }

  return (
    <>
      {/* 1. 타이틀 — breadcrumb은 생략하면 menu.json에서 자동 탐색됨 */}
      <PageTitle
        title="{Domain} 목록"
        actionButtonsProps={{ onSearch: handleSearch, onRegister: () => setCreateOpen(true) }}
      />
      {/* 2. 조회 — control을 직접 전달, 리셋 버튼은 PageSearch가 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <{Domain}Search control={methods.control} />
      </PageSearch>
      {/* 3. 본문 */}
      <{Domain}Content data={data} isLoading={isFetching} /* page, pageSize, onPageChange 등 필요시 */ />
      {/* <{Domain}CreateModal open={createOpen} onClose={() => setCreateOpen(false)} /> */}
    </>
  )
}
```

파일 이름이 그대로 URL이 된다 (`pages/{Domain}.tsx` → `/{domain}`) — `router/index.tsx`를 손댈 필요 없음.

10. **`data/menu.json`**에 사이드바 항목 추가 — 적절한 상위 그룹(children) 안에
    `{ "id": "{domain}", "label": "{Domain 한글명}", "path": "/{domain}" }` 삽입.
    최상위(depth 0) 항목을 새로 추가하는 경우에만 `components/layout/menuIcons.tsx`에 아이콘 매핑 추가.
11. **(선택) i18n** — 다국어가 필요한 화면이면 `i18n/locales/{ko,en}/{domain}.json` 추가하고
    `i18n/index.ts`의 `resources`에 등록. 데모/내부용 화면은 생략하고 하드코딩된 한글 문자열만 써도 무방
    (프로그램 관리·역할 관리 등이 이 방식).

## 검증

1. `npx tsc -b --noEmit` — 타입 에러 0개.
2. `npm run build` — 번들 성공 확인 후 `dist/` 삭제.
3. 가능하면 `npm run dev`로 띄우고 새 라우트에 접속해 조회/초기화/등록이 실제로 동작하는지 확인.
   Playwright가 필요하면 `npm install -D playwright && npx playwright install chromium`로 임시 설치하고,
   검증이 끝나면 **반드시 `npm uninstall playwright`로 다시 제거** (이 프로젝트의 확정 기술 스택에 없음).
4. 검증에 쓴 스크린샷/임시 스크립트는 작업 후 삭제.

## 자주 하는 실수

- `PageSearch` 안의 검색 폼은 `<form onSubmit>` 태그로 감싸지 않는다 — `PageTitle`의 조회/등록 버튼은
  `type="button"` + `onClick`으로만 동작한다 (네이티브 submit과 안 섞음).
- `FormInput`/`FormSelect`/`{Domain}Search`는 `FormProvider` 없이 `control` prop을 직접 받는다.
  페이지에서 `methods.control`을 그대로 내려주면 된다 — `any` 캐스팅은 필요 없다(아래 항목 참고).
- **등록 모달의 `<form>`에는 반드시 `noValidate`를 붙인다.** 안 붙이면 `required` 속성이 있는
  `<input>`에서 브라우저 네이티브 검증이 Zod 검증보다 먼저 가로채 `onSubmit`/`showFormErrors`가 아예
  실행되지 않는다 (실제로 겪었던 버그).
- mock API가 배열을 그대로(참조 동일하게) 반환하면 등록 후 그리드가 갱신되지 않는다 — 항상 새 배열을 반환.
- **행 하나를 수정(update)하는 mock API도 같은 문제가 있다**: 기존 객체를 `obj.field = x`로 mutate하면
  Ag-Grid가 참조 동일성으로 변경 감지를 못해 그 행만 그대로 남는다(실제로 역할 관리의 "메뉴 설정" 저장에서
  발생했던 버그). 배열 안의 해당 원소를 `{ ...old, field: x }`로 만든 **새 객체**로 교체할 것.
- Ag-Grid는 `theme={themeQuartz.withParams(...)}`를 쓰고 별도 CSS import는 하지 않는다(v33+ Theming API).
- 체크박스 트리처럼 상태를 부모→자식으로 계단식(cascade)으로 반영해야 하면, 개별 id 하나씩 여러 번
  `setState`를 부르지 말고 영향받는 id 배열 전체를 한 번의 콜백(`onToggleGroup(ids, checked)`)으로 모아
  단일 `setState` 안에서 처리한다 (`components/role/list/MenuCheckboxTree.tsx` 참고).
- `formUtils.ts`의 `validateForm`을 직접 손대는 경우: 반환값을 `z.ZodType<...>`으로 캐스팅하면
  `zodResolver`가 요구하는 input/output 제네릭이 어긋나 타입 에러가 난다. 반드시 제대로 타입이 잡힌
  `shape` 객체를 만들어 `z.object(shape)`를 캐스팅 없이 그대로 반환할 것 (이미 구현된 대로 두면 됨,
  건드릴 필요는 거의 없다).
- **`any`를 쓰지 않는다.** `FormInput`/`FormSelect`는 `<TFieldValues extends FieldValues>` 제네릭
  컴포넌트라 `control`/`name`이 호출부의 구체 타입으로 자동 추론된다. `{Domain}Search`의 `control` prop도
  `Control<any>`가 아니라 `Control<{Domain}SearchFormValues>`처럼 해당 폼의 구체 타입으로 선언할 것 —
  이렇게 하면 캐스팅 없이 `methods.control`을 그대로 내려줘도 타입이 맞는다. (`Control<any,any,any>` +
  `as` 캐스팅으로 우회하던 이전 방식은 실제 타입 안전성을 잃는 잘못된 해법이었다 — RHF `Control<T>`의
  `validate` 프로퍼티가 반공변이라 구체 타입을 `any`로 좁힌 타입에 그냥 대입하면 에러가 나는데, 정답은
  `any`로 우회하는 게 아니라 컴포넌트를 제네릭으로 만들어 타입을 그대로 흘려보내는 것이다.)
