# @vanta/common 공통 기능 가이드 (개발자)

업무 화면 개발 시 자주 사용하는 `@vanta/common` 기능을 정리한 가이드다. 인프라·부팅 설정은 제외하고 화면 개발에 바로 쓰이는 항목만 다룬다.

> 이관 히스토리·인프라 설정 등 전체 목록은 **@vanta/common 공통 기능 가이드 (운영자)** 를 참고한다.

---

# 1. UI 컴포넌트

## 1.1 페이지 공통 컴포넌트

화면의 골격을 구성하는 3개 컴포넌트. 모두 `@vanta/common`에서 `import` 한다. 화면 최상위 래퍼는 따로 두지 않고, 페이지 컴포넌트에서 `<>...</>` 또는 라우트 outlet 안에 바로 배치한다.

| 컴포넌트     | 용도                                                |
| ------------ | --------------------------------------------------- |
| `PageTitle`  | 제목 · 브레드크럼 · 액션 버튼 (저장/검색/삭제) 영역 |
| `PageTabs`   | 탭 전환 UI                                          |
| `PageSearch` | 검색 폼 영역 (조회/초기화 버튼 내장)                |

### PageTitle

페이지 제목과 브레드크럼, 우측 액션 버튼을 표시한다. 액션 버튼은 `actionButtonsProps`로 선언적으로 구성한다.

| prop                 | 타입                    | 필수 | 설명                                                   |
| -------------------- | ----------------------- | :--: | ------------------------------------------------------ |
| `title`              | `string`                |  ✅  | 페이지 제목                                            |
| `actionButtonsProps` | `PageTitleActionsProps` |      | 우측 액션 버튼 묶음. 아래 `PageTitleActions` 참고      |
| `breadcrumb`         | `string[]`              |      | 제목 우측 경로 표시. 미지정 시 메뉴 트리에서 자동 추출 |
| `tooltipContent`     | `string`                |      | 경로 옆 `?` 아이콘에 표시되는 툴팁 내용                |
| `isFavorite`         | `boolean`               |      | 즐겨찾기 활성 여부 (별 아이콘)                         |
| `onFavoriteClick`    | `() => unknown`         |      | 즐겨찾기 토글 콜백                                     |
| `children`           | `ReactNode`             |      | 제목 아래 보조 영역 (안내 문구, 보조 버튼 등)          |
| `className`          | `string`                |      | 추가 className                                         |

#### PageTitleActions (`actionButtonsProps`)

`PageTitle`의 우측 액션 영역. 콜백을 넣으면 해당 버튼이 자동 노출된다.

| prop              | 타입             | 설명                                                                      |
| ----------------- | ---------------- | ------------------------------------------------------------------------- |
| `onSearch`        | `() => unknown`  | 조회 버튼 — 검색 화면 기본                                                |
| `onSave`          | `() => unknown`  | 저장 버튼                                                                 |
| `onDelete`        | `() => unknown`  | 삭제 버튼 — 위험 색상 적용                                                |
| `onConfirm`       | `() => unknown`  | 확인 버튼 (모달·상세 화면 등)                                             |
| `onCancelConfirm` | `() => unknown`  | 취소(확인 다이얼로그 띄움) 버튼                                           |
| `extraButtons`    | `ExtraBtnType[]` | 표준 버튼 외 추가 버튼 — `{ label, onClick, icon?, variant?, disabled? }` |
| `className`       | `string`         | 추가 className                                                            |

### PageTabs

페이지 내 탭 전환 UI.

| prop        | 타입                               | 필수 | 설명                 |
| ----------- | ---------------------------------- | :--: | -------------------- |
| `items`     | `{ key: string; label: string }[]` |  ✅  | 탭 정의 목록         |
| `activeKey` | `string`                           |  ✅  | 현재 활성 탭의 `key` |
| `onChange`  | `(key: string) => void`            |  ✅  | 탭 변경 콜백         |
| `className` | `string`                           |      | 추가 className       |

`items`의 `key`는 제네릭으로 좁힐 수 있다 — `PageTabs<'list' | 'detail'>`.

### PageSearch

검색 폼 영역. 자식으로 폼 필드를 받고, **조회/초기화** 버튼은 내부에서 자동 렌더링된다.

| prop          | 타입                    | 필수 | 설명                                                                                                                                                   |
| ------------- | ----------------------- | :--: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `control`     | `Control<TFieldValues>` |  ✅  | react-hook-form의 `control`. `useForm()` 반환값                                                                                                        |
| `children`    | `ReactNode`             |  ✅  | 검색 필드 (`FormInput`, `FormSelect`, `FormDatePicker` 등)                                                                                             |
| `onSearch`    | `() => unknown`         |      | 조회 버튼 콜백. 지정 시 검색 영역 안에 조회 버튼이 노출됨. 권장: 조회 버튼은 `PageTitle.actionButtonsProps.onSearch`에 두고, `PageSearch`에는 미지정   |
| `onReset`     | `() => unknown`         |      | 초기화 버튼 동작. 미지정 시 `control._reset()` 자동 호출. 단순 reset 외 동작이 필요할 때만 지정                                                        |
| `fieldWidth`  | `string`                |      | 검색 영역 내부 form-field의 기본 width (CSS 길이 — `'220px'`, `'18rem'` 등). 기본 `220px`. 개별 필드는 `className`/`inputClassName`으로 덮어쓸 수 있음 |
| `fieldHeight` | `string`                |      | 검색 영역 내부 form-field의 기본 min-height. 기본 `36px`                                                                                               |
| `className`   | `string`                |      | 추가 className                                                                                                                                         |

> `PageSearch`는 더 이상 `isLoading` prop을 받지 않는다 (0.1.86부터 제거). 로딩 표시는 페이지 단위에서 `useQuery().isFetching`을 활용한다.

### 배치 예시 — 탭 + 검색 + 그리드 화면

```tsx
import { PageTitle, PageTabs, PageSearch } from '@vanta/common'

const TAB_ITEMS = [
  { key: 'list', label: '목록' },
  { key: 'detail', label: '상세' },
]

export default function SamplePage() {
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list')
  const { control, handleSubmit } = useForm({ defaultValues: { keyword: '' } })

  return (
    <>
      <PageTitle
        title="다국어 관리 (i18n)"
        actionButtonsProps={{
          onSave: () => void handleSave(),
          onSearch: () => void handleSubmit(handleSearch)(),
        }}
      />

      <PageTabs items={TAB_ITEMS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'list' && (
        <PageSearch control={control}>
          <FormInput control={control} name="keyword" label="키워드" />
        </PageSearch>
      )}

      {/* 본문 — 그리드·폼 등 화면 전용 컴포넌트로 분리 */}
      {activeTab === 'list' && <ListContent data={gridData} />}
      {activeTab === 'detail' && <DetailContent data={detailData} />}
    </>
  )
}
```

## 1.2 폼 컴포넌트

react-hook-form의 `control`을 받아 동작하는 폼 필드 컴포넌트. 모든 컴포넌트가 다음 공통 props를 받는다.

| 공통 prop     | 타입                      | 설명                                |
| ------------- | ------------------------- | ----------------------------------- |
| `control`     | `Control<TFieldValues>`   | react-hook-form `useForm().control` |
| `name`        | `FieldPath<TFieldValues>` | 필드 경로                           |
| `label`       | `string`                  | 필드 라벨                           |
| `description` | `string`                  | 보조 설명 텍스트                    |
| `className`   | `string`                  | 외부 래퍼 className                 |
| `required`    | `boolean`                 | 라벨 옆 `*` 표시 (Checkbox 제외)    |
| `disabled`    | `boolean`                 | 비활성화                            |
| `readOnly`    | `boolean`                 | 읽기 전용 (UI만 잠금, 폼 값은 유지) |

> 위 표는 모든 필드가 공유한다. 아래 컴포넌트별 표에서는 **고유 props만** 정리한다.

