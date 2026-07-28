# 게시판(Board) 기능 구현 가이드

> Board 샘플(`api/board/`, `pages/samples/board/`)을 기반으로 동일 패턴의 새 기능을 만드는 방법. </br> </br>
> 기존 admin의 fe, be 파일을 참고하여 구현할 수 있다. </br> </br>
> 본 가이드에서는 기존 admin 도메인을 `{Domain}` / `{domain}` 형태로 표시한다.

---

## 1. 기능 개요

시스템별 게시글을 CRUD하며, **고정(pin)·숨김(hidden)·첨부파일·페이지네이션**을 지원하는 목록 + 모달 구조의 관리 화면.

---

## 2. 파일 구조

### Backend

```
api/{domain}/
├── controller/
│   └── {Domain}Controller.java
├── dto/
│   ├── {Domain}SummaryResponse.java     # 목록 응답
│   ├── {Domain}Response.java            # 상세 응답 (모달용)
│   ├── {Domain}AttachmentResponse.java  # 첨부파일 응답
│   ├── {Domain}SearchRequest.java       # 검색 파라미터
│   ├── Create{Domain}Request.java       # 등록 요청
│   ├── Update{Domain}Request.java       # 수정 요청
│   ├── SetPinRequest.java               # 고정/해제
│   ├── SetHiddenRequest.java            # 숨김/공개
│   ├── ReorderPinRequest.java           # 고정 순서 변경
│   └── Delete{Domain}PostsRequest.java  # 일괄 삭제
├── domain/
│   ├── {Domain}.java                    # INSERT용 POJO (JPA 엔티티 아님)
│   └── {Domain}ErrorCode.java
├── repository/
│   └── mapper/
│       └── {Domain}Mapper.java
└── service/
    ├── {Domain}QueryService.java
    └── {Domain}CommandService.java
```

- MyBatis XML: `resources/mybatis/mapper/{domain}/{Domain}Mapper.xml`
- 에러 메시지: `resources/messages.properties`, `messages_en.properties`
- DB 마이그레이션: `resources/db/migration/V{N}__{domain}_tables.sql`

### Frontend

```
pages/{domain}/{page}/
└── {Domain}List.tsx

components/{domain}/{page}/
├── {Domain}ListSearch.tsx
├── {Domain}ListContent.tsx
├── {Domain}PostModal.tsx                # 등록/조회/수정 모달 (첨부파일 포함)
├── {Domain}PinOrderModal.tsx            # 고정 순서 변경 모달
├── {domain}Grid.tsx
└── {domain}-validation-schema.ts

api/{path}/
├── {domain}.ts                          # 요청/응답 타입
└── {domain}-api.ts                      # HTTP 함수

query/{path}/
└── {domain}-query.ts                    # React Query 훅
```

---

## 3. 단계별 구현 순서

> 일반적인 CRUD 구현은 ADMIN의 샘플 코드를 그대로 사용하되,
> 도메인명만 교체한다.
> 이 섹션에서는 게시판 고유의 핵심 패턴만 설명한다.

### Backend

#### Step 1. 테이블 생성

