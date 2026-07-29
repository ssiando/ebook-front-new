# DataGrid 개발 가이드

### 최근 반영 요약 (2026-06-02 · v0.2)

| 구분            | 내용                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **신규**        | `exportToExcel` · `exportToPdf` · `editor: 'combobox'` · `dateOptions.calendarMode` · `IconCell`/`iconOptions` · `wordWrap` · `htmlContent`/`HtmlCell` · `resize`/`destroy`/`setProp` · `styleFunction` · `subfooterData.aggregateDirection` (`above`/`below`) · **`isCheckboxDisabled`** (행 헤더 체크 비활성, `isReadOnly`와 독립) |
| **수정**        | `editor: 'checkbox'` — `cellRenderer` 없이 체크 UI 자동 · meta **ColumnField** 동적 콜백 · PDF 한글 `fontPath` · **multiSelect** chip + × (read 즉시 커밋 / edit 지연 커밋)                                                                                                                                                          |
| **내보내기**    | CSV/Excel/PDF — `formatCellExportValue`로 formatter·select label·number·`htmlContent` plain text(`<br>`→개행) 등 **화면 포맷 일부 반영**. 완전 WYSIWYG는 별도 유틸 권장.                                                                                                                                                             |
| **v0.1 (이전)** | `visible`, `dateInputFormat`, footer `operations`, Handle 확장, `resetGrid`, copy/paste, select/date 편집 UI 등 — 본문 각 절 참고                                                                                                                                                                                                    |

---

## 1. 기본 구조 이해

### 파일 위치

```
src/components/common/data-grid/
├── DataGrid.tsx              메인 컴포넌트
├── types.ts                  모든 타입 정의
├── index.ts                  공개 API 진입점 (barrel export)
├── events.ts                 이벤트 상수 + 레지스트리 + emitAsync
├── column-helper.tsx         createColumns 헬퍼
├── cell-editors.tsx          내장 에디터 (text, number, select, multiSelect, combobox, date, checkbox, search)
├── cell-renderers.tsx        내장 렌더러 (badge, checkbox, datetime, link, image, progress, ButtonCell, IconCell, HtmlCell)
├── html-content.ts           htmlContent sanitize·plain text (DOMPurify)
├── cell-affordance.tsx       select/multiSelect/date/search 셀·에디터 affordance 아이콘
├── search-cell-read-view.tsx 읽기 모드 search 셀 (돋보기·팝업)
├── text-copy.ts              범위 복사/붙여넣기 TSV 직렬화
├── search-cell-helpers.ts    search 표시·minQuery 헬퍼
├── display-format.ts         셀 표시 포맷터 유틸
├── row-helpers.ts            TrackedRow 변환 유틸
├── merge-helpers.ts          세로 병합(auto rowspan) 유틸
├── tree-helpers.ts           트리 CRUD 유틸
├── sorting-fns.ts            커스텀 정렬 함수 (mixed datetime)
├── __tests__/                테스트 (emit, handle, integration, registry)
├── components/
│   ├── DataGridRow.tsx       행 렌더링 (React.memo)
│   ├── GridHeaderCell.tsx    헤더 셀 (정렬/필터/리사이즈)
│   ├── GridFooter.tsx        푸터 행
│   ├── ColumnFilter.tsx      필터 드롭다운
│   ├── ColumnFilterPortal.tsx 필터 팝업 (body 포털 — 푸터 가림 방지)
│   ├── CellTooltip.tsx       셀 툴팁
│   ├── SortableRow.tsx       DnD 행 래퍼
│   └── SortableHeader.tsx    DnD 컬럼 래퍼
└── hooks/
    ├── use-grid-events.ts       이벤트 레지스트리 + DOM 이벤트 위임
    ├── use-grid-columns.ts      컬럼 빌드, 헤더 렌더링
    ├── use-grid-editing.ts      인라인 편집 라이프사이클
    ├── use-grid-selection.ts    행/셀 선택 + 포커스
    ├── use-grid-range-selection.ts  셀 범위 선택 + 드래그 직사각형
    ├── use-grid-dnd.ts          행/컬럼 DnD (@dnd-kit)
    ├── use-grid-history.ts      Undo/Redo 커맨드 스택
    └── use-grid-handle.ts       명령형 API (ref/onReady)
```

### 최소 사용 예시

```tsx
import { DataGrid, createColumns } from '@vanta/common';

type User = { id: number; name: string; dept: string };

const columns = createColumns<User>([
  { header: 'ID',   name: 'id',   width: 60 },
  { header: '이름', name: 'name', width: 120 },
  { header: '부서', name: 'dept', width: 120 },
]);

function UserGrid() {
  const [data] = useState<User[]>([...]);

  return (
    <DataGrid
      columns={columns}
      data={data}
      options={{ height: 400 }}
    />
  );
}
```

### Props — 슬림한 진입점

| Prop          | 필수 | 설명                                                                                            |
| ------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `columns`     | ✅   | TanStack `ColumnDef[]` (또는 `createColumns()` 결과)                                            |
| `data`        | ✅   | 행 데이터 배열 `T[]`                                                                            |
| `options`     |      | UI 옵션 + 제약 함수 (`DataGridOptions<T>`)                                                      |
| `treeOptions` |      | 트리 (`keyField`, `parentField`, `lazyLoadEmptyChildren?` — [12. 트리 그리드](#12-트리-그리드)) |
| `onReady`     |      | `(api: DataGridHandle<T>) => void` — **모든 이벤트는 여기서 `api.bind(...)`로 등록**            |
| `ref`         |      | `DataGridHandle<T>` — 외부에서 명령형 API 호출 가능                                             |

### 핵심 개념

| 개념                  | 설명                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `TrackedRow<T>`       | 모든 행은 내부적으로 `_gridRowId`(UUID), `_rowStatus`(normal/I/U/D), `_original`(원본 스냅샷)을 가짐. 외부에서는 `T`만 다룸             |
| `createColumns`       | TanStack `ColumnDef` 변환                                                                                                               |
| `DataGridHandle<T>`   | `bind` / `unbind` / `addRow` / `getModifiedRows` / `validateRows` / `validateModifiedRows` 등 명령형 API. `onReady(api)`나 `ref`로 접근 |
| `bind(type, handler)` | 이벤트 구독. 단일 이름 또는 배열로 한 번에 여러 이벤트 등록 가능                                                                        |
| `preventDefault()`    | `before`\* 이벤트 핸들러에서 호출하면 후속 동작 차단                                                                                    |

### 데이터 흐름

```
외부 데이터 (T[])
    ↓  toTracked / toTrackedTree
내부 추적 상태 (TrackedRow<T>[])
    ↓  TanStack useReactTable
정렬 / 필터 적용 (getRowModel.rows)
    ↓  @tanstack/react-virtual
가상화 렌더링 (DataGridRow + flexRender)
    ↓  이벤트 레지스트리 (bind/emit)
외부 핸들러 → 상태 업데이트
```

---

## 2. 컬럼 정의

### 방법 A: `createColumns` (권장)

```tsx
import {
  createColumns,
  BadgeCell,
  ButtonCell,
  ProgressCell,
  ImageCell,
  LinkCell,
  DateTimeCell,
  type CellEditorProps,
  type SearchCellPopupArgs,
} from '@vanta/common'

const columns = createColumns<MyRow>([
  // 기본 (읽기 전용)
  { header: '제목', name: 'title', width: 200 },
  { header: '순번', name: 'seq', width: 60, sortable: true },

  // 에디터
  { header: '이름', name: 'name', editor: 'text', width: 120 },
  { header: '단가', name: 'price', editor: 'number', width: 100 },
  { header: '날짜', name: 'date', editor: 'date', width: 120 },
  {
    header: '상태',
    name: 'status',
    editor: 'select',
    selectOptions: [
      { label: '사용', value: 'Y' },
      { label: '미사용', value: 'N' },
    ],
  },
  {
    header: '사용여부',
    name: 'useYn',
    editor: 'checkbox',
    checkboxOptions: { trueValue: 'Y', falseValue: 'N' },
  },
  {
    header: '태그',
    name: 'tags',
    editor: 'multiSelect',
    selectOptions: [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ],
    // 저장값: string[] · read/edit chip UI 자동 · 복사 "A,B" · paste 옵션 검증
  },
  {
    header: '제조사',
    name: 'vendor',
    editor: 'combobox',
    selectOptions: [
      { label: '삼성', value: 'samsung' },
      { label: 'LG', value: 'lg' },
    ],
    // 목록 선택 + 목록 외 자유 입력(blur 시 commit)
  },
  {
    header: '만기일',
    name: 'dueDate',
    editor: 'date',
    dateOptions: { dateInputFormat: 'YYYYMMDD' }, // 저장·표시 동일 포맷 (ISO 입력 후 역변환)
  },
  {
    header: '적용월',
    name: 'applyMonth',
    editor: 'date',
    dateOptions: { calendarMode: 'month', dateInputFormat: 'YYYY-MM' },
  },
  {
    header: '상태',
    name: 'statusIcon',
    cellRenderer: IconCell,
    iconOptions: {
      iconFunction: (_rowIndex, _colIndex, value) =>
        value === 'photo' ? 'lucide:Image' : String(value ?? ''),
    },
  },
  {
    header: '비고',
    name: 'memo',
    editor: 'text',
    wordWrap: true, // 긴 HTML·텍스트 줄바꿈 — 가상 스크롤 자동 비활성화
    htmlContent: true, // safe HTML 표시 — HtmlCell 자동 연결 (cellRenderer 직접 지정 시 미연결)
  },
  {
    header: '단가',
    name: 'price',
    styleFunction: (value) => (Number(value) >= 10000 ? { backgroundColor: '#fee2e2' } : undefined),
  },
  {
    header: '활성',
    name: 'active',
    editor: 'checkbox',
    headerCheckbox: true, // 헤더 체크 → visible 행 일괄 Y/N (rowSelection과 별개)
    checkboxOptions: { trueValue: 'Y', falseValue: 'N' },
  },
  { header: '숨김열', name: 'hiddenCol', visible: false }, // 초기 숨김 — columnVisibility
  {
    header: '항목',
    name: 'itemCode',
    editor: 'search',
    searchOptions: {
      renderSearchPopup: (args) => <MySearchModal {...args} />,
      onPopupConfirm: (result, ctx) => console.log('부가 data', result.data, ctx),
    },
  },

  // 필터
  { header: '이름', name: 'name', filter: 'select' },
  { header: '부서', name: 'dept', filter: 'select' },
  {
    header: '활성',
    name: 'active',
    filter: 'checkbox',
    filterCheckboxLabels: { trueLabel: '활성', falseLabel: '비활성' },
  },

  // 내장 렌더러
  { header: '상태', name: 'status', cellRenderer: BadgeCell },
  { header: '진행률', name: 'progress', cellRenderer: ProgressCell },
  { header: '이미지', name: 'imgUrl', cellRenderer: ImageCell },
  { header: '링크', name: 'link', cellRenderer: LinkCell }, // value: { href, label }
  {
    header: '실행',
    name: 'action',
    cellRenderer: ButtonCell,
    buttonOptions: {
      labelText: '조회',
      onClick: (e) => console.log(e.rowIndex, e.item),
    },
  },

  // 커스텀 에디터
  { header: '색상', name: 'color', cellEditor: MyColorEditor },

  // 표시 전용 포맷터
  {
    header: '금액',
    name: 'amount',
    formatter: (value) => `${Number(value).toLocaleString()}원`,
  },

  // 유효성 — required + fn (commit·paste 공통 checkCellValidation)
  {
    header: '이메일',
    name: 'email',
    editor: 'text',
    validation: {
      required: true,
      fn: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? null : '이메일 형식이 아닙니다.',
    },
    // fn 반환: null=통과, 문자열=i18n 키 또는 plain text(alert에 그대로 표시)
  },

  // 날짜 정렬 (ISO 문자열, timestamp, dayjs 혼재 지원)
  { header: '처리시각', name: 'processedAt', sortType: 'datetime' },
  { header: '로그시각', name: 'logTs', cellRenderer: DateTimeCell, dateTimeEnableMs: true },

  // 세로 병합 (인접 행 동일 값 자동 rowspan)
  { header: '부서', name: 'dept', enableAutoMerge: true },

  // 셀 툴팁
  { header: '비고', name: 'memo', cellTooltip: true },
])
```

### `SimpleColumnDef` 전체 속성

| 속성                   | 타입                                  | 설명                                                                 |
| ---------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `header`               | `string`                              | 헤더 텍스트                                                          |
| `name`                 | `keyof T`                             | 데이터 필드명 (= `accessorKey`)                                      |
| `width`                | `number \| string`                    | 컬럼 너비 — px 숫자 또는 `'20%'`                                     |
| `minWidth`             | `number \| string`                    | 최소 너비 (px 또는 `%`)                                              |
| `visible`              | `boolean`                             | `false`면 초기 숨김                                                  |
| `dateOptions`          | `DateCellOptions`                     | `dateInputFormat`, `calendarMode`                                    |
| `headerCheckbox`       | `boolean`                             | `editor: 'checkbox'` 헤더 일괄 토글                                  |
| `wordWrap`             | `boolean \| ColumnField`              | 줄바꿈 — 가상 스크롤 off                                             |
| `htmlContent`          | `boolean \| ColumnField`              | safe HTML 셀 표시 — `HtmlCell` 자동 · export/tooltip/필터 plain text |
| `styleFunction`        | `(value, row, …) => CSSProperties`    | 셀 동적 스타일                                                       |
| `iconOptions`          | `IconCellOptions`                     | `IconCell` 옵션                                                      |
| `backgroundColor`      | `CellBackgroundColor`                 | 컬럼 배경색 프리셋                                                   |
| `editable`             | `boolean \| 'onlyNew' \| ColumnField` | 편집 가능 여부                                                       |
| `length`               | `number`                              | 입력 최대 길이                                                       |
| `sortable`             | `boolean`                             | 정렬 활성화                                                          |
| `sortType`             | `'datetime'`                          | 혼합 날짜 정렬                                                       |
| `filter`               | `'text' \| 'select' \| 'checkbox'`    | 필터 타입                                                            |
| `filterCheckboxLabels` | `{ trueLabel?, falseLabel? }`         | checkbox 필터 레이블                                                 |
| `editor`               | `'text' \| 'number' \| … \| 'search'` | 에디터 타입                                                          |
| `selectOptions`        | `SelectOption[] \| ColumnField`       | select/multiSelect/combobox 옵션                                     |
| `searchOptions`        | `SearchCellOptions`                   | search 팝업 옵션                                                     |
| `buttonOptions`        | `ButtonCellOptions`                   | ButtonCell 옵션                                                      |
| `checkboxOptions`      | `{ trueValue?, falseValue? }`         | checkbox 값                                                          |
| `align`                | `'left' \| 'center' \| 'right'`       | 정렬                                                                 |
| `validation`           | `{ required?, fn? }`                  | commit·paste 검증                                                    |
| `cellRenderer`         | `ComponentType<CellRendererProps>`    | 커스텀 렌더러                                                        |
| `cellEditor`           | `ComponentType<CellEditorProps>`      | 커스텀 에디터                                                        |
| `formatter`            | `CellFormatter`                       | 표시 포맷                                                            |
| `enableAutoMerge`      | `boolean`                             | 세로 병합 — subfooter 구간 경계에서 끊김 (§14.6)                     |
| `tooltip`              | `HeaderTooltipOption`                 | 헤더 툴팁                                                            |
| `cellTooltip`          | `boolean \| CellTooltipOption`        | 셀 툴팁                                                              |
| `dateTimeEnableMs`     | `boolean`                             | DateTimeCell 밀리초                                                  |

### `htmlContent` — HTML 셀 표시

AUI `TemplateRenderer` + `wordWrap` 조합과 유사하게, 셀 값에 **safe HTML**을 렌더링합니다. **WYSIWYG 편집기는 제공하지 않으며**, 편집 시에는 `editor: 'text'`로 raw HTML 문자열을 수정합니다.

```tsx
{
  header: '비고',
  name: 'memo',
  editor: 'text',
  wordWrap: true, // 긴 HTML·줄바꿈 — 권장
  htmlContent: true,
}
```

| 구분                        | 동작                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| **읽기 모드**               | `html-content.ts` — DOMPurify `USE_PROFILES: { html: true }` 후 `HtmlCell`(`dangerouslySetInnerHTML`) |
| **허용 HTML**               | `<br>`, `<b>`/`<strong>`, `<i>`/`<em>`, `<u>`, `<span>`, `<p>`, 목록, `<a href>` 등 safe subset       |
| **차단**                    | `<script>`, `<iframe>`, `onclick` 등 이벤트·위험 태그 — sanitize 제거                                 |
| **export · tooltip · 필터** | `stripHtmlToPlainText` — 태그 제거, `<br>` → 개행                                                     |
| **편집**                    | `editor: 'text'` — 화면 미리보기 없이 HTML 원문 편집                                                  |

> `cellRenderer`를 직접 지정하면 `HtmlCell` **자동 연결이 되지 않습니다**.  
> 샘플: **§1 · 1.1** `비고` **4행(최UI)** `<br>`·`<b>`·`<script>`(제거) · **§7 · 7.1** export plain text 확인.

### 방법 B: TanStack `ColumnDef` 직접

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import type { TrackedRow } from '@vanta/common'

const columns: ColumnDef<TrackedRow<MyRow>, unknown>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: '이름',
    size: 120,
    enableSorting: true,
    meta: { editorType: 'text', required: true, filterable: true },
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Avatar name={info.getValue() as string} />
        <span>{info.getValue() as string}</span>
      </div>
    ),
  },
]
```

`meta` 필드는 `DataGridColumnMeta<T>` 타입으로 자동 확장됩니다. 에디터, 렌더러, 필터, 유효성 등을 모두 `meta`에서 제어합니다.

---

## 3. 에디터 & 렌더러 레퍼런스

### 내장 에디터

| 타입          | 트리거                                                                       | 동작                                                                                 | 필수 옵션          |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| `text`        | `editingEvent` (기본 `dblclick`)                                             | Enter 커밋, Escape 취소, blur 커밋                                                   | —                  |
| `number`      | 동일                                                                         | 천 단위 콤마, 커밋 시 숫자 정규화                                                    | —                  |
| `select`      | **싱글클릭** 또는 `editingEvent: 'click'`                                    | 포털 드롭다운, 선택 즉시 커밋                                                        | `selectOptions`    |
| `multiSelect` | `select`와 동일                                                              | chip + combobox 드롭다운. **값 `string[]`**. read `×` 즉시 커밋 · edit `×` 지연 커밋 | `selectOptions`    |
| `combobox`    | `select`와 동일                                                              | 입력 필터 + 포털 목록 · 목록 외 문자열도 blur 시 commit                              | `selectOptions`    |
| `date`        | `select`와 동일                                                              | `calendarMode`별 FormDatePicker 패널 또는 네이티브 date                              | `dateOptions` 선택 |
| `checkbox`    | **체크 UI 클릭만** 토글 (셀 빈 영역은 포커스)                                | 클릭 즉시 커밋 · **편집 모드(`.vc-dg__cell-editor`) 없음**                           | `checkboxOptions`  |
| `search`      | 텍스트는 `editingEvent`와 동일 · 돋보기는 **읽기/편집 모두** (readonly 제외) | 텍스트 입력 + 검색 팝업                                                              | `searchOptions`    |

```tsx
// 편집 트리거 변경
<DataGrid options={{ editingEvent: 'click' }} ... />     // 싱글클릭
<DataGrid options={{ editingEvent: 'dblclick' }} ... />  // 더블클릭 (기본)
```

> **한글 IME 처리**: `text`, `number`, `search` 에디터에서 한글 조합(IME composing) 중 Enter 입력은
> 자소 확정용이므로 커밋되지 않습니다. 조합이 끝난 후 Enter를 누르면 정상 커밋됩니다.

#### `select` / `multiSelect` / `combobox` / `date` — 읽기·편집 affordance

- 읽기: `CellEditorAffordance` + 값 표시. `multiSelect`는 chip 나열(넘치면 clip + `…` 마커, `title`에 전체 라벨).
- 편집: 셀 테두리만 강조 — 트리거·date 네이티브 아이콘 **이중 파란 링 없음** (`cell-affordance.css`).
- `multiSelect` 드롭다운: `createPortal` → `.vc-dg-multiselect__menu` (그리드 overflow 회피).

#### `editor: 'checkbox'` — 인라인 토글

`editor: 'checkbox'`만 지정하면 체크 UI가 자동으로 붙습니다. `cellRenderer`/`cellEditor`를 따로 넣지 않습니다.

- 클릭 → `commitEdit` 즉시 반영 (`startEditing` · `.vc-dg__cell-editor` 없음)
- `headerCheckbox: true` — visible·편집 가능 행만 `trueValue`/`falseValue` 일괄 변경 (행 선택 체크박스와 **별개**)
- 샘플: **Sample2 §2.1** `완료` 컬럼

#### `editor: 'multiSelect'` — chip UI

`editor: 'multiSelect'` + `selectOptions`만 지정하면 read/edit chip UI가 자동으로 붙습니다. `cellRenderer`를 직접 넣으면 chip 자동 연결이 해제됩니다.

| 모드     | chip `×`                | 커밋                                                                   |
| -------- | ----------------------- | ---------------------------------------------------------------------- |
| **Read** | 즉시 제거               | **`commitEdit` 즉시** (checkbox와 동일)                                |
| **Edit** | `selectedValues`만 변경 | Enter / blur / outside → **`commitEdit`** (`×` 클릭만으로는 편집 유지) |

- 저장값: `string[]` · 복사 TSV: `"A,B"` · paste: value/label 쉼표 구분 → 유효값만 배열
- `selectOptions`는 `(rowData) => SelectOption[]` 콜백 가능 (행별 옵션 목록)
- 샘플: **Sample2 §2.1** `멀티 선택`

#### 유효성 검사 (`validation`)

`commitEdit`·`batchPasteCommit`(붙여넣기) 모두 **`checkCellValidation`** 경로를 탑니다.

| 규칙             | 동작                                                           |
| ---------------- | -------------------------------------------------------------- |
| `required: true` | `null` / `''` / `[]` 거부                                      |
| `fn(value, row)` | `null` 통과, **문자열**이면 alert(plain text 또는 i18n 키)     |
| paste 실패       | 첫 오류만 alert, **유효 셀만** 반영 (`batchPasteCommit` 2단계) |

샘플: **Sample1 §1.7** — 컬럼별 editor·paste·`fn`·search `minQueryAlert`\* 데모.

#### `editor: 'search'` + `searchOptions`

FormSearchLookup과 유사하게 **텍스트 + 돋보기** affordance를 쓰고, 돋보기로 **외부 팝업**을 엽니다.

| 항목             | 설명                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| 셀 커밋          | 팝업 `onConfirm({ value, data? })`의 `**value`(string)\*\* 만 그리드에 저장   |
| 부가 처리        | `onPopupConfirm(result, { rowIndex, columnId, rowData })` — `data` 등 앱 로직 |
| 읽기 모드        | `isReadOnly`가 아니면 **편집 진입 없이** 돋보기만으로 팝업 가능               |
| 편집 모드        | `editingEvent`에 따라 셀 클릭/더블클릭으로 텍스트 편집 + 돋보기 팝업          |
| `minQueryLength` | 입력(또는 읽기 모드 셀 값)이 있을 때 최소 길이 미만이면 alert 후 팝업 차단    |

```tsx
import type { SearchCellPopupArgs, SearchCellPopupResult } from '@vanta/common';