### readOnly (읽기 전용)

상세 조회·승인 대기 등 **값은 폼에 남기되 사용자 입력만 막을 때** `readOnly`를 쓴다. `disabled`와 RHF 동작이 다르다.

| 구분                      | `disabled`       | `readOnly`                                         |
| ------------------------- | ---------------- | -------------------------------------------------- |
| UI                        | 입력·클릭 불가   | 입력 잠금 (컴포넌트별 보조 UI 예외는 아래 표 참고) |
| `getValues()` / `watch()` | ✅ 값 유지       | ✅ 값 유지                                         |
| `setValue()` / `reset()`  | ✅ 가능          | ✅ 가능                                            |
| `handleSubmit` payload    | ❌ **필드 제외** | ✅ **필드 포함**                                   |

- RHF `Controller`에는 **`disabled`만** 전달한다. `readOnly`는 UI 잠금용이며 submit 제외에 쓰이지 않는다.
- 상세 API 응답을 `setValue`로 채운 뒤 `readOnly`로 보여 주면, 저장 API에 그대로 실을 수 있다.
- `options`·`items`에 **없는 value**를 `setValue`하면 Select·Autocomplete 등은 **라벨 없이 placeholder만** 보일 수 있다. 샘플 값과 옵션 목록을 맞출 것.

**지원 컴포넌트** (공통 `@vanta/common` Form 계열)

| 컴포넌트                                                               | 비고                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `FormInput`, `FormTextarea`, `FormNumberInput`                         | native `readOnly` + CSS                                                                                       |
| `FormSelect` (단일·멀티)                                               | 드롭다운·칩 제거 클릭 차단                                                                                    |
| `FormCheckbox`, `FormToggle`, `FormRadioGroup`, `FormRadioButtonGroup` | `onChange` 가드                                                                                               |
| `FormDatePicker`                                                       | 입력·달력 버튼 잠금                                                                                           |
| `FormTiptap`                                                           | 편집·툴바 비활성                                                                                              |
| `FormSearchLookup`, `FormSearchChips`                                  | 검색 input·Enter(`onKeyDown`) 잠금. 돋보기(`onSearchClick`)는 활성. `searchIconDisabled`로 아이콘만 별도 차단 |
| `FormAutocomplete`, `FormAutocompleteChips`                            | 드롭다운·칩 조작 차단                                                                                         |

```tsx
// 상세 조회 — API 로드 후 setValue, UI는 readOnly
useEffect(() => {
  if (!detail) return;
  reset({
    title: detail.title,
    city: detail.cityCode,
    agree: detail.agreed,
  });
}, [detail, reset]);

<FormInput control={control} name="title" label="제목" readOnly />
<FormSelect
  control={control}
  name="city"
  label="도시"
  options={CITY_OPTIONS}
  readOnly
/>
<FormCheckbox control={control} name="agree" label="동의" readOnly />

// submit 시 readOnly 필드도 payload에 포함됨
void handleSubmit((data) => saveMutation.mutate(data))();
```

> 샘플: admin `/samples/form/*` — 각 Form 샘플 페이지 하단 **「읽기 전용 (readOnly)」** 섹션에서 `데이터 세팅` / `데이터 조회` 버튼으로 `setValue`·`getValues`·submit 동작을 확인할 수 있다.

### FormInput

기본 `<input>`의 모든 속성을 그대로 전달할 수 있다 (`type`, `placeholder`, `maxLength`, `autoComplete` 등).

| 고유 prop         | 타입                            | 기본값 | 설명                                                             |
| ----------------- | ------------------------------- | ------ | ---------------------------------------------------------------- |
| `inputClassName`  | `string`                        |        | 내부 `<input>` 자체에 적용할 className                           |
| `startAdornment`  | `ReactNode`                     |        | 입력 좌측에 배치되는 아이콘/엘리먼트 (검색 아이콘 등)            |
| `showCount`       | `boolean`                       |        | `maxLength`와 함께 사용 시 입력 안쪽에 `현재 / 최대` 카운터 표시 |
| `textAlign`       | `'left' \| 'center' \| 'right'` | `left` | 입력 텍스트 정렬 (`FormNumberInput` 기본값은 `right`)            |
| `id`              | `string`                        | `name` | label과의 연결용 id                                              |
| (HTML input 속성) | -                               |        | `type`, `placeholder`, `maxLength`, `inputMode` 등 그대로        |

```tsx
<FormInput
  control={control}
  name="email"
  label="이메일"
  placeholder="user@vanta.com"
  type="email"
  required
/>

// textAlign — left(기본) · center · right
<FormInput
  control={control}
  name="code"
  label="코드"
  placeholder="코드를 입력해 주세요."
  textAlign="center"
/>
```

### FormNumberInput

숫자 전용 입력 필드. `FormInput`과 같이 **react-hook-form 필드 값은 항상 문자열**이다. 숫자·소수점·선행 `-`만 허용하고(문자·중간 `-` 등은 입력 시 제거), blur 시 콤마·trailing `.`를 제거한 정규화 문자열(예: `"1234.5"`, 빈값 `""`)을 RHF에 기록한다. **타입 변환은 submit 경계**에서 처리한다 — `validateForm`의 `{ type: 'number' }` + `zodResolver`를 쓰면 `handleSubmit` 성공 콜백의 `data`만 `number`가 되고, 스키마 없이 쓰면 API 직전까지 string으로 남는다.

| 고유 prop           | 타입                            | 기본값  | 설명                                                                  |
| ------------------- | ------------------------------- | ------- | --------------------------------------------------------------------- |
| `inputClassName`    | `string`                        |         | 내부 `<input>` className                                              |
| `id`                | `string`                        | `name`  | label 연결용 id                                                       |
| `maxIntegerDigits`  | `number`                        |         | 정수부 최대 자릿수                                                    |
| `maxDecimalDigits`  | `number`                        |         | 소수부 최대 자릿수                                                    |
| `maxLength`         | `number`                        |         | 전체 digit 상한 fallback (`-`·`.` 제외). HTML `maxLength` attr 미사용 |
| `thousandSeparator` | `boolean`                       | `true`  | blur·비포커스 시 천 단위 콤마 표시                                    |
| `textAlign`         | `'left' \| 'center' \| 'right'` | `right` | 입력 텍스트 정렬 (`FormInput` 기본값은 `left`)                        |
| (HTML input 속성)   | -                               |         | `placeholder`, `autoComplete` 등. `type`·`maxLength`는 고정 제외      |

**표시·저장 동작**

- **비포커스 / blur 후**: `thousandSeparator`가 `true`이면 천 단위 콤마 포맷 (예: `1,234,567`)
- **focus · 입력 중**: 콤마 없이 raw 표시 — 중간 위치 편집 시 커서가 튀지 않음
- **digit 제한**: `maxIntegerDigits` + `maxDecimalDigits`가 있으면 part limit 우선. `maxLength`만으로도 전체 digit 상한 설정 가능(둘 다 있으면 더 작은 쪽 적용)

**RHF vs submit 타입** (`validateForm` `{ type: 'number' }` + `zodResolver` 사용 시)

| 시점                                                      | `age` 예시 | `typeof age` |
| --------------------------------------------------------- | ---------- | ------------ |
| `getValues()` / `watch()` — **항상** (submit 성공 후에도) | `"25"`     | `"string"`   |
| `handleSubmit` **성공 콜백** `data` 인자만                | `25`       | `"number"`   |

- RHF 내부 상태는 submit 후에도 **string으로 유지**된다. `number`로 바뀌는 것은 `handleSubmit` 성공 콜백에 넘어오는 `data`뿐이다.
- `InferValidateForm` / `z.infer`는 **submit 결과** 기준이므로 TS 타입은 `number`이지만, **`getValues()` 런타임 값은 string**이다.
- 폼 안에서 `watch('amount') + 1` 같은 산술은 하지 말고, submit 후 `data`를 쓰거나 `Number(watch('amount'))`로 변환한다.
- `validateForm` 없이 쓰면 submit·`getValues` 모두 string — API 전송 전 `Number()` 등은 호출 측 책임.