```sql
CREATE TABLE {schema}.cm_{domain}_bas (
    id        bigint GENERATED ALWAYS AS IDENTITY
                  CONSTRAINT pk_cm_{domain}_bas PRIMARY KEY,
    sys_id    bigint       NOT NULL,
    title     varchar(255) NOT NULL,
    content   text         NOT NULL,
    is_pinned boolean      NOT NULL DEFAULT false,
    pin_order int,
    is_hidden boolean      NOT NULL DEFAULT false,
    regr_id   bigint,
    updr_id   bigint,
    reg_dtm   timestamptz  NOT NULL DEFAULT now(),
    upd_dtm   timestamptz  NOT NULL DEFAULT now(),
    del_dtm   timestamptz,
    -- cm_system_bas, cm_user_bas 는 각 시스템 스키마가 아닌 padmin 스키마 테이블이다.
    -- 시스템 스키마에서 참조할 때는 반드시 padmin. prefix를 붙인다.
    CONSTRAINT {domain}_system_fk FOREIGN KEY (sys_id)  REFERENCES padmin.cm_system_bas(id) ON DELETE CASCADE,
    CONSTRAINT {domain}_regr_fk   FOREIGN KEY (regr_id) REFERENCES padmin.cm_user_bas(id)   ON DELETE SET NULL,
    CONSTRAINT {domain}_updr_fk   FOREIGN KEY (updr_id) REFERENCES padmin.cm_user_bas(id)   ON DELETE SET NULL
);

-- 시스템별 고정 pin_order 중복 방지
-- is_pinned = true 조건으로 좁혀야 soft-delete 행과 충돌하지 않음
CREATE UNIQUE INDEX uk_cm_{domain}_bas_01 ON {schema}.cm_{domain}_bas (sys_id, pin_order)
    WHERE del_dtm IS NULL AND is_pinned = true;
-- 시스템별 목록 조회: 고정 우선 + 작성일 정렬
CREATE INDEX ix_cm_{domain}_bas_01 ON {schema}.cm_{domain}_bas (sys_id, is_pinned, pin_order, reg_dtm);
CREATE INDEX ix_cm_{domain}_bas_02 ON {schema}.cm_{domain}_bas (del_dtm);

-- 중략 (COMMENT ON TABLE / COLUMN)

CREATE TRIGGER tr_cm_{domain}_bas_upd_dtm BEFORE UPDATE ON {schema}.cm_{domain}_bas
    FOR EACH ROW EXECUTE FUNCTION {schema}.fc_cm_set_upd_dtm();
```

#### Step 2. DTO 작성

일반 CRUD DTO(`Create`, `Update`, `Summary/Detail Response`)는 생략.
아래는 게시판에서 추가로 필요한 DTO들이다.

**목록 응답 — 핀 관련 필드 포함**

`SummaryResponse`에 `isPinned`, `pinOrder`, `attachmentCount`를 포함해야 한다.
`content`는 목록에 불필요하므로 제외한다 (상세 API를 별도로 둔다).

```java
public record {Domain}SummaryResponse(
    Long id,
    Long systemId,
    String title,
    boolean isPinned,
    Integer pinOrder,
    boolean isHidden,
    int attachmentCount,  // 목록에서 첨부 여부 표시용
    Long regrId,
    String regrNm,
    String regDtm
) {}
```

**고정/숨김/순서 변경/삭제 전용 DTO**

```java
public record SetPinRequest(@NotNull Boolean pinned) {}

public record SetHiddenRequest(@NotEmpty List<Long> postIds, @NotNull Boolean hidden) {}

// 중첩 record — items 안에 PinOrderItem 목록
public record ReorderPinRequest(@NotEmpty @Valid List<PinOrderItem> items) {
    public record PinOrderItem(@NotNull Long id, @NotNull Integer pinOrder) {}
}

public record Delete{Domain}PostsRequest(@NotEmpty List<Long> postIds) {}

// 검색 조건 — includeHidden으로 숨김 게시글 포함 여부 제어
public record {Domain}SearchRequest(String keyword, Boolean includeHidden) {}
```

**ErrorCode — 게시판 전용 에러 4종**

```java
public enum {Domain}ErrorCode implements ErrorCode {
    POST_NOT_FOUND  ("AD{NNNN}", 404, "{domain}.error.not_found"),
    NOT_AUTHOR      ("AD{NNNN}", 403, "{domain}.error.not_author"),   // 작성자 아님
    PIN_LIMIT       ("AD{NNNN}", 409, "{domain}.error.pin_limit"),    // 고정 3개 초과
    POST_NOT_PINNED ("AD{NNNN}", 400, "{domain}.error.not_pinned");   // 고정 아닌 글 순서변경 시도

    // 중략 (code, status, messageKey 필드 및 생성자, getter 구현)
}
```

> `messages.properties` / `messages_en.properties` 에 반드시 messageKey를 등록한다. 누락 시 에러 응답에 key 문자열이 그대로 노출된다.

**Domain POJO — `FILE_TARGET_TYPE` 상수**

첨부파일은 공용 `cm_file_meta` 테이블을 사용한다. 도메인 클래스에 `FILE_TARGET_TYPE` 상수를 선언해 사용한다. \***\*해당 값은 FE와 BE 모두 반드시 동일해야 한다.\*\***