const SearchModal = ({ initValue, editedValue, rowData, onConfirm, onClose }: SearchCellPopupArgs<MyRow>) => (
  <Modal open onClose={onClose} footer={<Button onClick={() => onConfirm({ value: picked, data: { memo } })}>OK</Button>}>
    <p>저장값: {String(initValue)} / 입력중: {editedValue}</p>
    <p>row: {rowData.id}</p>
  </Modal>
);

{ header: '항목', name: 'item', editor: 'search', searchOptions: { renderSearchPopup: (args) => <SearchModal {...args} /> } }
```

`SearchCellPopupArgs`: `initValue`, `editedValue`, `rowIndex`, `columnId`, `rowData`, `onConfirm`, `onClose`.

### 편집 불가 컬럼 스타일

`editor`가 지정되지 않은 컬럼(읽기 전용)은 자동으로 **회색 배경**(`bg-[#f5f5f7]`)이 적용됩니다.
행 번호, 체크박스 등 내부 컬럼(`_rowNum`, `_check`, `_treeExpand`)에는 적용되지 않습니다.

### 내장 렌더러

```tsx
import {
  BadgeCell,
  ButtonCell,
  CheckboxCell,
  DateTimeCell,
  IconCell,
  ImageCell,
  LinkCell,
  ProgressCell,
} from '@vanta/common'
```

| 렌더러         | 용도                | 비고                                                                            |
| -------------- | ------------------- | ------------------------------------------------------------------------------- |
| `BadgeCell`    | 상태 뱃지           | 기본 색상 매핑 (success/processing/error/default)                               |
| `ButtonCell`   | 행 액션 버튼        | `buttonOptions` — `labelText`, `onClick`, `disabledFunction`, `visibleFunction` |
| `CheckboxCell` | 읽기 전용 체크 표시 | Y/N, true/false, 1/0 자동 구분 · `**editor: 'checkbox'`와 별개\*\*              |
| `IconCell`     | 아이콘/썸네일 URL   | `iconOptions.iconFunction` · `lucide:Name` · `iconTableRef`                     |
| `DateTimeCell` | 날짜 표시           | ISO 문자열/timestamp 지원, `dateTimeEnableMs` 밀리초                            |
| `LinkCell`     | 외부 링크           | value: `{ href, label }`                                                        |
| `ProgressCell` | 진행률 바           | 0-100%, 자동 클램핑                                                             |
| `ImageCell`    | 썸네일              | 클릭 시 프리뷰 팝업                                                             |

> `**editor: 'checkbox'` / `editor: 'multiSelect'`\*\* 는 전용 UI가 자동 연결되므로 위 렌더러를 중복 지정하지 않습니다.  
> `**htmlContent: true`** 는 `HtmlCell`이 자동 연결됩니다 — §2 `htmlContent` 절 참고.

### 커스텀 렌더러

```tsx
import type { CellRendererProps, TrackedRow } from '@vanta/common'

function ScoreBadge({ value }: CellRendererProps<TrackedRow<MyRow>>) {
  const score = Number(value)
  const color = score >= 90 ? 'text-green-600' : 'text-red-600'
  return <span className={`font-bold ${color}`}>{score}점</span>
}

const columns = createColumns<MyRow>([{ header: '점수', name: 'score', cellRenderer: ScoreBadge }])
```

### 커스텀 에디터

```tsx
import type { CellEditorProps } from '@vanta/common'

function ColorPicker({ value, onCommit, onCancel }: CellEditorProps) {
  return (
    <input
      type="color"
      defaultValue={String(value ?? '#000000')}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      autoFocus
    />
  )
}

const columns = createColumns<MyRow>([{ header: '색상', name: 'color', cellEditor: ColorPicker }])
```

> **편집 중 Tab 이동은 내장 에디터에서 자동 동작합니다.**
> `text` · `number` · `select` · `multiSelect` · `date` · `search` 에디터는 Tab/Shift+Tab을 가로채 `onCommit(value, { navigate: 'next' \| 'prev' })`를 호출하므로, 별도 옵션·설정 없이 커밋 + 인접 편집 셀로 포커스 이동 + 편집 시작이 즉시 동작합니다.
>
> **커스텀 에디터에서 같은 UX가 필요하면** 에디터 내부에서 Tab을 가로채 `onCommit(value, { navigate })`를 직접 호출하세요. `onCommit` 시그니처는 `(value: unknown, options?: { navigate?: 'next' \| 'prev' }) => void`입니다.

---

## 4. GridBtn — 그리드 툴바 버튼

`GridBtn`은 DataGrid 위에 띄우는 표준 액션 툴바입니다. **타이틀·총건수 표시**, **페이지 사이즈 셀렉트**, **행추가(`+`)·행삭제(`-`) 버튼**, **임의 커스텀 버튼**을 한 컴포넌트로 노출하며, `gridRef`를 통해 DataGrid의 imperative API를 직접 호출합니다.

### 기본 사용

```tsx
import { useRef } from 'react'
import { GridBtn, DataGrid, type DataGridHandle } from '@vanta/common'

function ItemPage() {
  const gridRef = useRef<DataGridHandle<Item>>(null)

  return (
    <>
      <GridBtn
        gridRef={gridRef}
        gridTitle="품목 목록"
        gridBtn={{
          isPaging: true,
          totalCount: pageData?.totalElements,
          pageSize,
          setPageSize,
          setCurrentPage: onPageChange,
          isPlus: true,
          isMinus: true,
          extraButtons: [{ label: '저장', variant: 'primary', onClick: handleSave }],
        }}
      />
      <DataGrid
        ref={gridRef}
        columns={columns}
        data={rows}
        options={{ height: 400, rowHeaders: [{ type: 'checkbox' }] }}
      />
    </>
  )
}
```

### Props — `GridBtnProps<T>`

| Prop        | 타입                       | 필수 | 설명                                                       |
| ----------- | -------------------------- | ---- | ---------------------------------------------------------- |
| `gridRef`   | `Ref<DataGridHandle<T>>`   | ✅   | DataGrid ref (RefObject · MutableRefObject · ForwardedRef) |
| `gridTitle` | `string`                   |      | 좌측 타이틀                                                |
| `gridBtn`   | `GridBtnConfig<T> \| null` |      | 버튼·페이징 설정 (생략 시 빈 툴바)                         |
| `children`  | `ReactNode`                |      | 임의 커스텀 영역                                           |
| `position`  | `'prefix' \| 'postfix'`    |      | `children` 렌더 위치 — 기본 `'prefix'`                     |

### `GridBtnConfig<T>` — 페이징·총건수

| Prop              | 타입                  | 설명                                                                     |
| ----------------- | --------------------- | ------------------------------------------------------------------------ |
| `isPaging`        | `boolean`             | 총건수·오류건수·페이지 사이즈 UI 활성화                                  |
| `totalCount`      | `number`              | "총 N건" 표시값 (`isPaging` 없어도 건수 라벨 표시 가능)                  |
| `errorCount`      | `number`              | 0 이상이면 "오류 N건" 추가 표시                                          |
| `pageSize`        | `number`              | 페이지 사이즈 셀렉트 현재값                                              |
| `pageSizeOptions` | `{ value, label }[]`  | 사이즈 옵션. **미지정 시** `15`/`30`/`50`(i18n). 화면별로 다르면 명시    |
| `setPageSize`     | `(n: number) => void` | 사이즈 변경 — **있어야** 셀렉트 표시. 이후 `setCurrentPage(0)` 자동 호출 |
| `setCurrentPage`  | `(n: number) => void` | 페이지 인덱스(0-base) 변경 — Pagination `onPageChange`와 동일 연결 권장  |

### `GridBtnConfig<T>` — 행 추가 (`isPlus`)

| Prop           | 타입            | 설명                            |
| -------------- | --------------- | ------------------------------- |
| `isPlus`       | `boolean`       | `+` 행추가 버튼 표시            |
| `defaultRow`   | `Partial<T>`    | default 동작 시 새 행에 채울 값 |
| `plusFunction` | `() => unknown` | 제공 시 default 동작 대신 호출  |

`**+` 버튼 default 동작\*\* — `plusFunction` 미제공 시:

```ts
gridRef.current.addRow(defaultRow ?? {}, 'first') // 그리드 맨 위에 'I' 상태 행 추가
```

### `GridBtnConfig<T>` — 행 삭제 (`isMinus`) ⭐ **default는 "체크된 신규행만 삭제"**

| Prop            | 타입                             | 설명                                                                        |
| --------------- | -------------------------------- | --------------------------------------------------------------------------- |
| `isMinus`       | `boolean`                        | `-` 행삭제 버튼 표시                                                        |
| `minusFunction` | `(checkedRows?: T[]) => unknown` | 제공 시 default 동작 대신 호출. 인자는 **체크된 행의 stripped 데이터 배열** |

`**-` 버튼 default 동작\*\* — `minusFunction` 미제공 시 단계별로 가드합니다:

1. `gridRef.current.getCheckedRows()`로 **체크박스가 체크된** 행 목록 조회
2. 체크된 행이 **0개면** `"삭제할 행을 선택하세요"` 알림 후 종료
3. 체크된 행 중 **상태가 `'I'`(신규)가 아닌 행이 하나라도 있으면** `"신규 행만 삭제 가능합니다"` 알림 후 종료 — 즉, 백엔드에 이미 존재하는 `'normal'`/`'U'` 행은 default로 못 지웁니다
4. 모든 체크 행이 신규(`'I'`)일 때만 `gridRef.current.removeCheckedRows()`를 실행 — 화면·내부 상태에서 즉시 제거

> ⚠️ **default 동작의 의도** — *추가했지만 아직 저장하지 않은 행*만 한 번 더 안전하게 빼는 용도입니다.
> 기존 행을 백엔드와 함께 삭제해야 하는 일반 케이스에서는 `minusFunction`을 직접 주입하거나 `extraButtons`에 별도 "삭제" 버튼을 추가하는 편이 명확합니다.

```tsx
// 기존 행 포함 일반 삭제: minusFunction 주입
<GridBtn
  gridRef={gridRef}
  gridBtn={{
    isMinus: true,
    minusFunction: async (checkedRows) => {
      if (!checkedRows?.length) {
        toast('삭제할 행을 선택하세요.')
        return
      }
      const ok = await openConfirm({ message: `${checkedRows.length}건 삭제할까요?` })
      if (!ok) return
      await api.deleteItems(checkedRows.map((r) => r.id))
      gridRef.current?.removeCheckedRows() // 백엔드 성공 후 화면 동기화
    },
  }}
/>
```

### `GridBtnConfig<T>` — 내보내기 (`isCsvExport` / `isExcelExport` / `isPdfExport`)

| Prop                 | 타입                   | 설명                                                                                                  |
| -------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `isCsvExport`        | `boolean`              | CSV 버튼 → `exportToCsv(csvExportOptions)`                                                            |
| `isExcelExport`      | `boolean`              | Excel 버튼 → `exportToExcel(excelExportOptions)`                                                      |
| `isPdfExport`        | `boolean`              | PDF 버튼 → `exportToPdf(pdfExportOptions)`                                                            |
| `csvExportOptions`   | `ExportToCsvOptions`   | `filename`, `alwaysQuotes`                                                                            |
| `excelExportOptions` | `ExportToExcelOptions` | `filename`, `sheetName`, `exceptColumnFields`, `showRowNumColumn`, `includeFooter`, `exportWithStyle` |
| `pdfExportOptions`   | `ExportToPdfOptions`   | `filename`, `compress`, `**fontPath**`(한글 TTF — Vite `?url`)                                        |

> 내보내기는 `formatCellExportValue`로 formatter·select label·number·`htmlContent` plain text 등 화면 포맷을 일부 반영합니다. 샘플: **Sample7 §7.1**.

### `GridBtnConfig<T>` — 커스텀 버튼 (`extraButtons`)

| Prop           | 타입             | 설명                                                                   |
| -------------- | ---------------- | ---------------------------------------------------------------------- |
| `extraButtons` | `ExtraBtnType[]` | `{ label, variant?, icon?, onClick, disabled? }` 형태의 임의 버튼 배열 |

```tsx
extraButtons: [
  { label: '저장', variant: 'primary', onClick: handleSave, disabled: !dirty },
  { label: '엑셀 다운로드', icon: <Download size={14} />, onClick: handleExport },
],
```

### 행 삭제의 표준 — `selectedRow`가 아닌 `checkedRow`

DataGrid에는 두 가지 "선택" 모델이 공존합니다:

| 모델                        | 트리거                                               | 메서드                                       |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| **체크박스(check)** ✅ 표준 | `rowHeaders: [{ type: 'checkbox' }]` + 체크박스 클릭 | `getCheckedRows*()` / `removeCheckedRows()`  |
| **선택(select)** ⚠️ 비표준  | `selectionConstraint`로 별도 정의한 row/cell 선택    | `getSelectedRow*()` / `removeSelectedRows()` |

**행 단위 삭제·일괄처리는 모두 체크박스 기반**으로 구현합니다. `GridBtn`의 `isMinus` default 동작도 명시적으로 `getCheckedRows()`를 사용합니다.
`removeSelectedRows` / `getSelectedRows*` 는 `selectionConstraint`로 별도 선택 모델을 정의한 특수 화면에서만 사용하세요.

---

## 4.1 TableBtn — HTML table 툴바

DataGrid가 없는 **일반 `<table>`** 에서 조회·엑셀 등 커스텀 버튼만 필요할 때 `TableBtn`을 사용합니다. 페이징·page size·행 CRUD는 없습니다.

```tsx
import { TableBtn } from '@vanta/common';

<TableBtn title="목록" buttons={[{ label: '조회', onClick: handleSearch }]} />
<table>{/* ... */}</table>
```

상세: [공통 기능 가이드 §1.5 TableBtn](common-feature-developer-guide.md#15-tablebtn-html-table).

---

## 5. 필터

### 필터 타입

| 타입       | 정의                 | 동작                                                        |
| ---------- | -------------------- | ----------------------------------------------------------- |
| `text`     | `filter: 'text'`     | 헤더 입력 — 부분 일치(대소문자 무시). **입력 즉시** 행 필터 |
| `select`   | `filter: 'select'`   | 고유값 수집, 다중 선택 + 확인 버튼                          |
| `checkbox` | `filter: 'checkbox'` | 전체 / true / false 토글                                    |

> admin **샘플·업무 그리드**는 헤더 필터 UX 통일을 위해 대부분 `select`를 씁니다. `text` API는 유지되며, 미반영 버그는 `columnFilters` deps 수정으로 해결되었습니다(A19).

필터 팝업은 `ColumnFilterPortal`로 `document.body`에 고정 배치되어 **푸터에 가리지 않습니다**.

### 필터 변경 이벤트

```tsx
<DataGrid
  columns={cols}
  data={data}
  options={{ height: 400 }}
  onReady={(api) => {
    api.bind('filtering', (e) => {
      console.log('필터 변경:', e.columnId, e.value)
    })
    api.bind('notFound', () => toast('검색 결과 없음'))
  }}
/>
```

### 서버 사이드 필터

`filtering` 이벤트를 구독하고 상태를 API 파라미터로 전달:

```tsx
const [filters, setFilters] = useState<Record<string, string | string[]>>({})

;<DataGrid
  data={serverData ?? []}
  columns={columns}
  onReady={(api) => {
    api.bind('filtering', (e) => {
      setFilters((prev) => ({ ...prev, [e.columnId as string]: (e.value as string) ?? '' }))
    })
  }}
/>
```

---

## 6. 행 헤더 & 상태 표시

```tsx
<DataGrid
  columns={cols}
  data={data}
  options={{
    rowHeaders: [{ type: 'rowNum' }, { type: 'checkbox' }],
    // showRowStatus 기본값 true(생략 가능). 숨기려면 false
    showRowStatus: false,
    // 특정 행만 행 헤더 체크박스 비활성 (`isReadOnly`와 무관 — §9 참고)
    // isCheckboxDisabled: (row) => row.locked === true,
    height: 400,
  }}
  onReady={(api) => {
    api.bind('check', (e) => console.log(e.rowId, e.row, e.shiftKey, e.ctrlKey))
    api.bind('uncheck', (e) => console.log(e.rowId, e.row))
    api.bind('checkAll', (e) => console.log('전체 선택', e.checked))
    api.bind('uncheckAll', (e) => console.log('전체 해제', e.checked))
  }}
/>
```

> **행 헤더 체크박스** 비활성은 `isCheckboxDisabled`로만 제어합니다.  
> `isReadOnly`는 셀 편집·상태(restore)용이며, 체크 가능 여부와 **연동되지 않습니다**.

### `headerCheckbox` — 컬럼 헤더 일괄 체크

`editor: 'checkbox'` 컬럼에 `headerCheckbox: true`를 주면 헤더에 체크박스가 붙습니다.

| 항목            | 설명                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 동작            | **visible 행**의 해당 컬럼 값을 `trueValue`/`falseValue`로 일괄 변경 (**데이터 편집**)                                                              |
| vs `rowHeaders` | 행 선택용 체크박스(`rowSelection`)와 **무관**                                                                                                       |
| readonly        | `isReadOnly`·`editable: false`·`onlyNew` 대상 행은 **데이터 값** 일괄 토글에서 스킵 (`rowHeaders` 체크 비활성과는 별개 — 그건 `isCheckboxDisabled`) |
| `_rowStatus`    | 값이 실제로 바뀐 편집 가능 행만 `U` (동일값·HQ readonly는 `U` 없음)                                                                                 |
| 토글            | 전체 체크 → 클릭 시 전체 해제 · indeterminate → 클릭 시 **전체 체크**                                                                               |

### 행 상태 표시

`showRowStatus`는 **기본값 `true`**라서 별도 설정 없이도 좌측에 행상태 컬럼(상태 점)이 표시됩니다. **숨기려면 `showRowStatus: false`**로 설정합니다.

| 상태 | 색상 | 배경           | 비고                    |
| ---- | ---- | -------------- | ----------------------- |
| `I`  | 파랑 | `bg-[#e8f5e9]` | 새로 추가된 행 (Insert) |
| `U`  | 주황 | `bg-[#fff8e1]` | 수정된 행 (Update)      |

상태 점 클릭: `api.bind('rowStateCellClick', ...)` 으로 수신.

### 정렬·필터에서의 자동 제외

`_rowStatus`가 `'I'` / `'U'` / `'D'`(즉 `'normal'`이 아님)인 행은 헤더 정렬·컬럼 필터 대상에서 자동으로 제외된다.

- **정렬 시**: 정렬 결과 상단에 추가/수정 순서대로 고정된다.
- **필터 시**: 필터 조건 매칭 여부와 무관하게 항상 표시된다.
- ⚠️ `treeOptions` 사용 시에는 subRows 구조 보존이 우선되어 적용되지 않는다.

### 추가된 행 자동 포커스·스크롤

`addRow(row, position?)` 직후 다음이 자동으로 일어난다.

- **포커스**: 추가된 행의 첫 사용자 컬럼으로 자동 이동.
- **스크롤**: `position: 'first'` → 상단 정렬, `'last'` → 하단 정렬로 가시 영역에 노출.

---

## 7. Imperative API (ref / onReady)

```tsx
import { useRef } from 'react'
import { DataGrid, type DataGridHandle } from '@vanta/common'

function MyPage() {
  const gridRef = useRef<DataGridHandle<MyRow>>(null)

  const handleSave = () => {
    const validation = gridRef.current!.validateModifiedRows()
    if (!validation.isValid) {
      alert(validation.errors[0]?.message)
      return
    }
    const { createdRows, updatedRows, deletedRows } = gridRef.current!.getModifiedRows()
    api.save({ createdRows, updatedRows, deletedRows })
  }

  return (
    <>
      <DataGrid
        ref={gridRef}
        columns={cols}
        data={data}
        options={{ height: 400 }}
        onReady={(api) => {
          // ref.current === api (동일 객체)
          api.bind('addRow', (e) => console.log(e.row))
        }}
      />
      <button onClick={handleSave}>저장</button>
    </>
  )
}
```

> **`ref`와 `onReady` 둘 다 사용 가능**: `ref.current === api`이며, 동일한 `DataGridHandle<T>`를 가리킵니다.
> `onReady`는 마운트 시점 1회 보장된 등록 위치, `ref`는 외부 버튼/타이머에서 명령 호출에 적합합니다.

### Handle 메서드 전체

#### 이벤트

```ts
gridRef.current.bind('cellClick', (e) => console.log(e.rowIndex))
gridRef.current.bind(['addRow', 'removeRow'], (e) => save())
gridRef.current.unbind('cellClick') // 해당 이벤트 모든 핸들러
gridRef.current.unbind('cellClick', specificHandler) // 특정 핸들러만
gridRef.current.emit({ type: 'custom', payload: 1 }) // 외부에서 강제 발행
```

#### 행 CRUD

```ts
gridRef.current.addRow({ name: '신규' }, 'first') // 'first' | 'last'
gridRef.current.removeRows([rowId]) // rowId 배열 기준 삭제 (단수형 없음)
gridRef.current.removeRows([rowId1, rowId2]) // 다건 삭제
const removed = gridRef.current.removeCheckedRows() // ✅ 표준: 체크박스 체크된 행 삭제
const removed2 = gridRef.current.removeSelectedRows() // ⚠️ 비표준: selectionConstraint 선택 행 삭제
```

> **표준은 `getCheckedRows*` / `removeCheckedRows`** — 다건 삭제·체크 기반 일괄 처리는 모두 **체크된 행** 기준으로 수행합니다.
> `getSelectedRow`\* / `removeSelectedRows`는 `selectionConstraint`로 별도 정의한 "선택" 모델을 사용하는 특수 케이스에만 사용하세요.

#### 데이터 조회

```ts
gridRef.current.getData() // GridDataRow<T>[] — 비즈니스 필드 + rowId(그리드 세션 키)
gridRef.current.getSortedData() // 정렬·필터 반영된 화면 순서(각 행에 rowId 포함)
gridRef.current.getModifiedRows() // { createdRows, updatedRows, deletedRows } — 행마다 rowId 포함
// rowId 예: gridRef.current.getSortedData()[0]?.rowId → setCellValue(rowId, ...)
gridRef.current.validateRows() // 전체 행 검증 — GridValidationResult
gridRef.current.validateModifiedRows() // I+U 행만 검증
gridRef.current.getCheckedRowKeys() // string[] 체크된 행 rowId
gridRef.current.getCheckedRows() // T[] 체크된 행 데이터
gridRef.current.getSelectedRowKeys() // string[] 선택(selectionConstraint) 행 rowId
gridRef.current.getSelectedRows() // T[] 선택 행 데이터
gridRef.current.getRowStatus(rowId) // 'normal' | 'I' | 'U' | 'D'
gridRef.current.getFocusedCell() // { rowId, columnId } | null
gridRef.current.getFocusedRow() // T | null
gridRef.current.getEditingCell() // { rowId, columnId } | null
gridRef.current.getSelectedCellRange() // 드래그 범위 | null
gridRef.current.clearData()
gridRef.current.restoreRowState(rowId) // 변경 행을 원본으로 되돌림
```

#### 데이터 내보내기 (CSV · Excel · PDF)

```ts
gridRef.current.exportToCsv({ filename: 'export.csv', alwaysQuotes: false })
await gridRef.current.exportToExcel({
  filename: 'export.xlsx',
  sheetName: 'Sheet1',
  showRowNumColumn: true,
  includeFooter: true,
  exportWithStyle: false,
})
await gridRef.current.exportToPdf({
  filename: 'export.pdf',
  fontPath: pdfFontUrl, // 한글 — 소비 앱 TTF. 미지정 시 Helvetica(한글 깨짐)
})
```

| API             | 데이터 소스                       | 포맷 적용                      | 비고                                                                |
| --------------- | --------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `exportToCsv`   | `internalData` (트리: DFS 평탄화) | `formatCellExportValue`        | formatter·select label·number·`htmlContent` strip 등 · BOM `\uFEFF` |
| `exportToExcel` | 동일                              | 동일 (number는 숫자 타입 유지) | `exceljs` peer — 앱 `dependencies` 필요                             |
| `exportToPdf`   | 동일 (`_rowStatus === 'D'` 제외)  | 동일                           | `jspdf` peer · `fontPath`(한글) · `theme: 'striped'` 기본           |

> `htmlContent` 컬럼은 export·tooltip·필터에서 **plain text**(`<br>`→개행)로 변환됩니다.  
> 화면과 100% 동일한 내보내기가 필요하면 `getSortedData()` 등으로 가공한 배열을 **별도 유틸**(`src/utils/excel.ts` 등)로 export하세요.

#### 셀·행 조회·수정 (Handle 확장)

```ts
// 단일 셀 — rowId = _gridRowId (체크박스 키와 동일 계열)
gridRef.current.getCellValue(rowId, 'name')
gridRef.current.setCellValue(rowId, 'name', '변경') // updateRows 래핑 — validation 없음

// 포커스 셀 기준 (§1.6 샘플)
const fc = gridRef.current.getFocusedCell()
if (fc) gridRef.current.getCellValue(fc.rowId, fc.columnId)

// 수정 여부 — 'I' 행은 전 필드 true, 'U'만 _original 대비
gridRef.current.isEditedCell(rowId, 'amount')

// internalData 기준 인덱스 (필터·화면 순서 아님, subfooter 제외 detail)
gridRef.current.getItemByRowIndex(0)
gridRef.current.getRowCount()

// 수정 추적만 원복 (데이터는 _original 기준)
gridRef.current.resetUpdatedItems('ALL') // 'C' | 'U' | 'D' | 'ALL'
```

#### 체크박스·선택·필터·정렬

```ts
gridRef.current.setCheckedRowsByIds(['id1', 'id2'])
gridRef.current.addCheckedRowsByIds(['id3'])
gridRef.current.isCheckedRowById('id1')

gridRef.current.clearFilter('dept') // 단일 컬럼
gridRef.current.clearFilterAll()
gridRef.current.clearSortingAll()
gridRef.current.clearSelection() // 포커스·범위·행 하이라이트 — 체크박스 유지

gridRef.current.setSelectionByIndex(2, 1) // rowIndex, colIndex(생략 시 첫 visible 컬럼)
gridRef.current.setSelectionBlock({ startRow: 0, endRow: 2, startCol: 0, endCol: 1 })
```

#### 푸터·트리

```ts
gridRef.current.getFooterValueByDataField('price', 0) // footerData 행 index
gridRef.current.getSubFooterValueByDataField('qty', 0) // subfooterData 배열 index

gridRef.current.expandAll()
gridRef.current.collapseAll()
```

> `getData()`는 **전체 internalData**(필터 무시). 화면 순서는 `getSortedData()`. 샘플 **§1.5** 참고.

#### UI 상태 초기화 (`resetGrid`)

검색·필터·정렬·선택·체크 등 **그리드 UI 상태**를 한 번에 되돌립니다. **행 데이터 복구는 부모 책임**이며, 보통 `setData(INITIAL)` 직후에 호출합니다.

```ts
// 샘플 초기화 패턴 (권장)
setData([...INITIAL_ROWS])
gridRef.current?.resetGrid()

// 수정 추적(I/U/D)까지 원복할 때만
gridRef.current?.resetGrid({ modifiedRows: true })

// 컬럼 DnD 순서까지 초기화 (enableColumnDragDrop)
gridRef.current?.resetGrid({ columnOrder: true })
```

| 옵션               | 기본값  | 동작                                                                                                                   |
| ------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `filters`          | `true`  | `clearFilterAll`                                                                                                       |
| `sorting`          | `true`  | `clearSortingAll`                                                                                                      |
| `selection`        | `true`  | `clearSelection` (포커스·범위)                                                                                         |
| `rowChecks`        | `true`  | 행 체크박스 해제                                                                                                       |
| `modifiedRows`     | `false` | `resetUpdatedItems('ALL')` — 편집·추가·삭제 추적만 원복(데이터 값은 `_original` 기준). `setData`/`refetch`와 병행 권장 |
| `cancelEditing`    | `true`  | 편집 중 셀 취소                                                                                                        |
| `closeFilterPopup` | `true`  | 헤더 필터 팝업 닫기                                                                                                    |
| `columnOrder`      | `false` | 컬럼 드래그 순서 초기화                                                                                                |

**페이지네이션**은 `options.pagination`을 부모 state로 넘기므로 `resetGrid` 대상이 아닙니다. 초기화 시 `setPageIndex(0)`(및 필요 시 `setPageSize`)을 **GridBtn / `Pagination`과 같은 부모 state**에서 처리하세요 (Sample 3 참고).

개별 메서드(`clearFilterAll`, `clearSortingAll`, `clearSelection`)도 그대로 사용할 수 있습니다. 업무 화면에서는 `PageSearch` 리셋 + `refetch` 또는 `key` remount 패턴이 일반적이며, `resetGrid`는 **샘플·데모 초기화**에 맞춰 두었습니다.

#### UI · 런타임 (`resize` / `setProp` / `destroy`)

```ts
gridRef.current.resize(480, 360) // px 또는 '80%'
gridRef.current.resize(undefined, 400) // height만
gridRef.current.setProp({ sortable: false, showRowStatus: false })
gridRef.current.destroy() // onDestroy 콜백 — 이후 Handle no-op. 재표시는 언마운트/재마운트
```

샘플: **Sample1 §1.8**.

#### 배치 업데이트

```ts
gridRef.current.updateRows([{ rowId: 'rowId1', data: { name: '수정됨' } }])
```

#### 동적 컬럼

```ts
gridRef.current.addColumn({ header: '비고', name: 'memo', editor: 'text', width: 150 })
gridRef.current.removeColumn('memo')
```

#### Undo / Redo (옵션 활성화 시)

```ts
gridRef.current.undo?.()
gridRef.current.redo?.()
```

#### 트리 조작 (treeOptions 시)

```ts
gridRef.current.insertChild?.('parentCode', { code: 'CHILD', name: '자식' }, 'last')
gridRef.current.insertSibling?.('siblingCode', { code: 'SIB', name: '형제' }, 'after')
gridRef.current.removeTreeNode?.('targetCode')
gridRef.current.updateTreeNode?.('targetCode', { name: '수정됨' })
gridRef.current.findTreeNode?.('targetCode')
gridRef.current.indent?.('targetCode')
gridRef.current.outdent?.('targetCode')
```

---

## 8. 이벤트 시스템 (bind / preventDefault)

### 기본 사용

```tsx
<DataGrid
  columns={cols}
  data={data}
  options={{ editingEvent: 'click' }}
  onReady={(api) => {
    // 단일 이벤트
    api.bind('cellClick', (e) => console.log(e.rowIndex, e.row))

    // 배열로 한 번에
    api.bind(['addRow', 'removeRow', 'afterChange'], (e) => {
      console.log('변경:', e.type)
    })

    // 모든 이벤트 (디버깅용)
    api.bind([...ALL_GRID_EVENTS], (e) => console.log('[grid]', e.type, e))
  }}
/>
```

### `before*` 이벤트의 차단 (preventDefault)

cancelable 이벤트는 핸들러에서 `e.preventDefault?.()`를 호출하면 후속 동작이 차단됩니다.

```tsx
onReady={(api) => {
  api.bind('beforeChange', (e) => {
    if (e.columnId === 'price' && Number(e.value) < 0) {
      toast.error('가격은 0 이상이어야 합니다.');
      e.preventDefault?.();   // 변경 차단
    }
  });

  api.bind('beforeRemoveRow', (e) => {
    const rows = e.rows as MyRow[];
    if (!confirm(`${rows.length}건 삭제할까요?`)) {
      e.preventDefault?.();
    }
  });
}}
```

### 비동기 차단 (`beforeCellClick`)

`beforeCellClick`은 `emitAsync`로 발행되어 핸들러가 `Promise`를 반환할 수 있습니다.

```tsx
api.bind('beforeCellClick', async (e) => {
  const dirty = detailRef.current?.getModifiedRows()
  if (dirty?.updatedRows.length) {
    const ok = await showConfirm('저장 안 된 변경이 있습니다. 이동할까요?')
    if (!ok) e.preventDefault?.()
  }
})
```

### Cancelable 이벤트 목록

| 이벤트                    | 차단 시 동작                                   |
| ------------------------- | ---------------------------------------------- |
| `editingStart`            | 편집 레이어 미오픈                             |
| `beforeChange`            | 셀 값 변경 차단                                |
| `beforeInsertRow`         | 행 추가 차단                                   |
| `beforeRemoveRow`         | 행 삭제 차단                                   |
| `beforeRemoveColumn`      | 컬럼 삭제 차단                                 |
| `dropEndBefore`           | DnD 이동 차단                                  |
| `beforeCellClick` (async) | 셀 클릭 차단 (포커스/편집/cellClick 모두 막힘) |

### 전체 이벤트 카탈로그

| 카테고리      | 이벤트                                                                                                                                                                                | 주요 페이로드                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 라이프사이클  | `ready`                                                                                                                                                                               | —                                                                                       |
| 편집          | `editingStart` `editingFinish` `editingCancel` `beforeChange` `afterChange`                                                                                                           | `rowIndex` `columnId` `value` `prevValue`                                               |
| 행 CRUD       | `beforeInsertRow` `addRow` `addRowFinish` `beforeRemoveRow` `removeRow`                                                                                                               | `row` 또는 `rows`                                                                       |
| 배치 업데이트 | `updateRows`                                                                                                                                                                          | `rows`                                                                                  |
| 컬럼 CRUD     | `addColumn` `removeColumn` `beforeRemoveColumn` `addTreeColumn` `columnStateChange`                                                                                                   | `columnId`                                                                              |
| 포인터        | `beforeCellClick` `cellClick` `cellDoubleClick` `cellLongTap` `headerClick` `contextMenu` `footerClick` `footerDoubleClick` `rowNumCellClick` `rowNumHeaderClick` `rowStateCellClick` | `rowIndex` `columnId` `row`                                                             |
| 키보드        | `keyDown`                                                                                                                                                                             | `key` `keyCode` `ctrlKey` `shiftKey` `orgEvent` · `preventDefault()`로 내부 내비 스킵   |
| 체크박스      | `check` `uncheck` `checkAll` `uncheckAll`                                                                                                                                             | `rowId` `row` `shiftKey` `ctrlKey` · 전체선택 시 `checked`                              |
| 정렬·필터     | `sorting` `filtering` `notFound`                                                                                                                                                      | `columnId` `direction` `value`                                                          |
| 클립보드      | `copy` `copyEnd` `paste` `pasteEnd`                                                                                                                                                   | —                                                                                       |
| 스크롤        | `hScrollChange` `vScrollChange`                                                                                                                                                       | `scrollLeft` `scrollTop`                                                                |
| DnD           | `dragBegin` `dropCancel` `dropEndBefore` `dropEnd`                                                                                                                                    | `rowIndex` `fromIndex` `toIndex` `row`                                                  |
| 컬럼          | `columnResize` `columnOrderChange`                                                                                                                                                    | `columnId` `width` `columnIds`                                                          |
| 트리          | `indent` `outdent` `treeLazyRequest`                                                                                                                                                  | `key` `newParentKey` `parentKey` `node`                                                 |
| 페이지        | `pageChange` `pageRowCountChange`                                                                                                                                                     | `pageIndex` `pageSize`                                                                  |
| 그룹          | `grouping`                                                                                                                                                                            | `columns`                                                                               |
| 선택          | `selectionChange` `selectedRowKeyChange` `focusChange`                                                                                                                                | `selectedCells` `row` `selectedRowKeyField` `selectedRowKeyValue` `rowIndex` `columnId` |
| Undo          | `undoRedoChange`                                                                                                                                                                      | `canUndo` `canRedo`                                                                     |

> 모든 이벤트 페이로드는 `type` + 이벤트별 필드 + (cancelable이면) `preventDefault()` / `defaultPrevented`를 갖는 평탄 객체입니다.

---

## 9. 편집 제약 & 선택 제약

### `isReadOnly` — 행 단위 편집 불가

```tsx
<DataGrid
  options={{
    isReadOnly: (row, rowStatus) => rowStatus !== 'I' && row.dept === 'HQ',
  }}
/>
```

| `true` 반환 시   | 동작                                                    |
| ---------------- | ------------------------------------------------------- |
| 셀 편집          | 해당 행 전체 편집 불가 (`editor` 있어도)                |
| `_rowStatus`     | 상태 점 클릭(restore) 불가                              |
| 셀 스타일        | 일반 편집불가와 동일 (`vc-dg__cell--readonly-bg`)       |
| 행 헤더 체크박스 | **영향 없음** — 체크 가능 (`isCheckboxDisabled`와 독립) |

- `false` / `null` / `undefined` / 미지정 → 컬럼 단위 규칙(`editor`·`editable`) 그대로

### `isCheckboxDisabled` — 행 헤더 체크박스 비활성

`rowHeaders: [{ type: 'checkbox' }]`일 때, **특정 행만** 체크박스를 disabled 처리합니다.

```tsx
<DataGrid
  options={{
    rowHeaders: [{ type: 'checkbox' }],
    isReadOnly: (row) => row.locked, // 편집만 막음
    isCheckboxDisabled: (row) => row.locked, // 체크까지 막을 때만
  }}
/>
```

| `true` 반환 시 | 동작                                                   |
| -------------- | ------------------------------------------------------ |
| 행 체크박스    | `disabled` (`getCanSelect` false)                      |
| 헤더 전체 선택 | 해당 행은 체크 대상에서 **제외**                       |
| `isReadOnly`   | **무관** — readonly여도 체크 가능, 이 props로만 비활성 |

- 미지정 → 모든 데이터 행 체크 가능 (subfooter 등 내부 행 제외)
- **`editor: 'checkbox'` 데이터 컬럼**·`headerCheckbox`와는 별개 (그건 셀 값 편집)

### `focusChangeConstraint` — dirty 행 이동 차단

```tsx
<DataGrid
  options={{
    focusChangeConstraint: async (dirty, target) => {
      const ok = await showConfirm('변경사항이 있습니다. 이동할까요?')
      if (!ok) return 'stay' // 현재 행 유지
      // return 'rollback';           // 변경 취소 후 이동
      return 'move' // 그대로 이동
    },
  }}
/>
```

| 반환값       | 동작                |
| ------------ | ------------------- |
| `'stay'`     | 현재 행에 머뭄      |
| `'rollback'` | 편집 취소 후 이동   |
| `'move'`     | 수정 유지한 채 이동 |

`dirty` 파라미터에는 `{ row, rowIndex, changes: Record<string, { prev, next }> }` 구조로 변경 내역이 전달됩니다.

### `selectionConstraint`

```tsx
<DataGrid
  options={{
    selectionConstraint: {
      mode: 'singleRow', // 'none' | 'singleRow' | 'multiRow' | 'singleCell' | 'multiCell'
      selectableColumns: ['name', 'email'], // 이 컬럼의 셀만 포커스/선택 가능
      isRowSelectable: (row) => !row.locked,
      maxSelections: 5,
      onSelectionBlocked: (reason) => {
        if (reason === 'max') toast.error('최대 5개까지')
      },
    },
  }}
/>
```

| `mode`         | 설명                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `'none'`       | 선택 비활성화                                                                   |
| `'singleRow'`  | 셀 클릭 시 **포커스 셀 1개** + `selectedRowIds` 행 하이라이트 (`--row-focused`) |
| `'multiRow'`   | 행 다중 선택 (클릭 토글)                                                        |
| (생략)         | `defaultSelectionMode` — 기본 `'singleRow'` (`types.ts`)                        |
| `'singleCell'` | 셀 단일 포커스 (행 전체 배경 없음)                                              |
| `'multiCell'`  | 셀 다중 선택 (클릭 누적)                                                        |

> **체크박스(`rowHeaders`)** 는 `selectionConstraint.mode`와 **분리** — 다중 체크 항상 가능(2026-04-13).  
> **행 헤더 체크 비활성**은 `isCheckboxDisabled` — `isReadOnly`·`selectionConstraint`와 무관.  
> **행 삭제·일괄 처리**는 `getCheckedRows*` 표준. `getSelectedRow*`는 `selectionConstraint` 하이라이트용.

### key 제어 행 선택 (마스터-디테일)

좌측 마스터 그리드 + 우측 디테일 패널 화면에서, **행 하이라이트를 부모 state로 제어**할 때 사용합니다.  
(`WorkspaceManagement`, `Role`, `UserRole`, `RoleUser`, `User` 등)

| 옵션                  | 설명                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `selectedRowKeyField` | 비즈니스 키 필드 (예: `'id'`). 트리 그리드에서 생략 시 `treeOptions.keyField` fallback |
| `selectedRowKeyValue` | 제어형 선택 값. `null`/`undefined`면 행 하이라이트 없음                                |

**동작 요약**

- **행 배경** — `selectedRowKeyValue` prop이 바뀔 때 그리드가 `selectedRowIds` 동기화 (셀 포커스와 분리)
- **셀 포커스** — 클릭한 셀에 `focusChange` (key 모드에서도 동작)
- **클릭 알림** — 행 키가 바뀔 때 `selectedRowKeyChange` + `selectionChange` (`source: 'selectedRowKey'`) 발행
- `selectionConstraint.mode`와 **무관** (pointer 행 선택 대신 key 채널 사용)

```tsx
// 페이지
const [selectedId, setSelectedId] = useState<number | null>(null)

useEffect(() => {
  contentRef.current?.setBeforeSelectGuard((row, proceed) => {
    if (row.id === selectedId) return
    if (detailRef.current?.hasDirtyChanges()) {
      messageUtil.showConfirm('', t('common.msg.unsavedChangesConfirm'), proceed)
    } else {
      proceed()
    }
  })
}, [t, selectedId])

// Content
;<DataGrid
  data={rows}
  options={{
    selectedRowKeyField: 'id',
    selectedRowKeyValue: selectedId,
  }}
  onReady={(api) => {
    api.bind('selectedRowKeyChange', (e) => {
      const row = e.row as MyRow
      const guard = beforeSelectGuardRef.current
      if (guard) guard(row, () => onSelect(row))
      else onSelect(row)
    })
  }}
/>
```

**`beforeSelectGuard` 패턴**

- 페이지가 `setBeforeSelectGuard`로 가드 등록 (디테일 `hasDirtyChanges`는 페이지만 앎)
- Content는 `selectedRowKeyChange`에서 `guard(row, proceed)` 호출
- `proceed()` → 부모 `setState` → `selectedRowKeyValue` prop 갱신 → 행 하이라이트 복구

**제거 가능한 레거시 보일러플레이트**

- `beforeCellClick` + `preventDefault` + `setSelectionByIndex`
- `selectionRestoreRevision` + `applyXxxHighlight` + `requestAnimationFrame`
- `lastFocusColRef`

**refetch 후 하이라이트** — `selectedRowKeyValue`를 유지하면 data 갱신 후 자동 복구.  
**서버 페이지네이션** — 선택 id가 현재 페이지에 없으면 하이라이트 없음 (페이지 이동은 부모 책임).

**RoleUser (다중 마스터 그리드)** — 시스템별 `PerSystemGrid`마다 동일 `selectedRowKeyValue={selectedRoleId}` 전달. 해당 role이 있는 그리드만 하이라이트.

---

## 10. 드래그 & 드롭

### 행 DnD

```tsx
<DataGrid
  columns={cols}
  data={data}
  options={{ enableRowDragDrop: true, height: 400 }}
  onReady={(api) => {
    api.bind('dragBegin', (e) => console.log('start:', e.rowIndex, e.row))
    api.bind('dropEndBefore', (e) => {
      if (badMove(e.fromIndex, e.toIndex)) e.preventDefault?.()
    })
    api.bind('dropEnd', (e) => {
      console.log(`${e.fromIndex} → ${e.toIndex}`)
    })
  }}
/>
```

### 컬럼 DnD

```tsx
<DataGrid
  options={{ enableColumnDragDrop: true }}
  onReady={(api) => {
    api.bind('columnOrderChange', (e) => {
      console.log('컬럼 순서:', e.columnIds)
    })
  }}
/>
```

---

## 11. Undo / Redo

```tsx
const gridRef = useRef<DataGridHandle<MyRow>>(null);
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

<DataGrid
  ref={gridRef}
  options={{ enableUndoRedo: true }}
  onReady={(api) => {
    api.bind('undoRedoChange', (e) => {
      setCanUndo(Boolean(e.canUndo));
      setCanRedo(Boolean(e.canRedo));
    });
  }}
/>;

<button disabled={!canUndo} onClick={() => gridRef.current?.undo?.()}>Undo</button>
<button disabled={!canRedo} onClick={() => gridRef.current?.redo?.()}>Redo</button>
```

추적되는 작업: 행 추가/삭제, 셀 편집, 트리 조작.

---

## 12. 트리 그리드

샘플: `SampleDataGrid4Content` — `/samples/dataGrid/sampleDataGrid4` (lazy · indent/outdent · DnD).

### `treeOptions` 요약

| 속성                    | 필수 | 설명                                           |
| ----------------------- | ---- | ---------------------------------------------- |
| `keyField`              | ✅   | 노드 고유 키 (예: `code`, `id`)                |
| `parentField`           | ✅   | 부모의 `keyField` 값. 루트는 `null`            |
| `lazyLoadEmptyChildren` |      | `true` → `treeLazyRequest` · `lazyTreePending` |
| `onTreeChange`          |      | insert/remove/move/update/lazyAttach 메타      |

> `**getData()` / `getModifiedRows()**`: 평면 배열 + `parentField` 반환.

---

### 기본 예시

```tsx
type DeptRow = { code: string; parentCode: string | null; name: string }

const rows: DeptRow[] = [
  { code: 'HQ', parentCode: null, name: '본사' },
  { code: 'DEV', parentCode: 'HQ', name: '개발본부' },
]

;<DataGrid
  data={rows}
  columns={columns}
  treeOptions={{ keyField: 'code', parentField: 'parentCode' }}
  options={{ height: 400 }}
/>
```

### 예시 — 지연 로드 (lazy)

```tsx
type DeptLazyRow = {
  id: string
  parentId: string | null
  name: string
  lazyTreePending?: boolean
}

const rowsLazy: DeptLazyRow[] = [
  { id: 'lazy-root', parentId: null, name: '루트 (펼치면 자식 로드)', lazyTreePending: true },
]
// treeOptions: { keyField: 'id', parentField: 'parentId', lazyLoadEmptyChildren: true }
// treeLazyRequest 수신 후: setRows((prev) => prev.map(...).concat([{ id: 'c1', parentId: 'lazy-root', name: '자식1' }, ...]))
```

---

### 펼침·이벤트

**트리 펼침**은 `options`의 `treeDefaultExpanded` / `treeExpanded` + `onTreeExpandedChange` (TanStack `ExpandedState`)로 제어합니다.

```tsx
<DataGrid
  options={{
    treeDefaultExpanded: true,
    // 또는 제어 모드:
    // treeExpanded: expandedState,
    // onTreeExpandedChange: setExpanded,
  }}
/>
```

**이벤트**: `indent`, `outdent`, `treeLazyRequest`, DnD 시 `dropEndBefore` / `dropEnd` 등은 `onReady((api) => api.bind(...))` 로 등록합니다.

---

## 13. 페이지네이션

### 역할 분리

| 컴포넌트     | 역할                                           |
| ------------ | ---------------------------------------------- |
| `GridBtn`    | 총 건수 + **page size 셀렉트** (`setPageSize`) |
| `Pagination` | **페이지 번호·이동**만                         |

### `Pagination` UI

페이지 번호는 **현재가 속한 10개 블록**만 표시합니다(줄임표 없음).

| 버튼 | 동작                |
| ---- | ------------------- |
| `<<` | 첫 페이지(0)        |
| `<`  | **이전 페이지** 1칸 |
| `>`  | **다음 페이지** 1칸 |
| `>>` | 마지막 페이지       |

### `Pagination` Props

| Prop           | 타입                     | 필수 | 설명                                             |
| -------------- | ------------------------ | ---- | ------------------------------------------------ |
| `pageResponse` | `PageResponseMeta`       |      | BE 메타 (`page` 0-base). 미지정 시 안전한 기본값 |
| `onPageChange` | `(page: number) => void` | ✅   | 이동할 페이지(0-base)                            |

`onPageSizeChange`, `pageSizeOptions`는 deprecated — `GridBtn`으로 이전.

`PageResponseMeta` = `Omit<PageResponse<unknown>, 'content'>`.

### 서버 사이드 (권장)

```tsx
import { DataGrid, GridBtn, Pagination } from '@vanta/common'

function MyPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const gridRef = useRef<DataGridHandle>(null)

  const { data: pageData } = useQuery(['users', pageIndex, pageSize], () =>
    fetchUsers({ page: pageIndex, size: pageSize }),
  )

  return (
    <>
      <GridBtn
        gridRef={gridRef}
        gridTitle="사용자"
        gridBtn={{
          isPaging: true,
          totalCount: pageData?.totalElements,
          pageSize,
          setPageSize,
          setCurrentPage: setPageIndex,
          pageSizeOptions: [
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
          ],
        }}
      />
      <DataGrid
        ref={gridRef}
        data={pageData?.content ?? []}
        columns={columns}
        options={{ height: 400 }}
      />
      <Pagination pageResponse={pageData} onPageChange={setPageIndex} />
    </>
  )
}
```

### 클라이언트 사이드

```tsx
<DataGrid
  data={allData}
  columns={columns}
  options={{
    height: 400,
    pagination: { pageIndex: 0, pageSize: 10, totalCount: allData.length },
  }}
  onReady={(api) => {
    api.bind('pageChange', (e) => console.log('페이지:', e.pageIndex))
    api.bind('pageRowCountChange', (e) => console.log('페이지 크기:', e.pageSize))
  }}
/>
```

> 클라이언트 페이지네이션은 `treeOptions`와 함께 사용하지 않습니다.

### 무한 스크롤 — `ScrollPagination`

전체 데이터를 미리 갖고 있을 때 스크롤 하단 근접 시 청크 단위로 표시 행을 늘려갑니다.

```tsx
import { ScrollPagination } from '@vanta/common'

function MyPage() {
  const [allData, setAllData] = useState<MyRow[]>([])

  return (
    <ScrollPagination<MyRow>
      source={allData}
      chunkSize={20} // 한 번에 붙이는 행 수 (기본 20)
      thresholdPx={180} // 하단 임계 거리 px (기본 180)
      showResetButton // 초기화 버튼 (기본 true)
      renderGrid={(rows, gridProps) => (
        <DataGrid
          data={rows}
          columns={columns}
          options={{ height: 400 }}
          onReady={gridProps.onReady} // 반드시 전달
        />
      )}
    />
  )
}
```

#### `ScrollPaginationProps` 주요 속성

| 속성                      | 타입                             | 기본값             | 설명                                            |
| ------------------------- | -------------------------------- | ------------------ | ----------------------------------------------- |
| `source`                  | `readonly T[]`                   | (필수)             | 전체 원본 데이터                                |
| `chunkSize`               | `number`                         | `20`               | 한 번에 추가하는 행 수                          |
| `thresholdPx`             | `number`                         | `180`              | 하단에서 이 거리(px) 안이면 다음 청크 로드      |
| `scrollContainerSelector` | `string`                         | `'.vc-dg__scroll'` | DataGrid 기본값 그대로 사용하면 됨              |
| `renderGrid`              | `(rows, gridProps) => ReactNode` | (필수)             | `gridProps.onReady`를 DataGrid `onReady`에 전달 |
| `showResetButton`         | `boolean`                        | `true`             | 하단 초기화 버튼                                |
| `maxFillSteps`            | `number`                         | `40`               | 뷰포트보다 짧을 때 자동 채움 최대 반복          |

> `gridProps.onReady`를 DataGrid에 전달하지 않으면 스크롤 감지가 동작하지 않습니다.

---

## 14. 푸터(합계 행)

`options.footerData`는 그리드 **하단 고정** 푸터(본문 스크롤과 분리)입니다.  
`options.subfooterData`는 **본문 중간** 소계 행이며, API·집계 범위가 다릅니다.

| 구분      | prop            | 집계·삽입 기준                                                                            |
| --------- | --------------- | ----------------------------------------------------------------------------------------- |
| 하단 푸터 | `footerData`    | **전체 detail** (`internalData`, `D`·inline subfooter 제외). 필터로 숨긴 행도 집계에 포함 |
| 중간 소계 | `subfooterData` | **현재 표시**(필터·정렬·페이지) detail 순서. `rowIndex`·`aggregateDirection` 구간별 집계  |

타입: `FooterRowData`, `SubfooterDataItem`, `SubfooterMerge`, `SubfooterAggregateDirection` (`@vanta/common`).

### 14.1 `operations` + `merges` (권장 — Sample1 §1.1)

숫자 컬럼은 `operations`로 자동 집계하고, 라벨은 `merges`로 가로 병합합니다.  
**여러 푸터 줄**은 배열로 전달합니다.

```tsx
import type { FooterRowData } from '@vanta/common'

const footerData: FooterRowData[] = [
  {
    operations: { price: 'MIN', qty: 'MIN' },
    merges: [{ from: 'dept', colSpan: 2, value: '최소값' }],
  },
  {
    operations: { price: 'MAX', qty: 'MAX' },
    merges: [{ from: 'dept', colSpan: 2, value: '최대값' }],
  },
  {
    operations: { price: 'SUM', qty: 'SUM' },
    merges: [{ from: 'dept', colSpan: 2, value: '합계' }],
  },
]

;<DataGrid
  data={data}
  columns={columns}
  options={{
    footerData, // FooterRowData | FooterRowData[]
    height: 400,
    columnPinning: { left: ['id', 'name'] },
  }}
/>
```

| `operations` 값                               | 설명                                      |
| --------------------------------------------- | ----------------------------------------- |
| `'SUM' \| 'AVG' \| 'MIN' \| 'MAX' \| 'COUNT'` | 문자열 shorthand                          |
| `{ op: 'AVG', decimals: 2 }`                  | 소수 자릿수 지정 (기본 3, `COUNT`는 정수) |

- `operations` **키 = dataField** — **숫자로 변환 가능한 컬럼**만 집계됩니다.
- `operations`에 없는 필드는 같은 행 객체에 **고정값**으로 넣을 수 있습니다 (`{ name: '합계', operations: { price: 'SUM' } }`).
- `merges[].from`은 컬럼 `name`(id). `colSpan`·`value`는 subfooter와 동일 규칙.
- `_checkbox`·`_rowNum` 등 **앞쪽 내부열**은 footer가 자동 colSpan 병합(비어 있을 때). 내부열을 `merges`에 직접 쓰면 자동 병합은 생략됩니다.

### 14.2 고정값만 (operations 없음 — Sample1 §1.2)

```tsx
// operations 없이 컬럼 id에 값을 직접 지정
const footerData = {
  _rowNum: '행 수',
  dept: data.length,
};

options={{ footerData, height: 320 }}
```

### 14.3 이벤트·값 조회

```tsx
onReady={(api) => {
  api.bind('footerClick', (e) => console.log(e.columnId));
  api.bind('footerDoubleClick', (e) => console.log(e.columnId));
  // operations 반영 후 계산값 — footerData 배열이면 rowIndex 0-based
  api.getFooterValueByDataField('price', 2);
}}
```

### 14.4 레이아웃

| 항목            | 설명                                                     |
| --------------- | -------------------------------------------------------- |
| 세로 스크롤     | 본문만 스크롤, 푸터는 그리드 **하단 고정**               |
| 가로 스크롤     | 푸터 `.vc-dg__scroll--footer` ↔ 본문 `scrollLeft` 동기화 |
| `columnPinning` | 고정 열 푸터 셀도 sticky (`bottom: 0`)                   |
| `height`        | 푸터·가상 스크롤 사용 시 **필수**                        |

### 14.5 본문 중간 소계 (`subfooterData`)

| 방식                           | 정렬    | 설명                                                               |
| ------------------------------ | ------- | ------------------------------------------------------------------ |
| `options.subfooterData` (권장) | **ON**  | `data`는 detail만. 필터·정렬 바뀌면 `rowIndex`·`operations` 재계산 |
| inline `_rowKind: 'subfooter'` | **OFF** | `data`에 섞기 — 레거시, `@deprecated`                              |

#### `rowIndex` · `aggregateDirection`

| 필드                 | 기본값    | 설명                                                   |
| -------------------- | --------- | ------------------------------------------------------ |
| `rowIndex`           | (필수)    | 현재 **표시 중인 detail 행** 기준 0-based 인덱스       |
| `aggregateDirection` | `'above'` | 소계 행 위치와 집계 구간 방향 (`'above'` \| `'below'`) |

| `aggregateDirection` | 소계 행 위치                           | `operations` 집계 구간                                |
| -------------------- | -------------------------------------- | ----------------------------------------------------- |
| **`above`** (기본)   | `rowIndex` 행 **다음** (그룹 **아래**) | 그룹 시작 ~ `rowIndex` (**위쪽** detail 행)           |
| **`below`**          | `rowIndex` 행 **앞** (그룹 **위**)     | `rowIndex` ~ 다음 subfooter 전 (**아래쪽** detail 행) |

- 여러 subfooter는 `rowIndex` 오름차순으로 처리합니다.
- `above`에서 두 번째 이후 항목은 **이전 subfooter 다음 행**부터 집계합니다.
- `below`에서 두 번째 이후 항목은 **이전 subfooter의 `rowIndex`**가 다음 그룹의 시작이 됩니다.
- `rowIndex`보다 앞에 있는 detail만 있고 어느 subfooter에도 속하지 않으면, 해당 행은 소계 없이 그대로 표시됩니다.

#### 예시 — `above` (기본, Sample1 §1.4 좌측)

detail 20행(개발 10 + 디자인 10). 소계는 각 그룹 **맨 아래**, 위쪽 행을 집계합니다.

```tsx
import type { SubfooterDataItem } from '@vanta/common';

const subfooterDataAbove: SubfooterDataItem[] = [
  {
    rowIndex: 9,
    // aggregateDirection: 'above', // 생략 시 기본값
    operations: { price: 'SUM', qty: 'AVG' },
    merges: [{ from: 'dept', colSpan: 2, value: '개발 합계' }],
  },
  {
    rowIndex: 19,
    operations: { price: 'AVG', qty: 'SUM' },
    merges: [{ from: 'dept', colSpan: 2, value: '디자인 평균' }],
  },
];

options={{
  subfooterData: subfooterDataAbove,
  // treeOptions와 동시 사용 불가. enableAutoMerge는 subfooter 구간 경계에서만 병합 끊김 (Sample1 §1.4 우측)
}}
```

표시 순서 (above):

```text
개발 detail 0 ~ 9
[개발 합계]        ← rowIndex 9 다음, 0~9행 집계
디자인 detail 10 ~ 19
[디자인 평균]      ← rowIndex 19 다음, 10~19행 집계
```

#### 예시 — `below` (Sample1 §1.4 우측)

소계 행이 그룹 **위**에 오고, **아래 detail 행**을 집계합니다. `rowIndex`는 각 그룹의 **시작 행**입니다.

```tsx
const subfooterDataBelow: SubfooterDataItem[] = [
  {
    rowIndex: 0,
    aggregateDirection: 'below',
    operations: { price: 'SUM', qty: 'AVG' },
    merges: [{ from: 'dept', colSpan: 2, value: '개발 합계' }],
  },
  {
    rowIndex: 10,
    aggregateDirection: 'below',
    operations: { price: 'AVG', qty: 'SUM' },
    merges: [{ from: 'dept', colSpan: 2, value: '디자인 평균' }],
  },
]
```

표시 순서 (below):

```text
[개발 합계]        ← rowIndex 0 앞, 0~9행 집계
개발 detail 0 ~ 9
[디자인 평균]      ← rowIndex 10 앞, 10~19행 집계
디자인 detail 10 ~ 19
```

#### 값 조회

```ts
gridRef.current.getSubFooterValueByDataField('price', 0) // subfooterData 배열 index (0-based)
```

샘플: **§1.1** `footerData` 3행 · **§1.2** 고정값 footer · **§1.4** `subfooterData` (`above` / `below` / **merge+subfooter** 우측) · **§1.6** Handle.

### 14.6 `enableAutoMerge` + subfooter

`subfooterData` prop·inline `_rowKind: 'subfooter'` 와 **함께 사용 가능**합니다.

- subfooter `merges`에 **포함되지 않은** 컬럼(`enableAutoMerge: true`)은 인접 detail과 세로 병합.
  - **above**: detail 구간 + 바로 뒤 subfooter 1행까지 rowspan (다음 구간 detail은 제외).
  - **below**: subfooter 1행 + 바로 아래 detail 구간까지 rowspan.
- subfooter `merges.from`이 덮는 컬럼(dept·name 등)은 가로 병합 우선 — 세로 병합 연장 안 함.
- 동일 dept 값이라도 **다음 구간** detail과는 병합하지 않음.
- `treeOptions`와 subfooter 조합은 여전히 불가.

```tsx
const columns = createColumns<Row>([
  { header: '부서', name: 'dept', enableAutoMerge: true },
  { header: '이름', name: 'name', width: 120 },
  { header: '단가', name: 'price', width: 100, align: 'right' },
]);

options={{
  subfooterData: [
    {
      rowIndex: 0,
      aggregateDirection: 'below',
      operations: { price: 'SUM' },
      merges: [{ from: 'name', colSpan: 1, value: '개발 합계' }],
    },
  ],
}}
```

→ dept는 소계 행(앵커) + 아래 detail 10행까지 rowspan 11 (`below`), name 열에만 소계 라벨.

구현: `getSubfooterVerticalMergeBlockedColumnIds` + `buildMergeCellSpecsByFlatDisplayRows` — Sample1 §1.4 우측 (`below`).

---

## 15. 가상화(Virtualization)

```tsx
// 기본: 200건 이상이면 자동 가상화
<DataGrid options={{ height: 400 }} ... />

// 임계값 조정
<DataGrid options={{ virtualizeThreshold: 100, estimateRowHeight: 40, height: 400 }} ... />

// 비활성화
<DataGrid options={{ virtualizeThreshold: Infinity }} ... />
```

- `height`가 **반드시** 필요 (스크롤 컨테이너 높이).
- `height` 없으면 컨텐츠 높이로 늘어나 가상화 미동작.
- `enableAutoMerge` 컬럼이 있으면 가상화 자동 비활성화 (병합 셀 높이 계산 필요).

---

## 16. 툴팁

툴팁은 **셀 툴팁**(`cellTooltip`)과 **헤더 툴팁**(`tooltip`) 두 가지가 독립적으로 존재합니다.

### 셀 툴팁 (`cellTooltip`)

```tsx
const columns = createColumns<MyRow>([
  // 1. 기본: 셀 값을 그대로 표시 (delay 500ms)
  { header: '이름', name: 'name', cellTooltip: true },
  // htmlContent 컬럼 — plain text(`<br>`→개행)
  { header: '비고', name: 'memo', htmlContent: true, cellTooltip: true },

  // 2. 딜레이 조절
  { header: '수량', name: 'qty', cellTooltip: { delay: 100 } },

  // 3. 커스텀 함수
  {
    header: '비고',
    name: 'memo',
    cellTooltip: {
      tooltipFunction: (info) => (
        <div className="text-sm">
          <strong>{info.headerText}</strong>: {String(info.value)}
        </div>
      ),
      delay: 200,
    },
  },
])
```

`CellTooltipInfo` 페이로드: `{ rowIndex, columnId, value, headerText, rowData }`.

### 헤더 툴팁 (`tooltip`)

헤더 셀에 마우스를 올렸을 때 표시됩니다. 셀 툴팁과 동일한 인터페이스를 지원합니다.

```tsx
const columns = createColumns<MyRow>([
  // 1. 고정 ReactNode
  { header: '이름', name: 'name', tooltip: <span>성명을 입력합니다</span> },

  // 2. 커스텀 함수 + 딜레이
  {
    header: '비고',
    name: 'memo',
    tooltip: {
      tooltipFunction: ({ columnId, headerText }) => (
        <div className="text-sm">
          <strong>{headerText}</strong> 컬럼 설명
        </div>
      ),
      delay: 300,
    },
  },
])
```

`HeaderTooltipInfo` 페이로드: `{ columnId, headerText }`.

### 타입 요약

| prop          | 타입                                       | 대상 |
| ------------- | ------------------------------------------ | ---- |
| `cellTooltip` | `boolean \| { tooltipFunction?, delay? }`  | 셀   |
| `tooltip`     | `ReactNode \| { tooltipFunction, delay? }` | 헤더 |

---

## 17. 상황별 구현 레시피

### 레시피 1 — 기본 CRUD 그리드

```tsx
import { useRef, useState } from 'react'
import { DataGrid, createColumns, type DataGridHandle } from '@vanta/common'

type Item = { id: number; name: string; qty: number }

const columns = createColumns<Item>([
  { header: 'ID', name: 'id', width: 60 },
  { header: '품목', name: 'name', width: 200, editor: 'text', sortable: true, filter: 'select' },
  { header: '수량', name: 'qty', width: 80, editor: 'number', sortable: true },
])

export function ItemGrid() {
  const ref = useRef<DataGridHandle<Item>>(null)
  const [data, setData] = useState<Item[]>(fetchItems())

  const handleSave = async () => {
    const { createdRows, updatedRows, deletedRows } = ref.current!.getModifiedRows()
    await api.saveItems({ createdRows, updatedRows, deletedRows })
    setData(await fetchItems())
  }

  return (
    <>
      <button onClick={() => ref.current?.addRow({ id: 0, name: '', qty: 0 }, 'last')}>
        + 추가
      </button>
      <button onClick={() => ref.current?.removeSelectedRows()}>선택 삭제</button>
      <button onClick={handleSave}>저장</button>

      <DataGrid
        ref={ref}
        data={data}
        columns={columns}
        options={{
          rowHeaders: [{ type: 'rowNum' }, { type: 'checkbox' }],
          // showRowStatus 기본값 true(생략 가능). 숨기려면 false
          height: 400,
          editingEvent: 'click',
        }}
      />
    </>
  )
}
```

### 레시피 2 — 서버 정렬 & 필터

```tsx
const [sortCol, setSortCol] = useState('')
const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>(false)
const [filters, setFilters] = useState<Record<string, string | string[]>>({})

const { data } = useQuery(['items', sortCol, sortDir, filters], () =>
  api.getItems({ sort: sortCol, dir: sortDir, ...filters }),
)

;<DataGrid
  data={data ?? []}
  columns={columns}
  onReady={(api) => {
    api.bind('sorting', (e) => {
      setSortCol(e.columnId as string)
      setSortDir(e.direction as 'asc' | 'desc' | false)
    })
    api.bind('filtering', (e) => {
      setFilters((prev) => ({ ...prev, [e.columnId as string]: (e.value as string) ?? '' }))
    })
  }}
/>
```

### 레시피 3 — 읽기 전용 + 특정 컬럼만 편집

```tsx
const columns = createColumns<MyRow>([
  { header: '코드', name: 'code', width: 80 }, // editor 없음 → 읽기 전용
  { header: '이름', name: 'name', width: 120, editor: 'text' }, // 편집 가능
  { header: '생성일', name: 'createdAt', width: 120 }, // 읽기 전용
])
```

### 레시피 4 — 동적 컬럼

```tsx
const ref = useRef<DataGridHandle<MyRow>>(null);

<button onClick={() => ref.current?.addColumn({ header: '비고', name: 'memo', editor: 'text' })}>
  컬럼 추가
</button>
<button onClick={() => ref.current?.removeColumn('memo')}>컬럼 삭제</button>
```

### 레시피 5 — 행 클릭 시 상세 패널

```tsx
const [selected, setSelected] = useState<MyRow | null>(null)

;<DataGrid
  options={{ selectionConstraint: { mode: 'singleRow' } }}
  onReady={(api) => {
    api.bind('cellClick', (e) => setSelected(e.row as MyRow))
  }}
/>

{
  selected && <DetailPanel data={selected} />
}
```

### 레시피 6 — 변경 전 유효성 검사

```tsx
<DataGrid
  onReady={(api) => {
    api.bind('beforeChange', (e) => {
      if (e.columnId === 'email' && !isValidEmail(String(e.value))) {
        toast.error('올바른 이메일 형식이 아닙니다.')
        e.preventDefault?.()
      }
      if (e.columnId === 'qty' && Number(e.value) < 0) {
        toast.error('수량은 0 이상이어야 합니다.')
        e.preventDefault?.()
      }
    })
  }}
/>
```

### 레시피 7 — 셀 범위 선택·복사/붙여넣기

```tsx
<DataGrid
  options={{ enableRangeSelection: true, enableCellCopyPaste: true }}
  onReady={(api) => {
    api.bind('selectionChange', (e) => {
      const cells = e.selectedCells as Array<{ rowIndex: number; columnId: string }>
      console.log('선택된 셀:', cells)
    })
    api.bind(['copy', 'paste', 'copyEnd', 'pasteEnd'], (e) => console.log(e.type))
  }}
/>
```

| 동작      | 규칙                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------- |
| 복사      | 드래그 범위 또는 **포커스 셀 1×1** → TSV (`\t` / `\n`). `multiSelect`는 `KR,JP`                    |
| 붙여넣기  | 포커스 셀 기준 Excel 방식. `**coercePasteValue` + `checkCellValidation`\*\* (에디터 commit과 동일) |
| 편집 중   | `text` input/textarea는 브라우저 기본 · 그 외 에디터는 닫고 `batchPasteCommit`                     |
| 부분 실패 | 첫 validation 오류만 alert, **유효 셀만** 반영                                                     |

샘플: **Sample8 §8.5** · **Sample1 §1.7**.

### 레시피 8 — 마스터·디테일 (비동기 차단)

```tsx
const masterRef = useRef<DataGridHandle<Order>>(null)
const detailRef = useRef<DataGridHandle<OrderItem>>(null)

;<DataGrid
  ref={masterRef}
  options={{ rowHeaders: [{ type: 'rowNum' }], editingEvent: 'click', height: 300 }}
  onReady={(api) => {
    api.bind('beforeCellClick', async (e) => {
      const dirty = detailRef.current?.getModifiedRows()
      if (!dirty?.updatedRows.length) return
      const ok = await showConfirm('저장 안 된 변경이 있습니다. 이동할까요?')
      if (!ok) e.preventDefault?.() // 마스터 이동 차단
    })
    api.bind('cellClick', (e) => loadDetailFor((e.row as Order).id))
  }}
/>
```

---

## 18. 성능 고려사항

### 컬럼 정의는 외부에서

```tsx
// Bad: 매 렌더마다 새 배열
function MyComponent() {
  const columns = createColumns([...]);
  return <DataGrid columns={columns} />;
}

// Good: 모듈 레벨 또는 useMemo
const columns = createColumns([...]);
```

### options 객체도 안정화

```tsx
// Bad: 매 렌더마다 새 객체
;<DataGrid options={{ height: 400, rowHeaders: [{ type: 'rowNum' }] }} />

// Good: useMemo
const options = useMemo(
  () => ({
    height: 400,
    rowHeaders: [{ type: 'rowNum' }],
  }),
  [],
)
;<DataGrid options={options} />
```

### onReady는 이벤트 등록 1회만

`onReady`는 최초 마운트 시 1회만 호출. 핸들러 내부에서 외부 state 캡처 시 ref 패턴 사용:

```tsx
const dataRef = useRef(data)
dataRef.current = data

;<DataGrid
  onReady={(api) => {
    api.bind('cellClick', (e) => {
      console.log(dataRef.current.length) // 항상 최신
    })
  }}
/>
```

### 가상화 활용

`height`는 거의 항상 지정. 200행 이상 자동 가상화.

### 주의사항

| 상황                            | 영향                 | 대안                |
| ------------------------------- | -------------------- | ------------------- |
| `enableAutoMerge` + 대량 데이터 | 가상화 자동 비활성화 | 필요한 컬럼만 병합  |
| 1000건+ 클라이언트 정렬/필터    | O(n log n)           | 서버 사이드 처리    |
| 무거운 커스텀 렌더러            | 스크롤 시 재렌더     | React.memo + 가볍게 |
| `bind()` 핸들러에서 무거운 연산 | 이벤트 병목          | debounce 적용       |

### 불필요한 기능 비활성화

```tsx
<DataGrid
  options={{
    sortable: false,
    resizable: false,
    enableRangeSelection: false,
    enableUndoRedo: false,
  }}
/>
```

---

## 샘플 코드 참고

경로: `vanta-admin-front/src/components/samples/dataGrid/` · URL: `/samples/dataGrid/sampleDataGrid{N}`

| 샘플                      | 주요 기능                                                                                                                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SampleDataGrid1Content`  | **§1.1** 편집·footer·`wordWrap`·`htmlContent`(`비고` 4행 HTML) · `styleFunction`·`visible` · **§1.2** 핀 · **§1.4** `subfooterData` (`aggregateDirection` above/below) · **§1.5** `getData` · **§1.6** Handle · **§1.7** validation·paste · **§1.8** `resize`/`setProp`/`destroy` |
| `SampleDataGrid2Content`  | **§2.1** editor 전종(`combobox`·`multiSelect` chip·`calendarMode`·checkbox) · **§2.2** `IconCell`/`BadgeCell` 등 렌더러                                                                                                                                                           |
| `SampleDataGrid3Content`  | 변경 추적 + Undo / Redo                                                                                                                                                                                                                                                           |
| `SampleDataGrid4Content`  | **트리** lazy · indent/outdent · DnD                                                                                                                                                                                                                                              |
| `SampleDataGrid5Content`  | 마스터·디테일 + `focusChangeConstraint`                                                                                                                                                                                                                                           |
| `SampleDataGrid6Content`  | 서버 사이드 정렬/필터                                                                                                                                                                                                                                                             |
| `SampleDataGrid7Content`  | **§7.1** CSV / Excel / PDF 내보내기 (`GridBtn` + `fontPath`) · `htmlContent` export plain text · formatter/date 포맷                                                                                                                                                              |
| `SampleDataGrid8Content`  | 커스텀 에디터/렌더러 · **§8.5** copy/paste · **§8.14** cellClick/dblclick                                                                                                                                                                                                         |
| `SampleDataGrid9Content`  | 배치 작업 + Undo/Redo                                                                                                                                                                                                                                                             |
| `SampleDataGrid11Content` | 대규모 그리드 (1000건+) 가상화                                                                                                                                                                                                                                                    |

---

## 19. 키보드 내비게이션

셀에 포커스가 있으면 키보드만으로 그리드를 탐색하고 편집할 수 있습니다. 별도 옵션 없이 기본 활성화됩니다.

### 지원 키

| 키                      | 동작                                                     |
| ----------------------- | -------------------------------------------------------- |
| `Arrow Up/Down`         | 같은 컬럼에서 위/아래 행으로 이동                        |
| `Arrow Left/Right`      | 같은 행에서 좌/우 컬럼으로 이동                          |
| `Tab`                   | 다음 셀로 이동 (행 끝이면 다음 행 첫 셀)                 |
| `Shift + Tab`           | 이전 셀로 이동 (행 처음이면 윗 행 마지막 셀)             |
| `Enter`                 | 포커스된 셀에서 편집 시작 (`editor`가 있는 컬럼만)       |
| `Enter` (편집 중)       | 편집 값 커밋                                             |
| `Escape` (편집 중)      | 편집 취소                                                |
| `Tab` (편집 중)         | 편집 값 커밋 후 **다음 편집 가능 셀로 이동 + 편집 시작** |
| `Shift + Tab` (편집 중) | 편집 값 커밋 후 **이전 편집 가능 셀로 이동 + 편집 시작** |

### 동작 규칙

- **편집 중 Tab/Shift+Tab은 커밋 + 이동 + 자동 편집 시작**: 내장 에디터(text·number·select·date)는 Tab을 가로채 값을 커밋한 뒤 인접 편집 셀의 에디터를 자동으로 엽니다. 폼 입력처럼 빠른 데이터 입력이 가능합니다.
- **편집 중 Arrow는 에디터 내부에서 동작**: `<input>` 캐럿 이동 등 에디터가 자체적으로 처리합니다.
- **포커스 셀은 DOM focus를 받음**: 방향키/Tab으로 이동하면 해당 `<td>`에 `tabIndex=0` + `ref.focus()`가 적용되어 스크린 리더와 브라우저 포커스 링이 동기화됩니다.
- **범위 선택 해제**: 키보드 이동 시 기존 드래그 범위 선택(`enableRangeSelection`)은 자동으로 해제됩니다.

### 키보드 이벤트 수신

```tsx
onReady={(api) => {
  api.bind('keyDown', (e) => {
    console.log(e.key, e.keyCode, e.ctrlKey, e.shiftKey);
    if (e.key === 'F2') e.preventDefault?.(); // 내부 Arrow/Tab 내비 스킵
  });
}}
```

> `keyDown`은 내비게이션 **전**에 발행됩니다. 핸들러에서 `preventDefault()` 호출 시 `defaultPrevented`가 true이면 **내부 키 처리(방향키·Tab 등)를 스킵**합니다.

---

## 20. AUI Grid → DataGrid 매핑표

기존 AUI Grid 화면을 본 DataGrid로 옮길 때 참조합니다.
**메서드**는 `gridRef.current.method(...)`로 호출하고, **이벤트**는 `api.bind(name, handler)`로 등록합니다.

### 20.1 메서드 매핑표

| No  | AUI Grid 메서드                                   | DataGrid 구현                                                  | 비고                                                                        |
| --- | ------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | `addRow`                                          | `addRow(row, 'first' \| 'last')`                               | 위치는 `'first'`/`'last'` 문자열                                            |
| 2   | `addTreeRow` / `addTreeRowByIndex`                | `insertChild(parentKey, row, position)` / `insertSibling(...)` | 트리 모드 전용. React state만 직접 고칠 때는 `treeHelpers`로 동일 연산 가능 |
| 3   | `removeRow` / `removeRowByRowId`                  | `removeRows([rowId])`                                          | 단수형 없음 — 항상 rowId 배열                                               |
| 4   | `removeCheckedRows`                               | `removeCheckedRows()`                                          | 동일. 행 단위 일괄 삭제의 **표준** 메서드                                   |
| 5   | `updateRow` / `updateRows` / `updateRowsById`     | `updateRows([{ rowId, data }])` + `updateRows` 이벤트          | 단건도 배열로 호출 (단수형 없음)                                            |
| 6   | `updateRowBlockToValue` / `updateAllToValue`      | (직접 메서드 없음)                                             | `data` props 갱신으로 대응                                                  |
| 7   | `refreshRows`                                     | (자동)                                                         | TanStack이 데이터 변경을 자동 감지·리렌더                                   |
| 8   | `addColumn`                                       | `addColumn(def)` + `addColumn` 이벤트                          | 동일                                                                        |
| 9   | `removeColumn`                                    | `removeColumn(id)` + `removeColumn` 이벤트                     | 동일                                                                        |
| 10  | `setColumnOrder` / `changeColumnLayout`           | `enableColumnDragDrop` + `columnOrderChange` 이벤트            | 사용자 DnD 또는 `columns` props 갱신                                        |
| 11  | `setColumnProp` / `setColumnPropByDataField`      | (직접 메서드 없음)                                             | `columns` props 갱신                                                        |
| 12  | `setColumnSizeList`                               | (직접 메서드 없음)                                             | 컬럼 정의의 `width` 또는 사용자 리사이즈                                    |
| 13  | `hideColumnByDataField` / `showColumnByDataField` | `visible: false` + columns remount / 동적 `columns`            | Handle 전용 hide/show 없음 — `visible`·부모 state 교체                      |
| 14  | `getGridData`                                     | `getData()`                                                    | 동일                                                                        |
| 15  | `getOrgGridData`                                  | (별도 메서드 없음)                                             | 외부 `data` 변수가 원본 자체이므로 그것을 사용                              |
| 16  | `getCellValue`                                    | `getCellValue(rowId, dataField)`                               | `setCellValue`는 validation 없이 `updateRows` 래핑                          |
| 17  | `getRowCount`                                     | `getRowCount()`                                                | internalData detail 행 수(subfooter 제외). 화면 순서는 `getSortedData()`    |
| 18  | `getCurrentPageData`                              | `getSortedData()`                                              | 클라이언트 페이지네이션 시 화면 절단된 데이터 반환                          |
| 19  | `getEditedRowItems`                               | `getModifiedRows().updatedRows`                                | —                                                                           |
| 20  | `getAddedRowItems`                                | `getModifiedRows().createdRows`                                | —                                                                           |
| 21  | `getRemovedItems`                                 | `getModifiedRows().deletedRows`                                | —                                                                           |
| 22  | `isAddedById` / `isEditedById` / `isRemovedById`  | `getRowStatus(rowId)` · `isEditedCell(rowId, dataField)`       | 필드 단위 수정 여부는 `isEditedCell` (`'U'`+`_original` 비교)               |
| 23  | `getInitValueItem` / `restoreEditedRows`          | `restoreRowState(rowId)`                                       | 행 단위 원복                                                                |
| 24  | `resetUpdatedItems`                               | `resetUpdatedItems('C' \| 'U' \| 'D' \| 'ALL')`                | `resetGrid({ modifiedRows: true })`와 연동 가능                             |
| 25  | `getCheckedRowItems` / `getCheckedRowItemsAll`    | `getCheckedRows()` / `getCheckedRowKeys()`                     | 행 데이터·rowId 두 메서드로 분리                                            |
| 26  | `setCheckedRowsByIds` / `setAllCheckedRows`       | `setCheckedRowsByIds` / `addCheckedRowsByIds`                  | 전체선택 UI는 헤더 체크박스 · `headerCheckbox`는 **데이터** 일괄 토글       |
| 27  | `getSelectedRows` / `getSelectedItems`            | `getSelectedRows()` / `getSelectedRowKeys()`                   | `selectionConstraint` / `selectedRowIds` (체크박스와 분리)                  |
| 28  | `setSelectionByIndex` / `clearSelection`          | `setSelectionByIndex` / `setSelectionBlock` / `clearSelection` | 체크박스는 `clearSelection` 대상 아님                                       |
| 29  | `setCellValue`                                    | `setCellValue(rowId, dataField, value)` 또는 `updateRows`      | Handle `setCellValue` = `updateRows` 래핑                                   |
| 30  | `openInputer` / `forceEditingComplete`            | (직접 메서드 없음)                                             | 셀 클릭 / Enter / Tab으로 트리거                                            |
| 31  | `expandAll` / `collapseAll`                       | `expandAll()` / `collapseAll()`                                | `table.toggleAllRowsExpanded`. 트리 없으면 no-op                            |
| 32  | `expandItemByRowId`                               | `treeExpanded` 옵션 + `onTreeExpandedChange` 콜백              | 제어 모드로 처리                                                            |
| 33  | `indentTreeDepth` / `outdentTreeDepth`            | `indent(key)` / `outdent(key)`                                 | 트리 모드 전용                                                              |
| 34  | `getTreeFlatData`                                 | `treeHelpers.flatten(data)` 또는 `getData()`                   | 평면+`_depth` 변환 유틸 · 그리드 데이터는 이미 평면+`parentField`           |
| 35  | `setSorting` / `clearSortingAll`                  | `clearSortingAll()` (+ 헤더 클릭)                              | `sorting` 제어 state                                                        |
| 36  | `setFilter` / `clearFilter` / `searchAll`         | `clearFilter(colId)` / `clearFilterAll()`                      | `filter: 'text' \| 'select' \| 'checkbox'` · `filtering` 이벤트             |
| 37  | `movePageTo` / `setPageRowCount`                  | `Pagination.onPageChange` / `GridBtn.setPageSize`              | page size는 GridBtn, 이동은 Pagination                                      |
| 38  | `undo` / `redo`                                   | `undo()` / `redo()`                                            | `enableUndoRedo: true` 시                                                   |
| 39  | `undoable` / `redoable`                           | `undoRedoChange` 이벤트의 `e.canUndo` / `e.canRedo`            | 이벤트로 통합                                                               |
| 40  | `clearUndoRedoStack`                              | (직접 메서드 없음)                                             | 컴포넌트 재마운트로 초기화                                                  |
| 41  | `exportToCsv`                                     | `exportToCsv(options?)`                                        | 동일 · `formatCellExportValue` (formatter·htmlContent strip 등)             |
| 42  | `exportToXlsx` / `exportToPdf`                    | `exportToExcel(options?)` · `exportToPdf(options?)`            | `exceljs`/`jspdf` peer · PDF `fontPath` · 화면 포맷 일부 반영               |
| 43  | `exportToJson` etc.                               | (미지원)                                                       | 앱에서 `getData()` + JSON.stringify                                         |
| 44  | `clearGridData`                                   | `clearData()`                                                  | 동일                                                                        |
| 45  | `setGridData` / `appendData` / `prependData`      | (직접 메서드 없음)                                             | `data` props 갱신                                                           |
| 46  | `create` / `destroy`                              | `destroy()` + React 언마운트                                   | Handle `destroy()` · `onDestroy` 콜백                                       |
| 47  | `refresh` / `update` / `resize`                   | `resize(w?, h?)`                                               | React 리렌더 자동 · 컨테이너 크기는 `resize` 또는 `height` 옵션             |
| 48  | `setProp` / `getProp`                             | `setProp(partialOptions)`                                      | `options` props 갱신과 병행 가능                                            |
| 49  | `bind` / `unbind`                                 | `bind(name, h)` / `unbind(name, h?)`                           | 동일. `bind`는 배열로 여러 이벤트 한 번에 등록 가능                         |
| 50  | `getFooterValueByDataField`                       | `getFooterValueByDataField(dataField, footerRowIndex?)`        | `footerData` + `operations` 계산 결과                                       |
| 51  | `getSubFooterValueByDataField`                    | `getSubFooterValueByDataField(dataField, subfooterIndex)`      | `options.subfooterData` 배열 인덱스                                         |
| 52  | (UI 일괄 초기화)                                  | `resetGrid(options?)`                                          | 필터·정렬·선택·체크·편집 등. `data` 복구는 부모 `setData`                   |
| 53  | `isEditedCell`                                    | `isEditedCell(rowId, dataField)`                               | `'I'` 전 필드 true · `'U'`만 `_original` 필드 비교                          |

### 20.2 이벤트 매핑표

| No  | AUI Grid 이벤트                 | DataGrid 구현                                     | 비고                                                                                       |
| --- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | `addColumn`                     | `addColumn` 이벤트                                | 동일                                                                                       |
| 2   | `addRow`                        | `addRow` 이벤트                                   | 동일                                                                                       |
| 3   | `addRowFinish`                  | `addRowFinish` 이벤트                             | 동일                                                                                       |
| 4   | `addTreeColumn`                 | `addTreeColumn` 이벤트                            | `treeOptions` 활성화 시                                                                    |
| 5   | `beforeInsertRow`               | `beforeInsertRow` 이벤트 (cancelable)             | 동일                                                                                       |
| 6   | `beforeRemoveColumn`            | `beforeRemoveColumn` 이벤트 (cancelable)          | 동일                                                                                       |
| 7   | `beforeRemoveRow`               | `beforeRemoveRow` 이벤트 (cancelable)             | 동일                                                                                       |
| 8   | `cellClick`                     | `cellClick` 이벤트                                | 동일. 차단이 필요하면 `beforeCellClick`(async, cancelable) 사용                            |
| 9   | `cellDoubleClick`               | `cellDoubleClick` 이벤트                          | 동일                                                                                       |
| 10  | `cellEditBegin`                 | `editingStart` 이벤트 (cancelable)                | 이름 다름                                                                                  |
| 11  | `cellEditCancel`                | `editingCancel` 이벤트                            | 이름 다름                                                                                  |
| 12  | `cellEditEnd`                   | `editingFinish` + `afterChange` 이벤트            | 분리 — 편집 종료(`editingFinish`)와 값 변경(`afterChange`)이 별개 이벤트                   |
| 13  | `cellEditEndBefore`             | `beforeChange` 이벤트 (cancelable)                | 이름 다름                                                                                  |
| 14  | `cellLongTap`                   | `cellLongTap` 이벤트                              | 동일 (롱탭)                                                                                |
| 15  | `columnStateChange`             | `columnStateChange` 이벤트                        | 동일                                                                                       |
| 16  | `contextMenu`                   | `contextMenu` 이벤트                              | 동일                                                                                       |
| 17  | `copyBegin`                     | `copy` 이벤트                                     | 이름 다름 (`copyBegin` → `copy`)                                                           |
| 18  | `copyEnd`                       | `copyEnd` 이벤트                                  | 동일                                                                                       |
| 19  | `dragBegin`                     | `dragBegin` 이벤트                                | `enableRowDragDrop` 활성화 시                                                              |
| 20  | `dropCancel`                    | `dropCancel` 이벤트                               | 드래그 후 ESC를 눌러 취소했을 때 발생                                                      |
| 21  | `dropEnd`                       | `dropEnd` 이벤트                                  | 동일                                                                                       |
| 22  | `dropEndBefore`                 | `dropEndBefore` 이벤트 (cancelable)               | 동일                                                                                       |
| 23  | `filtering`                     | `filtering` 이벤트                                | 동일                                                                                       |
| 24  | `footerClick`                   | `footerClick` 이벤트                              | `options.footerData` 지정 시                                                               |
| 25  | `footerDoubleClick`             | `footerDoubleClick` 이벤트                        | 동일                                                                                       |
| 26  | `grouping`                      | `grouping` 이벤트                                 | 동일                                                                                       |
| 27  | `headerClick`                   | `headerClick` 이벤트                              | 정렬 트리거와 별개로 헤더 클릭 자체를 수신                                                 |
| 28  | `hScrollChange`                 | `hScrollChange` 이벤트                            | 동일                                                                                       |
| 29  | `indent`                        | `indent` 이벤트                                   | 트리 모드 전용                                                                             |
| 30  | `keyDown`                       | `keyDown` 이벤트                                  | `keyCode`·modifier·`preventDefault()` 지원 — 차단 시 내부 내비 스킵                        |
| 31  | `notFound`                      | `notFound` 이벤트                                 | 필터 결과 0건일 때                                                                         |
| 32  | `outdent`                       | `outdent` 이벤트                                  | 트리 모드 전용                                                                             |
| 33  | `pageChange`                    | `Pagination`의 `onPageChange` 콜백                | Grid가 아닌 별도 `Pagination` 컴포넌트로 분리                                              |
| 34  | `pageRowCountChange`            | `GridBtn`의 `setPageSize`                         | page size UI는 GridBtn. Pagination은 페이지 이동만                                         |
| 35  | `pasteBegin`                    | `paste` 이벤트                                    | 이름 다름 (`pasteBegin` → `paste`)                                                         |
| 36  | `pasteEnd`                      | `pasteEnd` 이벤트                                 | 동일                                                                                       |
| 37  | `ready`                         | `ready` 이벤트 + `onReady(api)` props 콜백        | 콜백 prop과 이벤트 모두 지원                                                               |
| 38  | `removeColumn`                  | `removeColumn` 이벤트                             | 동일                                                                                       |
| 39  | `removeRow`                     | `removeRow` 이벤트                                | 동일. 호출 메서드는 `removeRows` / `removeCheckedRows` (단수형 메서드 없음)                |
| 40  | `rowAllCheckClick` (deprecated) | `checkAll` / `uncheckAll` 이벤트                  | AUI deprecated. 우리는 전체 체크/해제를 분리 이벤트로 발행                                 |
| 41  | `rowAllChkClick`                | `checkAll` / `uncheckAll` 이벤트                  | 분리 발행                                                                                  |
| 42  | `rowCheckClick`                 | `check` / `uncheck` 이벤트                        | 분리 발행                                                                                  |
| 43  | `rowNumCellClick`               | `rowNumCellClick` 이벤트                          | 동일                                                                                       |
| 44  | `rowNumHeaderClick`             | `rowNumHeaderClick` 이벤트                        | 동일                                                                                       |
| 45  | `rowStateCellClick`             | `rowStateCellClick` 이벤트                        | 행상태 컬럼 클릭 (`showRowStatus` 기본 `true`, 숨기려면 `false`)                           |
| 46  | `selectionChange`               | `selectionChange` 이벤트                          | 셀 범위 선택(`enableRangeSelection`) 포함 · key 모드 시 `source: 'selectedRowKey'`         |
| 46b | `selectedRowKeyChange`          | `selectedRowKeyChange` 이벤트                     | key 제어 마스터-디테일 — `row` `selectedRowKeyField` `selectedRowKeyValue`                 |
| 47  | `selectionConstraint`           | `options.selectionConstraint` 옵션 객체           | 이벤트가 아닌 옵션 — `mode` / `selectableColumns` / `isRowSelectable` / `maxSelections` 등 |
| 48  | `sorting`                       | `sorting` 이벤트                                  | 동일                                                                                       |
| 49  | `treeLazyRequest`               | `treeLazyRequest` 이벤트                          | `lazyLoadEmptyChildren: true` 시                                                           |
| 50  | `treeOpenChange`                | `treeExpanded` 옵션 + `onTreeExpandedChange` 콜백 | TanStack 표준 ExpandedState 모델 — 이벤트가 아닌 props 콜백                                |
| 51  | `undoRedoChange`                | `undoRedoChange` 이벤트                           | `enableUndoRedo: true` 시                                                                  |
| 52  | `updateRow`                     | `updateRows` 이벤트                               | 단수 이벤트 없음 — 단건도 배치 이벤트로 통합 (호출 메서드도 `updateRows([1개])`)           |
| 53  | `updateRows`                    | `updateRows` 이벤트                               | 동일                                                                                       |
| 54  | `vScrollChange`                 | `vScrollChange` 이벤트                            | 동일                                                                                       |