```tsx
import { FormNumberInput, defineFormRules, validateForm } from '@vanta/common';
import { zodResolver } from '@hookform/resolvers/zod';

const rules = defineFormRules({
  age: { type: 'number', required: true, min: 1, max: 120 },
});
const schema = validateForm(rules);

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { age: undefined },
});

// validateForm { type: 'number' } 연동 — RHF에는 string, handleSubmit success data는 number
<FormNumberInput
  control={control}
  name="age"
  label="나이"
  required
  maxIntegerDigits={3}
  maxLength={3}
/>

// 정수·소수 자릿수 + maxLength fallback (thousandSeparator · textAlign right는 기본값)
<FormNumberInput
  control={control}
  name="unitPrice"
  label="단가"
  maxIntegerDigits={5}
  maxDecimalDigits={2}
  maxLength={7}
/>

// 콤마 미사용
<FormNumberInput
  control={control}
  name="quantity"
  label="수량"
  thousandSeparator={false}
/>
```

> 샘플: `/samples/form/sampleInputTextarea` — FormNumberInput 기본·textAlign·digit limit. `/samples/form/sampleFormValidation` — `validateForm` 연동.

### FormTextarea

멀티라인 입력. `<textarea>`의 모든 속성을 받는다.

| 고유 prop            | 타입     | 설명                                  |
| -------------------- | -------- | ------------------------------------- |
| `textareaClassName`  | `string` | 내부 `<textarea>` 자체에 적용         |
| (HTML textarea 속성) | -        | `rows`, `placeholder`, `maxLength` 등 |

### FormSelect

단일/멀티 셀렉트. `multiple: true`이면 멀티 셀렉트(검색·체크 기반)로 동작한다.

| 고유 prop           | 타입                 | 설명                                                               |
| ------------------- | -------------------- | ------------------------------------------------------------------ |
| `options`           | `FormSelectOption[]` | `{ value, label, disabled? }` 배열. **필수**                       |
| `placeholder`       | `string`             | 미선택 상태 placeholder                                            |
| `selectClassName`   | `string`             | 셀렉트 본체 className                                              |
| `id`                | `string`             | label 연결용 id                                                    |
| `multiple`          | `boolean`            | 멀티 셀렉트 모드. 폼 값은 `string[]`                               |
| `searchPlaceholder` | `string`             | 멀티 모드 전용 — 검색 입력 placeholder                             |
| (HTML select 속성)  | -                    | 단일 모드(`multiple !== true`)일 때만 native select 속성 추가 가능 |

```tsx
<FormSelect
  control={control}
  name="categories"
  label="카테고리"
  multiple
  options={categoryCodes.map((c) => ({ value: c.code, label: c.name }))}
  searchPlaceholder="검색"
/>
```

### FormCheckbox

| 고유 prop           | 타입     | 설명                           |
| ------------------- | -------- | ------------------------------ |
| `checkboxClassName` | `string` | 체크박스 자체 className        |
| `id`                | `string` | label 연결용 id                |
| (HTML input 속성)   | -        | `<input type="checkbox">` 속성 |

> `required`는 받지 않는다 (체크박스는 폼 스키마의 `mustBeTrue`로 검증).

### FormRadioGroup

| 고유 prop            | 타입                                                     | 설명                         |
| -------------------- | -------------------------------------------------------- | ---------------------------- |
| `options`            | `{ value: string; label: string; disabled?: boolean }[]` | 라디오 옵션 목록. **필수**   |
| `layout`             | `'horizontal' \| 'vertical'`                             | 정렬 방향. 기본 `horizontal` |
| (HTML fieldset 속성) | -                                                        | `name` 등 fieldset 속성      |

### FormDatePicker

날짜·기간 선택 컴포넌트. `mode`에 따라 폼 값 타입이 달라진다.

| 고유 prop                | 타입                                                                   | 설명                                                                            |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `mode`                   | `'year' \| 'month' \| 'date' \| 'time' \| 'monthRange' \| 'dateRange'` | **필수**. 단일 모드 → `string \| null`, range 모드 → `[string, string] \| null` |
| `inputClassName`         | `string`                                                               | 입력 박스 className                                                             |
| `id`                     | `string`                                                               | label 연결용 id                                                                 |
| `placeholder`            | `string`                                                               | 빈 입력 placeholder                                                             |
| `showRangePresets`       | `boolean`                                                              | 기간 모드 — **캘린더 패널** 하단 1년/6개월/1개월. 기본 `true` (오늘 기준 과거)  |
| `showInlineRangePresets` | `boolean`                                                              | 기간 모드 — **입력 오른쪽** 인라인 1년/6개월/1개월. 기본 `false` (시작일 기준)  |
| `emptyHint`              | `string`                                                               | 빈 값일 때 안내 문구. 미지정 시 i18n `datePicker.hint*` 사용                    |

#### showRangePresets / showInlineRangePresets

기간 모드(`monthRange` · `dateRange`)에서 빠른 선택 버튼 위치를 나눕니다.

| prop                     | 위치             | 기본    | 세팅 규칙                                  |
| ------------------------ | ---------------- | ------- | ------------------------------------------ |
| `showRangePresets`       | 캘린더 패널 안   | `true`  | 오늘(이번 달)을 **끝**으로 N 기간 **과거** |
| `showInlineRangePresets` | 기간 입력 오른쪽 | `false` | 시작일(없으면 오늘)부터 N 기간 **미래**    |

```tsx
{/* 기본: 캘린더 안에만 프리셋 (기존 동작) */}
<FormDatePicker control={control} name="dateRange" label="일 기간" mode="dateRange" />

{/* 입력 옆에도 프리셋 노출 */}
<FormDatePicker
  control={control}
  name="projectPeriod"
  label="프로젝트 기간"
  mode="dateRange"
  showInlineRangePresets
/>

{/* 캘린더 안 프리셋만 끄기 */}
<FormDatePicker
  control={control}
  name="period"
  mode="dateRange"
  showRangePresets={false}
/>

<FormDatePicker control={control} name="targetYear" label="연도" mode="year" />
```

> 샘플: `/samples/form/sampleDatePicker` — **showInlineRangePresets 활성화** 섹션

### FormTiptap

리치 텍스트 에디터. 내부적으로 Tiptap을 사용한다.

| 고유 prop     | 타입     | 설명                              |
| ------------- | -------- | --------------------------------- |
| `placeholder` | `string` | 에디터 placeholder                |
| `minHeight`   | `number` | 에디터 최소 높이 (px). 기본 200px |

### FormSearchLookup

돋보기 버튼으로 **외부 검색 팝업**을 열어 **단일 항목**을 선택하는 룩업 입력. 검색어 input과
(옵션) 읽기전용 결과 라벨 박스로 구성된다. 검색·팝업 오픈 로직은 소비처가 `onSearchClick`에서
담당한다(Autocomplete처럼 자체 드롭다운을 열지 않음). 검색어를 모두 지우면 선택 결과도 해제된다.
폼 값은 **두 필드**로 나뉜다 — `name`(선택 결과 `{ value, label }` \| `null`), `queryName`(검색어 문자열).