```java
public class {Domain} {
    /** 공용 파일 API 연결용. FE의 {DOMAIN_UPPER}_FILE_TARGET_TYPE 과 동일해야 한다. */
    public static final String FILE_TARGET_TYPE = "{DOMAIN_UPPER}";

    // 중략 (필드, forCreate() 팩토리)
}
```

#### Step 3. Mapper — 고정 기능 전용 메서드

표준 CRUD 메서드 외에 아래 4개가 핀 기능에 필요하다.

```java
/** 현재 고정 수 — MAX_PINNED 상한 체크용 */
long countPinned(@Param("sysId") Long sysId);

/** 현재 최대 pinOrder — 새 고정 시 마지막 순서 계산용 */
Integer selectMaxPinOrder(@Param("sysId") Long sysId);

/** 고정/해제 — pinOrder는 해제 시 null */
int updatePin(@Param("id") Long id, @Param("sysId") Long sysId,
              @Param("isPinned") boolean isPinned, @Param("pinOrder") Integer pinOrder,
              @Param("updrId") Long updrId);

/** 순서만 변경 — 음수 임시값 패턴에서 두 번 호출된다 */
int updatePinOrder(@Param("id") Long id, @Param("sysId") Long sysId,
                   @Param("pinOrder") Integer pinOrder, @Param("updrId") Long updrId);
```

**첨부파일 조회 — `cm_file_meta` 조인**

```java
/** targetType + targetId 로 공용 파일 테이블에서 조회 */
List<{Domain}AttachmentResponse> selectAttachments(
    @Param("targetType") String targetType,
    @Param("targetId") Long targetId);
```

MyBatis XML 핵심:

```xml
<!-- includeHidden 미적용 시 숨김 게시글 제외 -->
<if test="!includeHidden">AND is_hidden = false</if>

<!-- cm_file_meta, cm_user_bas 는 padmin 스키마 테이블이다 -->
LEFT JOIN padmin.cm_user_bas u ON u.id = b.regr_id AND u.del_dtm IS NULL

SELECT ... FROM padmin.cm_file_meta
WHERE target_type = #{targetType} AND target_id = #{targetId}
```

#### Step 4. QueryService

`listAttachments`는 첨부파일을 가져오기 전에 해당 게시글이 이 시스템 소속인지 먼저 검증한다.
검증 없이 `targetId`만으로 조회하면 다른 시스템의 첨부파일에 접근할 수 있다.

```java
public List<{Domain}AttachmentResponse> listAttachments(Long systemId, Long id) {
    getPost(systemId, id); // 소속 시스템 검증 (없으면 POST_NOT_FOUND)
    return mapper.selectAttachments({Domain}.FILE_TARGET_TYPE, id);
}
```

#### Step 5. CommandService — 핵심 로직 3가지

**① 고정/해제 (`setPin`) — MAX_PINNED 상한 검증**

```java
private static final int MAX_PINNED = 3;

public void setPin(Long systemId, Long id, boolean pinned) {
    {Domain}Response post = requireDetail(systemId, id);
    if (pinned) {
        if (post.isPinned()) return; // 이미 고정이면 무시
        if (mapper.countPinned(systemId) >= MAX_PINNED) {
            throw new BusinessException({Domain}ErrorCode.PIN_LIMIT); // → FE에 409 반환
        }
        int nextOrder = Optional.ofNullable(mapper.selectMaxPinOrder(systemId)).orElse(0) + 1;
        mapper.updatePin(id, systemId, true, nextOrder, AuthContext.getUserId());
    } else {
        mapper.updatePin(id, systemId, false, null, AuthContext.getUserId()); // pinOrder null로 초기화
    }
}
```

**② 고정 순서 변경 (`reorderPins`) — 음수 임시값 2단계 패턴**

`(sys_id, pin_order)` 부분 유니크 인덱스 때문에 직접 UPDATE하면 중간 상태에서 충돌이 난다.
예: 1→2, 2→1 교환 시 먼저 1→2로 바꾸는 순간 2번이 두 개가 돼서 충돌.

해결: 1차로 음수 임시값(-1, -2, ...)으로 이동한 뒤, 2차로 확정값으로 이동한다.