| 고유 prop                            | 타입          | 설명                                                               |
| ------------------------------------ | ------------- | ------------------------------------------------------------------ |
| `queryName`                          | `FieldPath`   | **필수**. 검색어(입력창 텍스트) 필드                               |
| `onSearchClick`                      | `() => void`  | 돋보기 클릭 핸들러(보통 검색 팝업 오픈)                            |
| `onKeyDown`                          | `(e) => void` | 검색어 input keydown(Enter 검색 트리거 등은 소비처가 판단)         |
| `searchIconDisabled`                 | `boolean`     | `true`면 돋보기 버튼만 비활성. Enter(`onKeyDown`) 팝업 검색은 유지 |
| `searchIconLabel`                    | `string`      | 돋보기 버튼 aria-label                                             |
| `showResultLabel`                    | `boolean`     | 결과 라벨 박스 노출. 기본 `true`                                   |
| `resultPlaceholder`                  | `string`      | 결과 박스 placeholder(값 없을 때)                                  |
| `placeholder`                        | `string`      | 검색어 input placeholder                                           |
| `maxLength`                          | `number`      | 검색어 input 최대 길이                                             |
| `inputClassName` / `resultClassName` | `string`      | 검색어 input / 결과 박스 className                                 |
| `inputProps`                         | `input 속성`  | 제어 관련 속성 제외한 나머지 `<input>` 속성                        |

```tsx
<FormSearchLookup
  control={control}
  name="vendor"        // 선택 결과 { value, label } | null
  queryName="vendorQuery" // 검색어 문자열
  label="거래처"
  placeholder="거래처 검색"
  onSearchClick={openVendorSearchModal}
/>

// readOnly — 직접 타이핑만 막고 팝업 검색은 허용
<FormSearchLookup
  control={control}
  name="vendor"
  queryName="vendorQuery"
  readOnly
  onSearchClick={openVendorSearchModal}
/>

// 검색 아이콘만 비활성 (input은 편집 가능)
<FormSearchLookup
  control={control}
  name="vendor"
  queryName="vendorQuery"
  searchIconDisabled
/>
```

### FormSearchChips

돋보기 버튼으로 **외부 검색 팝업**을 열어 **다중 선택**하고, 선택 항목을 칩으로 표시한다(칩 `X`로 개별 제거).
Autocomplete와 달리 자체 드롭다운 필터가 없고, 항목 추가는 소비처가 `onSearchClick` 팝업에서 처리한다.
폼 값은 `FormSearchChipItem[]` — **문자열 배열** 또는 `{ value }`(+extra) **객체 배열**을 모두 허용한다.

| 고유 prop            | 타입               | 설명                                                               |
| -------------------- | ------------------ | ------------------------------------------------------------------ |
| `onSearchClick`      | `() => void`       | 돋보기 클릭 핸들러(보통 검색 팝업 오픈)                            |
| `onKeyDown`          | `(e) => void`      | 검색어 input keydown                                               |
| `searchIconDisabled` | `boolean`          | `true`면 돋보기 버튼만 비활성. Enter(`onKeyDown`) 팝업 검색은 유지 |
| `getChipLabel`       | `(item) => string` | 칩 라벨 변환. 없으면 문자열/`item.value` 표시                      |
| `searchIconLabel`    | `string`           | 돋보기 버튼 aria-label                                             |
| `placeholder`        | `string`           | 검색어 input placeholder                                           |
| `inputClassName`     | `string`           | 검색어 input className                                             |
| `inputProps`         | `input 속성`       | 제어 관련 속성 제외한 나머지 `<input>` 속성                        |

```tsx
<FormSearchChips
  control={control}
  name="targets"       // string[] 또는 { value }[]
  label="대상"
  placeholder="대상 검색"
  onSearchClick={openTargetSearchModal}
  getChipLabel={(item) => labelMap[typeof item === 'string' ? item : item.value]}
/>

// readOnly — 직접 타이핑만 막고 팝업 검색은 허용. 칩 제거(X)는 비활성
<FormSearchChips
  control={control}
  name="targets"
  readOnly
  onSearchClick={openTargetSearchModal}
/>
```

> **선택 UI 비교**: `FormAutocomplete`/`…Chips`는 `items`를 받아 **자체 드롭다운**으로 필터·선택,
> `FormSearchLookup`/`…SearchChips`는 **돋보기 → 외부 팝업**(`onSearchClick`)으로 선택한다.

### FormAutocomplete

검색어 입력으로 목록을 필터링해 **단일 항목**을 선택하는 자동완성 입력. 폼 값은 선택 객체
`{ value, label }`(+ 필요 시 extra 필드) 또는 `null`이다. 입력값이 선택 라벨과 달라지거나 비면
선택이 해제(`null`)된다.

| 고유 prop             | 타입                              | 설명                                                  |
| --------------------- | --------------------------------- | ----------------------------------------------------- |
| `items`               | `FormAutocompleteValue<TExtra>[]` | 후보 목록 `{ value, label }`(+extra). **필수**        |
| `placeholder`         | `string`                          | 입력 placeholder                                      |
| `emptyText`           | `string`                          | 검색 결과 없음 문구. 기본 i18n `common.ui.msg.noData` |
| `maxLength`           | `number`                          | 입력 최대 길이                                        |
| `layout`              | `'horizontal' \| 'vertical'`      | 라벨·필드 정렬                                        |
| `modified`            | `boolean`                         | 수정 표시 스타일                                      |
| `getOptionLabel`      | `(item) => string`                | 목록·선택 표시 라벨 커스터마이즈                      |
| `getOptionSearchText` | `(item) => string \| string[]`    | 검색 매칭 대상 텍스트(라벨 외 필드로 검색)            |
| `renderOption`        | `(args) => ReactNode`             | 옵션 항목 커스텀 렌더(`highlight`, `select` 제공)     |
| `onSelect`            | `(item) => void`                  | 선택 콜백                                             |
| `ariaLabel`           | `string`                          | 접근성 라벨(미지정 시 `label`)                        |
| `inputProps`          | `input 속성`                      | 제어 관련 속성 제외한 나머지 `<input>` 속성           |

```tsx
<FormAutocomplete
  control={control}
  name="vendor"
  label="거래처"
  items={vendors.map((v) => ({ value: v.id, label: v.name }))}
  placeholder="거래처명 검색"
/>
```

### FormAutocompleteChips

검색 기반 **다중 선택**. 선택 항목을 칩(chip)으로 표시하고, 폭을 넘치면 `{개수} Others`(i18n `common.ui.label.others`)로 요약한다.
입력영역에 마우스를 올리면 선택 목록 팝업이 떠서 항목 클릭으로 개별 제거할 수 있다.
폼 값은 선택 객체 배열 `FormAutocompleteChipValue[]`(`{ value, label }`(+extra))이다.

| 고유 prop             | 타입                                  | 설명                                                                                  |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `items`               | `FormAutocompleteChipValue<TExtra>[]` | 후보 목록 `{ value, label }`(+extra). **필수**. 이미 선택된 항목은 후보에서 자동 제외 |
| `placeholder`         | `string`                              | 입력 placeholder                                                                      |
| `emptyText`           | `string`                              | 검색 결과 없음 문구. 기본 i18n `common.ui.msg.noData`                                 |
| `maxLength`           | `number`                              | 입력 최대 길이                                                                        |
| `layout`              | `'horizontal' \| 'vertical'`          | 라벨·필드 정렬                                                                        |
| `modified`            | `boolean`                             | 수정 표시 스타일                                                                      |
| `getOptionLabel`      | `(item) => string`                    | 목록 표시 라벨 커스터마이즈                                                           |
| `getOptionSearchText` | `(item) => string \| string[]`        | 검색 매칭 대상 텍스트                                                                 |
| `getChipLabel`        | `(item) => string`                    | 칩·선택 팝업 표시 라벨 커스터마이즈                                                   |
| `onSelect`            | `(item) => void`                      | 선택 콜백                                                                             |
| `inputProps`          | `input 속성`                          | 제어 관련 속성 제외한 나머지 `<input>` 속성                                           |

```tsx
<FormAutocompleteChips
  control={control}
  name="tags"
  label="태그"
  items={tags.map((t) => ({ value: t.code, label: t.name }))}
  placeholder="태그 검색"
/>
```