```java
public void reorderPins(Long systemId, List<ReorderPinRequest.PinOrderItem> items) {
    Long updrId = AuthContext.getUserId();
    // 유효성 검증: 모두 고정 상태인지 확인
    for (var item : items) {
        if (!requireDetail(systemId, item.id()).isPinned())
            throw new BusinessException({Domain}ErrorCode.POST_NOT_PINNED);
    }
    // 1차: 음수 임시값 (인덱스 충돌 없음)
    for (int i = 0; i < items.size(); i++) {
        mapper.updatePinOrder(items.get(i).id(), systemId, -(i + 1), updrId);
    }
    // 2차: 확정 값
    for (var item : items) {
        mapper.updatePinOrder(item.id(), systemId, item.pinOrder(), updrId);
    }
}
```

**③ 수정 (`update`) — 작성자 검증**

```java
public void update(Long systemId, Long id, Update{Domain}Request req) {
    {Domain}Response existing = requireDetail(systemId, id);
    if (!AuthContext.getUserId().equals(existing.regrId())) {
        throw new BusinessException({Domain}ErrorCode.NOT_AUTHOR); // → FE에 403 반환
    }
    // 중략 (mapper.update 호출)
}
```

#### Step 6. Controller — 게시판 전용 엔드포인트

표준 CRUD 외에 아래 3개가 추가된다.

```java
// 고정/해제 — PATCH (부분 변경)
@PatchMapping("/{id}/pin")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void setPin(@PathVariable Long id, @Valid @RequestBody SetPinRequest req) {
    commandService.setPin(WorkspaceContext.getOrThrowSystemId(), id, req.pinned());
}

// 고정 순서 변경 — PUT (전체 교체)
@PutMapping("/pins/order")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void reorderPins(@Valid @RequestBody ReorderPinRequest req) {
    commandService.reorderPins(WorkspaceContext.getOrThrowSystemId(), req.items());
}

// 숨김/공개 — PATCH (복수 대상)
@PatchMapping("/visibility")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void setHidden(@Valid @RequestBody SetHiddenRequest req) {
    commandService.setHidden(WorkspaceContext.getOrThrowSystemId(), req.postIds(), req.hidden());
}
```

> 모든 엔드포인트에 `WorkspaceContext.getOrThrowSystemId()`를 호출한다. 누락 시 시스템 격리가 깨진다.

---

### Frontend

#### Step 1. 타입 정의 (`api/{domain}.ts`)

`SummaryResponse`에 핀 관련 필드와 `attachmentCount`를 포함한다.
`regrId`는 모달에서 작성자 검증에 사용한다.

```ts
export type {Domain}SummaryResponse = {
  // 중략 (id, systemId, title, isHidden, regrNm, regDtm 등 일반 필드)
  isPinned: boolean;
  pinOrder: number | null;
  attachmentCount: number;
  regrId: number | null;   // 작성자 검증용
};

export type {Domain}Response = {
  // 중략 (일반 필드)
  isPinned: boolean;
  regrId: number | null;   // 작성자 검증용
};

export type {Domain}AttachmentResponse = {
  id: number; fileKey: string; originalName: string; fileSize: number; fileExtension: string;
};

/** PUT /pins/order payload 단위 */
export type PinOrderItem = { id: number; pinOrder: number };
```

#### Step 2. API 함수 (`api/{domain}-api.ts`)

표준 CRUD 함수 외에 아래가 추가된다.

**첨부파일 — 공용 파일 API 연결**

BE의 `FILE_TARGET_TYPE`과 동일한 값을 FE에도 상수로 선언한다. 이 값이 다르면 첨부파일 조회가 안 된다.

```ts
/** BE {Domain}.FILE_TARGET_TYPE 과 반드시 동일해야 한다 */
export const {DOMAIN_UPPER}_FILE_TARGET_TYPE = '{DOMAIN_UPPER}';

const FILE_API_BASE = import.meta.env.VITE_FILE_API_BASE_URL as string | undefined;
const FILE_API_PATH = FILE_API_BASE ? `${FILE_API_BASE}/api/v1/files` : '/files';

/** 반드시 게시글 저장(POST) 후 id를 얻은 다음에 호출한다 */
export async function upload{Domain}Attachment(systemId: number, postId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  await http.post(`${FILE_API_PATH}/${systemId}/upload`, formData, {
    params: { directory: '{domain}', targetType: {DOMAIN_UPPER}_FILE_TARGET_TYPE, targetId: postId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
```