> `FormAutocomplete`·`FormAutocompleteChips` 모두 `control`·`name`·`label`·`description`·
> `required`·`id`·`className`·`disabled`·`readOnly`는 다른 Form 컴포넌트와 동일하게 받는다.

## 1.3 그리드 (DataGrid)

별도 가이드 참고: **DataGrid 사용 가이드**

## 1.4 페이지네이션 (Pagination + GridBtn)

서버·클라이언트 페이징 화면은 역할을 나눕니다.

| 컴포넌트     | 역할                                                          |
| ------------ | ------------------------------------------------------------- |
| `GridBtn`    | 총 건수, **page size 셀렉트** (`isPaging` + `setPageSize` 등) |
| `Pagination` | **페이지 번호·이동**만 (`<<` `<` 번호 `>` `>>`)               |

페이지 번호는 **0-base** (`PageRequest.page`, `pageResponse.page`).

### Pagination props

| prop           | 타입                     | 필수 | 설명                                                              |
| -------------- | ------------------------ | :--: | ----------------------------------------------------------------- |
| `pageResponse` | `PageResponseMeta`       |      | `{ page, size, totalElements, totalPages, hasNext, hasPrevious }` |
| `onPageChange` | `(page: number) => void` |  ✅  | 이동할 페이지 번호(0-base)                                        |

`onPageSizeChange`, `pageSizeOptions`는 **deprecated** — UI 없음. page size는 `GridBtn` 사용.

```tsx
import { DataGrid, GridBtn, Pagination } from '@vanta/common'

const [params, setParams] = useState({ page: 0, size: 20 })

;<>
  <GridBtn
    gridRef={gridRef}
    gridTitle="목록"
    gridBtn={{
      isPaging: true,
      totalCount: data?.totalElements,
      pageSize: params.size,
      setPageSize: (size) => setParams((p) => ({ ...p, size })),
      setCurrentPage: (page) => setParams((p) => ({ ...p, page })),
    }}
  />
  <DataGrid ref={gridRef} columns={columns} data={data?.content ?? []} />
  <Pagination pageResponse={data} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
</>
```

> size 변경 시 `GridBtn`이 `setCurrentPage(0)`을 호출합니다. 목록 재조회는 `useQuery`의 `page`/`size` 의존 또는 `fetchList` 등 **기존 패턴**을 유지하세요.

## 1.5 TableBtn (HTML table)

DataGrid 없이 일반 `<table>` 상단 버튼만 필요할 때 사용합니다. 행 CRUD·페이징·page size 없음.

| prop       | 타입             | 설명                          |
| ---------- | ---------------- | ----------------------------- |
| `title`    | `string`         | 표 제목 (선택)                |
| `buttons`  | `ExtraBtnType[]` | `GridBtn.extraButtons`와 동일 |
| `children` | `ReactNode`      | 버튼 앞 슬롯                  |

```tsx
import { TableBtn } from '@vanta/common';

<TableBtn title="목록" buttons={[{ label: '조회', onClick: handleSearch }]} />
<table>{/* ... */}</table>
```

구현: `src/components/common/table/TableBtn.tsx` (`@vanta/common`).

## 1.6 기본 UI

| 컴포넌트  | 용도                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `Button`  | 버튼 (`variant`: `primary` · `secondary` · `outline` · `danger` · `ghost`) |
| `Modal`   | 레이어 팝업                                                                |
| `Drawer`  | 우측 슬라이드 패널 (`useDrawerStore`로 오픈, X로만 닫힘)                   |
| `Badge`   | 상태 뱃지                                                                  |
| `Card`    | 카드 컨테이너                                                              |
| `Tooltip` | 툴팁                                                                       |
| `Empty`   | 데이터 없음 표시                                                           |
| `Spinner` | 로딩 스피너                                                                |

**Button**

```tsx
import { Button } from '@vanta/common';

// variant: 'primary'(기본) | 'secondary' | 'outline' | 'danger' | 'ghost'
// size: 'sm' | 'md'(기본) | 'lg'
<Button onClick={handleSave}>저장</Button>
<Button variant="outline" onClick={handleCancel}>취소</Button>
<Button variant="danger" onClick={handleDelete}>삭제</Button>

// loading 상태 — disabled + 스피너 자동 표시
<Button loading={isSubmitting}>저장</Button>

// 아이콘 포함
<Button icon={<PlusIcon />} variant="primary">추가</Button>
```

**Modal**

```tsx
import { Button, Modal } from '@vanta/common';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>열기</Button>

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title={t('user.editTitle')}
  size="md"           // 'sm' | 'md'(기본) | 'lg'
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
      <Button onClick={handleSubmit}>{t('common.save')}</Button>
    </>
  }
>
  {/* 모달 본문 */}
  <UserEditForm control={control} />
</Modal>
```

**Drawer (우측 슬라이드 패널)**

`Modal`처럼 JSX로 두는 게 아니라 **`useDrawerStore`로 직접 연다**(popup store와 동일 패턴). 동시 **1개만** 표시되고, **우측 상단 X로만 닫힌다**(딤 클릭·ESC로는 닫히지 않음). `App`에 `<DrawerHost />`가 한 번 마운트돼 있어 어디서 열든 거기로 렌더된다.

- **헤더(title + X)·푸터는 셸이 렌더**, 본문만 `content`(소비처가 넘긴 `DrawerXxx`)가 렌더한다.
- **추가 데이터는 store가 아니라 content의 props로** 넘긴다 (store에 data 필드 없음).
- `openDrawer` 옵션: `title?` · `footer?` · `width?`(기본 480px).

```tsx
import { Button, useDrawerStore } from '@vanta/common'

import DrawerProjectDetail from '@/components/samples/popup/DrawerProjectDetail'

function Foo() {
  const openDrawer = useDrawerStore((s) => s.openDrawer)
  const closeDrawer = useDrawerStore((s) => s.closeDrawer)

  const openProjectDrawer = () =>
    openDrawer(
      // 비즈니스 데이터는 content의 props로 전달 (예: projectId, onSaved 콜백)
      <DrawerProjectDetail projectId={123} />,
      {
        title: '프로젝트 상세', // 헤더(제목 + X)
        // 하단 고정 푸터
        footer: (
          <>
            <Button onClick={closeDrawer}>App 바로가기</Button>
            <Button onClick={closeDrawer}>워크플로우 바로가기</Button>
          </>
        ),
        width: 480,
      },
    )

  return (
    <Button variant="outline" onClick={openProjectDrawer}>
      열기
    </Button>
  )
}
```

```tsx
// content 컴포넌트(DrawerXxx)는 "본문"만 렌더한다 (title/footer는 위에서 셸이 처리).
type Props = { projectId: number }
export default function DrawerProjectDetail({ projectId }: Props) {
  // projectId로 조회/렌더 ...
  return <div>{/* 탭, 정보표 등 본문 */}</div>
}

// 닫기는 어디서든:
const closeDrawer = useDrawerStore((s) => s.closeDrawer)
closeDrawer()
```

---

# 2. 공통코드 조회 (useCodeStore)

공통코드는 앱 부팅 시 서버에서 한 번 캐싱된다. 화면에서는 별도 API 호출 없이 `useCodeStore`로 즉시 조회한다.

```tsx
import { EMPTY_CODE_LIST, useCodeStore } from '@vanta/common'

// 코드 목록 조회 (셀렉트 옵션 등)
const statusList = useCodeStore((s) => s.getCodeList('STATUS_CD'))

// 코드명 단건 조회 (그리드 표시명 등)
const statusName = useCodeStore((s) => s.getCodeName('STATUS_CD', row.statusCd))

// 조건 필터링
const activeRoles = useCodeStore((s) => s.getFilteredCodes('ROLE_CD', (item) => item.isActive))
```

> **`EMPTY_CODE_LIST` 사용 필수**: 셀렉터 기본값으로 인라인 `?? []`를 쓰면 매 렌더마다 새 배열 참조가 생겨 무한 리렌더를 유발한다.