**고정/숨김 API**

```ts
/** 고정 시 시스템당 3개 초과하면 BE가 409 반환 */
export async function set{Domain}Pin(id: number, pinned: boolean) {
  await http.patch(`${BASE}/${id}/pin`, { pinned });
}

export async function reorder{Domain}Pins(items: PinOrderItem[]) {
  await http.put(`${BASE}/pins/order`, { items });
}

export async function set{Domain}Hidden(postIds: number[], hidden: boolean) {
  await http.patch(`${BASE}/visibility`, { postIds, hidden });
}
```

#### Step 3. Query 훅 (`query/{domain}-query.ts`)

**`enabled` 조건 — null 체크 필수**

`id`가 `null`이면 쿼리를 실행하지 않는다. 없으면 신규 모달에서 불필요한 API가 호출된다.

```ts
export function use{Domain}PostQuery(id: number | null) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => get{Domain}Post(id as number),
    enabled: id != null && id > 0,  // null 또는 0이면 실행 안 함
  });
}
```

**`searchRevision` — query key에만 포함**

동일 조건 재조회를 강제하는 카운터다. queryFn(API 파라미터)에는 포함하지 않는다.

```ts
export function use{Domain}PostsQuery(
  systemId: number | null,
  params: List{Domain}Params,
  revision?: number,          // query key 전용
) {
  return useQuery({
    queryKey: [KEY, 'list', systemId, params, revision],  // revision이 바뀌면 재조회
    queryFn: () => list{Domain}Posts(params),             // params에는 revision 없음
    enabled: systemId != null && systemId > 0,
  });
}
```

#### Step 4. Zod 스키마 (`{domain}-validation-schema.ts`)

**`includeHidden` — boolean이 아닌 enum string**

`FormSelect`에서 value가 문자열로 바인딩되므로 `'true'` / `'false'` enum으로 정의한다.

```ts
export const {domain}SearchFormSchema = validateForm(
  defineFormRules({
    keyword:       { type: 'string' },
    includeHidden: { type: 'enum', values: ['true', 'false'] },
  }),
);
```

**Tiptap 내용 유효성 검사**

리치에디터는 내용이 없어도 `<p></p>` 같은 빈 HTML이 들어오기 때문에 커스텀 refine이 필요하다.

```ts
function tiptapHasVisibleText(html: string): boolean {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim().length > 0;
}

export const {domain}PostFormSchema = z.object({
  title:   z.string().min(1, 'common.validation.required'),
  content: z.string().refine(tiptapHasVisibleText, { message: 'common.validation.required' }),
});
```

#### Step 5. 그리드 컬럼 (`{domain}Grid.tsx`) — `boldCell` 패턴

고정 게시글 행은 모든 컬럼 텍스트를 굵게 표시한다.
셀마다 조건을 반복하지 않고, 포맷 함수를 감싸는 `boldCell` 래퍼를 만들어 재사용한다.

```ts
function pinnedClass(row: CellRendererProps<{Domain}SummaryResponse>['row']) {
  return row.original.isPinned ? 'font-bold' : undefined;
}

/** 포맷 함수를 인자로 받아 고정 상태에 따라 bold 처리 */
function boldCell(format: (value: unknown) => string) {
  return function BoldCell({ value, row }: CellRendererProps<{Domain}SummaryResponse>) {
    return <span className={pinnedClass(row)}>{format(value)}</span>;
  };
}

// 사용: 모든 컬럼에 boldCell로 감싼다
{ name: 'title', cellRenderer: boldCell((v) => String(v ?? '')) }
{ name: 'regDtm', cellRenderer: boldCell(formatDate) }
```

#### Step 6. `{Domain}ListContent.tsx` — 핀·숨김·searchRevision

**`searchRevision` — 그리드 `key` prop 필수**

`key`가 바뀌면 그리드 인스턴스가 재생성되어 체크 상태도 리셋된다.

```tsx
<DataGrid
  key={`{domain}-${searchRevision}`} // searchRevision 변경 시 그리드 재생성
  ref={gridRef}
  data={posts}
  // ...
/>
```

**`pinnedPosts` — 고정 모달에 전달할 파생 상태**

```ts
const pinnedPosts = useMemo(() => posts.filter((p) => p.isPinned), [posts]);
```

#### Step 7. `{Domain}PinOrderModal.tsx`

저장 시 현재 배열 순서를 `pinOrder: idx + 1`로 변환해서 전송한다.

```ts
const handleSave = () => {
  const payload = items.map((post, idx) => ({ id: post.id, pinOrder: idx + 1 }));
  reorderMutation.mutate(payload, {
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });
};
```

#### Step 8. `{Domain}PostModal.tsx` — 모달 분리 + 첨부파일 순서

**외부 래퍼 + 내부 Body 분리 이유**

`key={postId ?? 'new'}`로 신규/수정 전환 시 내부 Body를 완전히 재생성한다.
하나로 합치면 `reset()` 타이밍 버그가 발생한다.

```tsx
// 외부 래퍼 — 데이터 로딩만 담당
export default function {Domain}PostModal({ open, postId, onClose, onSaved }) {
  const isCreate = postId == null;
  const { data: detail } = use{Domain}PostQuery(open && !isCreate ? postId : null);
  const ready = isCreate || detail != null;

  return (
    <Modal open={open} onClose={onClose} ...>
      {ready && (
        <{Domain}PostModalBody
          key={postId ?? 'new'}  // 신규↔수정 전환 시 Body 완전 재생성
          postId={postId}
          detail={detail ?? null}
          // 중략
        />
      )}
    </Modal>
  );
}
```

**작성자 검증 — `regrId === currentUserId`**

```ts
// 내부 Body
const currentUserId = useAuthStore((s) => s.user?.id);
const editable = isCreate || (detail?.regrId != null && detail.regrId === currentUserId);
// editable이 false이면 폼을 disabled 처리하고 저장 버튼을 숨긴다
```

**첨부파일 업로드 순서 — 게시글 저장 후**

첨부파일은 게시글 `id`가 있어야 `targetId`로 연결할 수 있다.
신규 등록 시 게시글을 먼저 저장하고 반환된 `id`로 업로드한다.

```ts
const handleSave = handleSubmit(async (values) => {
  // 중략 (변경 없음 체크, 저장 confirm 등)

  let targetId = postId;

  if (isCreate) {
    const created = await create{Domain}Post({ title: values.title, content: values.content });
    targetId = created?.id ?? null;  // 생성된 id를 업로드에 사용
  } else {
    await update{Domain}Post(postId, { title: values.title, content: values.content });
  }

  // 반드시 게시글 저장 완료 후 업로드
  if (targetId != null && files.length > 0) {
    for (const file of files) {
      await upload{Domain}Attachment(systemId, targetId, file);
    }
  }

  // 중략 (invalidate, onSaved, onClose 등)
});
```

**파일 추가 시 기존 첨부 수와 합산해서 MAX_FILES 체크**

```ts
if (merged.length + attachments.length >= MAX_FILES) {
  // attachments = 이미 저장된 파일, merged = 이번에 추가된 파일
  break;
}
```

#### Step 9. 페이지 (`pages/.../{Domain}List.tsx`) — `searchRevision` 패턴

동일 조건으로 조회 버튼을 다시 누를 때 query key가 바뀌지 않으면 재조회가 안 된다.
`searchRevision`을 `+1`해서 강제로 key를 변경한다.

```ts
// 중략 (useForm, appliedSearch state 등)

const [searchRevision, setSearchRevision] = useState(0);

const handleSearch = handleSubmit((values) => {
  setAppliedSearch({ keyword: values.keyword.trim(), includeHidden: values.includeHidden });
  setSearchRevision((n) => n + 1); // 같은 조건이어도 재조회 강제
});

// 중략 (PageTitle, PageSearch, ListContent 렌더)
```

`searchRevision`은 페이지에서 `ListContent`로 prop으로 내리고, `ListContent`가 query hook과 DataGrid `key`에 사용한다.

#### Step 10. i18n

`src/i18n/locales/ko/{중메뉴}.json`, `en/{중메뉴}.json` 양쪽에 추가한다.
게시판 기능에서 추가로 필요한 키 영역:

```json
{
  "{중메뉴}": {
    "{domain}Search": {
      "searchVisibleOnly": "공개만",
      "searchIncludeHidden": "숨김 포함"
    },
    "{domain}Btn": {
      "btnPin": "고정",
      "btnUnpin": "고정 해제",
      "btnHide": "숨김",
      "btnReorder": "순서 변경"
    },
    "{domain}Msg": {
      "msgPinFailTitle": "고정 불가",
      "msgPinFail": "고정에 실패했습니다 (최대 3개)"
    },
    "{domain}Pin": {
      "pinModalTitle": "고정 순서 변경",
      "pinEmpty": "고정된 게시글이 없습니다",
      "pinSaveSuccess": "순서가 저장되었습니다"
    },
    "{domain}Modal": {
      "postReadonlyNotice": "작성자만 수정할 수 있습니다",
      "postAttachSizeExceed": "{{fileName}} 파일이 최대 크기({{maxSize}})를 초과합니다",
      "postAttachCountExceed": "첨부파일은 최대 {{count}}개까지 등록할 수 있습니다"
    }
  }
}
```

---

## 4. 커스텀 포인트

### Backend

| 파일                           | 교체/수정 포인트                                                          |
| ------------------------------ | ------------------------------------------------------------------------- |
| `V{N}__*_tables.sql`           | 테이블명, 컬럼. 고정 불필요 시 `is_pinned`, `pin_order`, 관련 인덱스 제거 |
| `{Domain}.java`                | 도메인명, INSERT 필드                                                     |
| `{Domain}SummaryResponse.java` | 목록 필드. content는 제외하는 것이 원칙                                   |
| `{Domain}ErrorCode.java`       | 에러 코드 번호(AD\*\*\*\*), messageKey                                    |
| `{Domain}Mapper.java` + XML    | 고정 불필요 시 pin 관련 메서드 제거                                       |
| `{Domain}CommandService.java`  | `MAX_PINNED` 상수, 작성자 검증 로직                                       |
| `{Domain}Controller.java`      | URL, 불필요한 엔드포인트 제거                                             |

### Frontend

| 파일                                                   | 교체/수정 포인트                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `{domain}.ts`                                          | 응답/요청 타입 필드. 고정 불필요 시 `PinOrderItem` 제거                                         |
| `{domain}-api.ts`                                      | `BASE` URL, `{DOMAIN_UPPER}_FILE_TARGET_TYPE`, `directory` 파라미터. 고정·첨부 불필요 기능 제거 |
| `{domain}-query.ts`                                    | `KEY` 상수명, `enabled` 조건. 불필요한 훅 제거                                                  |
| `{domain}-validation-schema.ts`                        | 검색 필드, 폼 필드                                                                              |
| `{domain}Grid.tsx`                                     | 컬럼 목록. 고정 불필요 시 `boldCell`, `pinnedClass` 제거                                        |
| `{Domain}ListSearch.tsx`                               | 검색 필드. `includeHidden` 불필요 시 `FormSelect` 제거                                          |
| `{Domain}ListContent.tsx`                              | 툴바 버튼. 고정·숨김 불필요 시 해당 버튼+핸들러 제거                                            |
| `{Domain}PostModal.tsx` — `MAX_FILES`, `MAX_FILE_SIZE` | 첨부 제한 수정. 첨부 불필요 시 첨부파일 UI 전체 제거                                            |

---

## 5. 주의사항 / 흔한 실수

### Backend

**① `WorkspaceContext.getOrThrowSystemId()` 누락**  
Controller의 모든 메서드에서 호출해야 한다. 누락 시 시스템 격리가 깨진다. `X-System-Id` 헤더 없으면 400 반환.

**② MyBatis SELECT에 `del_dtm IS NULL` 누락**  
ArchUnit `SoftDeleteMyBatisTest`가 자동 검증하지만, 빠뜨리면 삭제된 게시글이 목록에 노출된다.

**③ ErrorCode 추가 후 메시지 파일 갱신 누락**  
`messages.properties`에 messageKey를 등록하지 않으면 에러 응답에 key 문자열이 그대로 내려간다.