```tsx
// ❌ 무한 리렌더 위험
const list = useCodeStore((s) => s.getCodeList('ROLE_CD')) ?? []

// ✅ 안전
const list = useCodeStore((s) => s.getCodeList('ROLE_CD')) ?? EMPTY_CODE_LIST
```

---

# 3. 라벨 / 메시지 조회

서버에서 관리하는 i18n 라벨은 로그인 후 자동으로 i18next에 주입된다. 컴포넌트에서는 `t()` 함수를 그대로 사용한다.

```tsx
const { t } = useTranslation()

t('common.confirm') // '확인'
t('common.cancel') // '취소'

// 보간 — {{변수명}}으로 값을 주입한다
// ko.json: "greeting": "안녕하세요, {{name}}님"
t('common.greeting', { name: '홍길동' }) // '안녕하세요, 홍길동님'

// ko.json: "itemCount": "총 {{count}}건"
t('common.itemCount', { count: 42 }) // '총 42건'
```

> `useTranslation`은 react-i18next의 auto-import로 명시적 import 없이 사용 가능하다.

---

# 4. Alert / 알림

컴포넌트 내부·외부 어디서든 `messageUtil`을 사용한다.

| 메서드               | 시그니처                                       | 설명                                                |
| -------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `showAlert`          | `(title, message, onOk?, options?)`            | 확인 버튼만 있는 알림 팝업                          |
| `showConfirm`        | `(title, message, onOk?, onCancel?, options?)` | 확인 / 취소 팝업                                    |
| `showMessage`        | `(message, options?)`                          | 색상 강조 인라인 팝업. `options.tone`으로 색상 지정 |
| `showAlertAutoClose` | `(title, message, onOk?, autoCloseMs?)`        | 지정 ms 후 자동 닫힘 알림 (기본 1000ms)             |
| `showValidation`     | `(fieldName, type?, onOk?)`                    | 폼 검증 실패 알림 (`'required'` · `'pattern'`)      |

> **`showMessage`의 `tone`**: 팝업 배경 색상을 결정한다. `'info'`(기본, 파랑) · `'success'`(초록) · `'error'`(빨강) · `'warning'`(노랑). `showAlert` / `showConfirm`에는 tone이 없다.

```tsx
import { messageUtil } from '@vanta/common'

const { t } = useTranslation()

// 알림
messageUtil.showAlert(t('common.info'), t('common.saveSuccess'))

// 확인 / 취소
messageUtil.showConfirm(t('common.delete'), t('common.deleteConfirm'), handleDelete)

// 보간 — i18n 키에 {{변수명}}을 넣으면 t()에서 값을 주입할 수 있다
// ko.json: "deleteItem": "{{name}}을(를) 삭제하시겠습니까?"
messageUtil.showConfirm(
  t('common.delete'),
  t('confirm.deleteItem', { name: row.userName }), // '홍길동을(를) 삭제하시겠습니까?'
  handleDelete,
)
// ko.json: "bulkDelete": "선택한 {{count}}건을 삭제하시겠습니까?"
messageUtil.showConfirm(
  t('common.delete'),
  t('confirm.bulkDelete', { count: checkedRows.length }), // '선택한 3건을 삭제하시겠습니까?'
  handleBulkDelete,
)

// 색상 강조 인라인 팝업
messageUtil.showMessage(t('common.saveSuccess'), { tone: 'success' })

// 자동 닫힘
messageUtil.showAlertAutoClose(t('common.info'), t('common.saveSuccess'))

// 폼 검증 실패
messageUtil.showValidation(t('field.email'), 'pattern') // '이메일 형식이 올바르지 않습니다.'
messageUtil.showValidation(t('field.name'), 'required') // '이름은 필수입니다.'
```

---

# 5. 폼 검증 (validateForm)

필드 규칙 객체를 넘기면 Zod 스키마를 자동 생성한다. 각 필드는 `type`으로 종류를 구분하는 discriminated union이다. 규칙 객체를 변수로 분리할 때는 `defineFormRules`로 감싸면 `as const` 없이도 타입 추론이 정확해진다.

**기본 검증 메시지**는 `common.validation.msg.*`이며, 필드 `label`을 `{{label}}`에 보간한다.  
`label`은 i18n 키(권장) 또는 리터럴. 필요하면 `messages`로 필드별 문구를 오버라이드한다.

```tsx
import { defineFormRules, showFormErrors, validateForm } from '@vanta/common'
import { zodResolver } from '@hookform/resolvers/zod'

const userFormRules = defineFormRules({
  name: {
    type: 'string',
    required: true,
    maxLength: 50,
    label: 'samples.form.validationLabelDisplayName', // i18n 키 → "{{label}}은(는) 필수…"
    messages: {
      // 선택 — 기본 common.validation.msg.required 대신 사용
      required: 'samples.form.validationMsgDisplayNameRequired',
    },
  },
  email: {
    type: 'string',
    required: true,
    email: true,
    label: 'common.settings.label.email',
  },
  age: { type: 'number', min: 0, max: 150, label: '나이' },
  agree: { type: 'boolean', mustBeTrue: true, label: '약관 동의' },
})

const schema = validateForm(userFormRules)

const { control, handleSubmit } = useForm({ resolver: zodResolver(schema) })

// UI label도 같은 키를 t()로 넘기면 화면·검증 문구가 일치
;<FormInput
  control={control}
  name="name"
  label={t(userFormRules.name.label!)}
  required={userFormRules.name.required}
/>

void handleSubmit(onSave, (errors) => showFormErrors(errors, userFormRules))()
```

| `type`      | 지원 옵션                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `'string'`  | `label`, `messages`, `required`, `email`, `phoneKR`, `optionalPhoneKR`, `minLength`, `maxLength`, `trim` |
| `'boolean'` | `label`, `messages`, `mustBeTrue`                                                                        |
| `'number'`  | `label`, `messages`, `required`, `min`, `max`                                                            |
| `'enum'`    | `label`, `messages`, `values` (필수), `required`                                                         |

| `messages` 키   | 기본 i18n 키 (`common.validation.msg.*`) |
| --------------- | ---------------------------------------- |
| `required`      | `required`                               |
| `maxLength`     | `maxLength`                              |
| `minLength`     | `minLength`                              |
| `email`         | `email`                                  |
| `phone`         | `phone`                                  |
| `numberInvalid` | `numberInvalid`                          |
| `mustAgree`     | `mustAgree`                              |

> 샘플: `/samples/form/sampleFormValidation` — `label` i18n + `messages.required` 오버라이드 예시.

---

# 6. 권한 체크 (useAuthorized, Authorized)

로그인 유저의 role과 program 권한을 기준으로 기능·컴포넌트 접근을 제한한다.  
role 계층: `USER` < `WORKSPACE_ADMIN` < `SUPER_ADMIN`

`useAuthorized()`는 인자 없이 호출하고, 반환된 객체의 메서드로 다양한 조건을 검사한다.

```tsx
import { useAuthorized, Authorized } from '@vanta/common'

// 훅 — 조건부 disabled
function ActionButtons() {
  const { hasMinRole, hasProgramCode } = useAuthorized()

  return (
    <>
      <Button disabled={!hasMinRole('WORKSPACE_ADMIN')}>수정</Button>
      <Button disabled={!hasMinRole('SUPER_ADMIN')}>삭제</Button>
      <Button disabled={!hasProgramCode('USER_ROLE_API_D')}>회원 삭제</Button>
    </>
  )
}

// Button permission prop — useAuthorized 결과를 allowed에 전달
function ActionButtonsWithPermission() {
  const { hasProgramCode, hasMinRole } = useAuthorized()

  return (
    <>
      {/* visible: 권한 없으면 버튼 자체가 사라짐 */}
      <Button permission={{ allowed: hasProgramCode('USER_ROLE_API_C'), type: 'visible' }}>
        등록
      </Button>
      {/* disabled: 권한 없으면 버튼 비활성화 (자리 유지) */}
      <Button permission={{ allowed: hasMinRole('WORKSPACE_ADMIN'), type: 'disabled' }}>
        수정
      </Button>
    </>
  )
}

// Authorized 컴포넌트 — 조건 불만족 시 fallback(또는 null) 렌더링
function AdminSection() {
  return (
    <Authorized programCode="USER_ROLE_API_C" fallback={<p>권한 없음</p>}>
      <SystemSettingsForm />
    </Authorized>
  )
}
```

`useAuthorized()` 반환 메서드:

| 메서드                           | 용도                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| `hasRole(role)`                  | 특정 role과 정확히 일치                                     |
| `hasMinRole(role)`               | 해당 role 이상 (`USER` < `WORKSPACE_ADMIN` < `SUPER_ADMIN`) |
| `hasProgramCode(code)`           | 단일 program code 보유 여부                                 |
| `hasAnyPermission(codes[])`      | code 목록 중 하나라도 보유                                  |
| `hasAllPermissions(codes[])`     | code 목록 전부 보유                                         |
| `hasProgramAccess(url, method?)` | URL+method 기준 접근 가능 여부                              |

`<Authorized>` props:

| prop                   | 용도                                                    |
| ---------------------- | ------------------------------------------------------- |
| `programCode`          | 단일 program code 보유 시 렌더링                        |
| `actionCode`           | 단일 program code 보유 시 렌더링 (`programCode`와 동일) |
| `permission`           | 단일 program code 보유 시 렌더링                        |
| `permissions` + `mode` | code 배열 (`mode: 'any' \| 'all'`, 기본 `any`)          |
| `fallback`             | 권한 미충족 시 대체 노드 (생략 시 null)                 |

---

# 7. 탭 (useTabStore)

대부분의 탭 동작은 메뉴 클릭 시 자동 처리된다. 직접 탭을 열거나 닫아야 하는 경우에만 사용한다.

```tsx
import { useTabStore } from '@vanta/common'

// 탭 직접 열기
const openInNewTab = useTabStore((s) => s.openInNewTab)
openInNewTab({ path: '/system/code', label: '코드 관리' })

// 탭 닫기
const removeTab = useTabStore((s) => s.removeTab)
removeTab(tabId)

// 현재 열린 탭 목록
const tabs = useTabStore((s) => s.tabs)
```

## 7.1 이동 시 파라미터 전달 (`openInNewTab`)

목록 행 클릭 등으로 **이미 열려 있는 메뉴와 다른 인스턴스**를 새 탭에 열 때 `openInNewTab`에 `path`·`label`과 함께 값을 넘깁니다.

| 구분           | 권장 용도                                                 | 호출                       | 수신 화면             |
| -------------- | --------------------------------------------------------- | -------------------------- | --------------------- |
| **쿼리스트링** | 단순 식별자(`id`, `code` 등), 북마크·URL 공유가 필요한 값 | `path`에 `?key=value` 포함 | `useSearchParams()`   |
| **`state`**    | 객체·배열 등 URL에 넣기 어려운 payload                    | `state` 옵션 (선택)        | `useLocation().state` |

> `path`는 **메뉴에 등록된 프로그램 경로**와 맞춥니다. 쿼리만 붙이면 동일 화면이라도 탭이 구분됩니다.

### 예시 1 — 쿼리스트링 (단순 `id`)

```tsx
// 목록 그리드 — 행 클릭 시 상세를 새 탭으로
import { useTabStore } from '@vanta/common'

const openInNewTab = useTabStore((s) => s.openInNewTab)

const handleRowOpen = (row: { id: number }) => {
  openInNewTab({
    path: `/project/projectDetail?id=${row.id}`,
    label: '프로젝트 상세',
  })
}
```

```tsx
// 상세 화면 — URL 쿼리에서 id 수신
import { useSearchParams } from 'react-router-dom'

const [searchParams] = useSearchParams()
const projectId = searchParams.get('id') // string | null
```

### 예시 2 — `history.state` (복합 payload)

```tsx
const openInNewTab = useTabStore((s) => s.openInNewTab)

openInNewTab({
  path: '/project/projectDetail',
  label: '프로젝트 상세',
  state: {
    id: row.id,
    cachedDisplayName: row.cachedDisplayName,
    from: 'projectList',
  },
})
```

```tsx
// 상세 화면 — location.state 수신 (타입은 화면별로 좁혀 사용)
import { useLocation } from 'react-router-dom'

type DetailState = {
  id?: number
  cachedDisplayName?: string
  from?: string
}

const location = useLocation()
const payload = location.state as DetailState | null
const projectId = payload?.id
```

- **단순 키 하나**는 쿼리가 낫습니다. **여러 필드·중첩 객체**는 `state`를 쓰세요.
- 수신 쪽은 `TabbedOutlet`이 탭별 라우트를 렌더하므로, 위와 같이 `useSearchParams` / `useLocation`을 쓰면 됩니다.
- 현재 활성 탭만 바꿀 때는 `replaceCurrentTabRoute({ path, label, state? })`를 사용합니다 (항상 새 탭을 추가하지 않음).

---

# 8. 유틸리티

## dateUtil

dayjs 기반 날짜 유틸. 모든 메서드는 `static`이며 `dateUtil.method(...)` 형태로 호출한다.

```tsx
import { dateUtil } from '@vanta/common'
```

| 메서드                                     | 반환       | 설명                                                             |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------- |
| `setDate(date, format)`                    | `string`   | 날짜를 지정 포맷 문자열로 출력                                   |
| `getToDay(format?)`                        | `string`   | 현재 시각을 포맷. 생략 시 ISO 8601                               |
| `getTodayYmd()`                            | `string`   | 오늘 날짜 `YYYY-MM-DD`                                           |
| `addDays(date, n, format?)`                | `string`   | n일 후 (음수면 이전), 포맷 문자열 반환                           |
| `addMonths(date, n, format?)`              | `string`   | n개월 후/전                                                      |
| `addYears(date, n, format?)`               | `string`   | n년 후/전                                                        |
| `subtractDays(date, n, format?)`           | `string`   | n일 전                                                           |
| `getDaysDifference(start, end)`            | `number`   | `end - start` 일 수                                              |
| `isBefore(from, to)` / `isAfter(from, to)` | `boolean`  | 시점 비교                                                        |
| `isSameOrBefore` / `isSameOrAfter`         | `boolean`  | 같거나 이전/이후                                                 |
| `isValid(date, type)`                      | `boolean`  | 엄격 모드 파싱 성공 여부 (예: `isValid('20260101', 'YYYYMMDD')`) |
| `getDayOfWeek(date)`                       | `string`   | 로케일 기준 요일 이름                                            |
| `getLastDayOfMonth(yearMonth)`             | `number`   | 해당 월의 마지막 일                                              |
| `calculateDateRangeList(start, end)`       | `string[]` | 시작·종료일 포함 일자 목록                                       |
| `changeTimeZone(time, from, to)`           | `string`   | 타임존 변환                                                      |
| `isLeapYear(year)`                         | `boolean`  | 윤년 여부                                                        |

```tsx
dateUtil.getTodayYmd() // '2026-04-28'
dateUtil.setDate(new Date(), 'YYYY-MM-DD HH:mm') // '2026-04-28 09:30'
dateUtil.addDays('2026-04-01', 7, 'YYYY-MM-DD') // '2026-04-08'
dateUtil.getDaysDifference('2026-04-01', '2026-04-24') // 23
dateUtil.isValid('20261301', 'YYYYMMDD') // false
dateUtil.getDayOfWeek('2026-04-28') // '화요일' (로케일에 따라)
```

## numberUtil