**④ 고정 순서 변경 시 부분 유니크 인덱스 충돌**  
`(sys_id, pin_order)` 인덱스가 있을 때 한 번에 UPDATE하면 중간 상태에서 충돌이 난다.  
**음수 임시값으로 1차 이동 후 확정 값으로 2차 이동**하는 패턴을 반드시 따른다.

**⑤ `@WriteTransaction` 대신 `@Transactional` 사용 금지**  
`rollbackFor = Exception.class`가 빠져 checked exception이 롤백되지 않는다.

**⑥ `cm_file_meta` · `cm_user_bas` 는 `padmin` 스키마 테이블**  
이 두 테이블은 각 시스템 스키마가 아닌 `padmin` 스키마에 있다.  
MyBatis XML에서 prefix 없이 쓸 수 있는 것은 `search_path`에 `padmin`이 잡혀 있기 때문이다.  
다른 스키마(시스템 전용 스키마 등)에서 직접 참조하거나 DDL에서 FK를 걸 때는 `padmin.cm_file_meta`, `padmin.cm_user_bas`로 명시한다.

### Frontend

**① `searchRevision`을 API 파라미터로 넘기지 않는다**  
query key 전용이다. API에 포함시키면 백엔드가 알 수 없는 파라미터를 받는다.

**② `DataGrid`에 `key={...-${searchRevision}}` 필수**  
searchRevision이 바뀔 때 그리드를 재생성해 체크·선택 상태를 리셋한다.

**③ `use{Domain}PostQuery`의 `enabled` 조건**  
`enabled: id != null && id > 0` 없으면 신규 모달(`postId=null`)에서 불필요한 API 호출 발생.

**④ 모달 Body를 별도 컴포넌트로 분리하는 이유**  
`key={postId ?? 'new'}`로 신규/수정 전환 시 폼을 완전히 초기화한다. 합치면 `reset()` 타이밍 버그.

**⑤ `systemId`는 props가 아닌 `useActiveContextStore`에서 직접 읽는다**

**⑥ 첨부파일 업로드는 게시글 저장(POST) 이후에 호출한다**  
`create{Domain}Post` → 반환된 `id`로 `upload{Domain}Attachment` 순서를 지켜야 한다.

**⑦ 고정 해제(unpin) 시 오류 처리 주의**  
고정 해제는 409가 발생하지 않으므로 `handlePin`과 달리 try/catch 없이 바로 호출해도 된다.  
단, 네트워크 오류 대비가 필요하면 try/catch를 추가한다.

**⑧ `PinOrderModal` 초기화는 렌더 중 이전 값 비교 패턴 사용**  
`useEffect` 대신 `wasOpen` 플래그로 모달이 열리는 시점에만 `items`를 초기화한다.  
`useEffect`를 쓰면 `react-hooks/exhaustive-deps` 린트 경고가 발생한다.

---

## 6. 참고 샘플 코드 위치

| 파일              | 경로                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| 페이지            | `src/pages/samples/board/BoardList.tsx`                                  |
| 조회 폼           | `src/components/samples/board/BoardListSearch.tsx`                       |
| 목록 Content      | `src/components/samples/board/BoardListContent.tsx`                      |
| 등록/수정 모달    | `src/components/samples/board/BoardPostModal.tsx`                        |
| 고정 순서 모달    | `src/components/samples/board/BoardPinOrderModal.tsx`                    |
| 그리드 컬럼       | `src/components/samples/board/boardGrid.tsx`                             |
| Zod 스키마        | `src/components/samples/board/board-validation-schema.ts`                |
| API 타입          | `src/api/samples/board.ts`                                               |
| API 함수          | `src/api/samples/board-api.ts`                                           |
| Query 훅          | `src/query/samples/board-query.ts`                                       |
| BE Controller     | `api/board/controller/BoardController.java`                              |
| BE QueryService   | `api/board/service/BoardQueryService.java`                               |
| BE CommandService | `api/board/service/BoardCommandService.java`                             |
| BE Mapper         | `api/board/repository/mapper/BoardMapper.java`                           |
| BE 도메인         | `api/board/domain/BoardPost.java`, `BoardErrorCode.java`                 |
| BE DTO            | `api/board/dto/` (SetPinRequest, SetHiddenRequest, ReorderPinRequest 등) |