`Intl` 기반 숫자 포맷 유틸. 모든 메서드는 `static`.

```tsx
import { numberUtil } from '@vanta/common'
```

| 메서드                             | 반환     | 설명                                    |
| ---------------------------------- | -------- | --------------------------------------- |
| `formatNumber(value)`              | `string` | 천단위 콤마 (`1234567` → `'1,234,567'`) |
| `formatCurrency(value, currency?)` | `string` | 통화 포맷 (기본 `KRW` → `'₩1,234,567'`) |
| `formatPercent(value, decimals?)`  | `string` | 비율 표기 (`0.156` → `'15.6%'`)         |

```tsx
numberUtil.formatNumber(1234567) // '1,234,567'
numberUtil.formatCurrency(1234567) // '₩1,234,567'
numberUtil.formatPercent(0.156, 1) // '15.6%'
```

## stringUtil

```tsx
import { stringUtil } from '@vanta/common'
```

| 메서드                                                    | 반환      | 설명                                                                              |
| --------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `truncate(str, maxLength)`                                | `string`  | 최대 길이 초과 시 말줄임(`…`) 추가                                                |
| `capitalize(str)`                                         | `string`  | 첫 글자 대문자                                                                    |
| `toStr(value, dfVal)`                                     | `string`  | 문자열로 변환. `null`·`undefined`·문자열 `'null'`·`'undefined'` 이면 `dfVal` 반환 |
| `removeChar(str, removedChar)`                            | `string`  | 지정 문자를 전역 제거                                                             |
| `fixDate(str)`                                            | `string`  | `-` `/` `.` 제거 후 숫자만 남김 (YYYYMMDD 정리용)                                 |
| `toLower(str)` / `toUpper(str)`                           | `string`  | 대소문자 변환 (null이면 빈 문자열)                                                |
| `ltrim(str)` / `rtrim(str)`                               | `string`  | 앞/뒤 공백 제거                                                                   |
| `removeSpecChar(str)`                                     | `string`  | 기본 특수문자 패턴 제거                                                           |
| `removeSpecCharRegExr(str, regExp)`                       | `string`  | 정규식 매칭 부분 제거                                                             |
| `getByteLength(str)`                                      | `number`  | UTF-8 기준 대략적 바이트 길이                                                     |
| `replaceString(source, target, replacement, globalFlag?)` | `string`  | 치환 (전역 옵션 지원)                                                             |
| `parseBoolean(value)`                                     | `boolean` | `1`·`y`·`yes`·`true`(대소문자 무시)면 `true`                                      |
| `isOnlyWhitespace(text)`                                  | `boolean` | 공백만 있거나 빈 문자열                                                           |

```tsx
stringUtil.truncate('긴 문자열입니다', 5) // '긴 문자열…'
stringUtil.capitalize('hello world') // 'Hello world'
stringUtil.toStr(null, '-') // '-'
stringUtil.fixDate('2026-04-28') // '20260428'
stringUtil.parseBoolean('Y') // true
stringUtil.getByteLength('한글') // 6 (UTF-8 3바이트 × 2)
stringUtil.removeSpecChar('a!@b#$c') // 'abc'
```

## maskUtil

```tsx
import { maskUtil } from '@vanta/common'
```

| 메서드                        | 반환     | 설명                                                |
| ----------------------------- | -------- | --------------------------------------------------- |
| `maskEmail(email)`            | `string` | 이메일 로컬부 일부를 가리고 도메인은 유지           |
| `maskPhone(phone)`            | `string` | 전화번호 가운데 자리 마스킹 (숫자·하이픈 혼합 가능) |
| `maskWord(s?)`                | `string` | 첫 글자만 남기고 나머지를 `*`로 마스킹              |
| `maskEmailLocalLast3(email?)` | `string` | 이메일 로컬파트 끝 3자리만 `*` 처리                 |

```tsx
maskUtil.maskPhone('010-1234-5678') // '010-****-5678'
maskUtil.maskEmail('user@test.com') // 'u***@test.com'
maskUtil.maskWord('홍길동') // '홍**'
maskUtil.maskEmailLocalLast3('john.doe@ex.com') // 'john.***@ex.com'
```

> 주민번호·카드번호 마스킹은 현재 공통 유틸로 제공되지 않는다. 필요하면 공통 파트에 요청해 추가한다.

## validateUtil

문자열 패턴 검증 유틸. 모든 메서드 `boolean` 반환이며 빈 문자열·`null`·`undefined` 입력은 모두 `false`. 필수 여부 판단은 호출 측이 별도로 한다.

```tsx
import { validateUtil } from '@vanta/common'
```

| 메서드                     | 설명                                             |
| -------------------------- | ------------------------------------------------ |
| `isEmail(v)`               | 이메일 형식                                      |
| `isPhoneKR(v)`             | 휴대폰(국내). 하이픈 유무 모두 허용              |
| `isTelKR(v)`               | 일반전화(02 / 0[3-6]N / 070). 휴대폰 prefix 제외 |
| `isBizNo(v)`               | 사업자등록번호 (10자리 + 체크섬)                 |
| `isUrl(v)`                 | `http` / `https` URL                             |
| `isIPv4(v)`                | IPv4 주소                                        |
| `isAlpha(v)`               | 영문(대/소문자)만                                |
| `isNumeric(v)`             | 숫자만 (정수, 부호·소수점 불허)                  |
| `isHangul(v)`              | 완성형 한글만 (`가-힣`)                          |
| `isHangulWithJamo(v)`      | 한글 + 자모 (`ㄱ-ㅎ`, `ㅏ-ㅣ`) — IME 조합 허용   |
| `isAlphaNumeric(v)`        | 영문 + 숫자                                      |
| `isHangulAlpha(v)`         | 한글 + 영문                                      |
| `isHangulNumeric(v)`       | 한글 + 숫자                                      |
| `isHangulAlphaNumeric(v)`  | 한글 + 영문 + 숫자                               |
| `hasLength(v, min?, max?)` | 문자열 길이 범위                                 |
| `matches(v, regex)`        | 사용자 정의 정규식                               |

```tsx
validateUtil.isEmail('user@example.com') // true
validateUtil.isPhoneKR('010-1234-5678') // true
validateUtil.isBizNo('220-81-62517') // true (체크섬 일치)
validateUtil.isHangulAlpha('한글ABC') // true
validateUtil.isHangulAlphaNumeric('한글A12') // true
validateUtil.hasLength(pwd, 8, 20) // 8~20자 범위
validateUtil.matches('AB-12', /^[A-Z]{2}-\d{2}$/)
```

> 폼 검증을 zod 스키마로 묶고 싶다면 `formUtils.validateForm` (5. 폼 검증) 을 우선 사용한다. `validateUtil`은 grid 셀 `validation.fn`, 인라인 조건 분기 등 단발성 검증에 적합하다.

## 클립보드 / 파일 / 엑셀

```tsx
import { copyToClipboard, exportToExcel, importFromExcel, downloadBlob } from '@vanta/common'
```

| 함수                           | 설명                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `copyToClipboard(text)`        | 텍스트를 클립보드에 복사 (async)                             |
| `exportToExcel(rows, options)` | 배열 데이터를 엑셀 파일로 다운로드 (`fileName`, `sheetName`) |
| `importFromExcel(file)`        | 엑셀 파일을 객체 배열로 파싱 (async)                         |
| `downloadBlob(blob, fileName)` | Blob을 파일로 다운로드                                       |

```tsx
// 클립보드 복사
await copyToClipboard('복사할 텍스트')

// 엑셀 내보내기
exportToExcel(rows, { fileName: '사용자목록', sheetName: 'Sheet1' })

// 엑셀 가져오기 (파일 input change 핸들러 등)
const data = await importFromExcel(file) // { [key: string]: unknown }[]

// Blob 파일 다운로드 (API 응답 등)
downloadBlob(blob, '첨부파일.pdf')
```
