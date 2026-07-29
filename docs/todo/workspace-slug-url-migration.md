# 워크스페이스 slug URL — 현재 구현 기록 & common 이관 계획

> 작성일: 2026-06-15
> 상태: **admin-front 에만 구현됨.** 다른 시스템(genx/asset/4dx 등)에도 동일하게 필요하므로 추후 `@vanta/common` 으로 이관 예정.

---

## 1. 목적

페이지 URL 에 현재 워크스페이스 slug 를 prefix 로 노출한다.

```
브라우저 URL :  /4dplex/system/program
DB 등록 메뉴 :  /system/program        (slug 없음)
API 요청 경로:  /api/v1/programs        (slug 없음, 컨텍스트는 헤더로)
```

- **목표**: URL 공유/북마크 가능, 어느 워크스페이스를 보고 있는지 URL 로 식별.
- **제약**: BE 메뉴 경로/ API 경로는 slug 를 모른다. slug 는 **URL 표시 + 요청 헤더 변환** 전용.

---

## 2. 배경 — 왜 `basename` 인가

### 2.1 탭 기반 SPA 구조

이 앱은 탭 기반이며 **페이지 콘텐츠는 브라우저 URL 이 아니라 `tab.path` 로 렌더**된다.
`TabbedOutlet` 이 탭마다 `useRoutes(routes, { pathname: tab.path })` 를 호출한다
(`@vanta/common` `src/components/layout/TabbedOutlet.tsx`). 따라서 `tab.path` 는 slug 가 없는 DB 경로
그대로 두면 콘텐츠 렌더링은 slug 와 무관하게 정상 동작한다.

### 2.2 처음 시도한 방법과 실패 (pathname-slug)

처음에는 라우트를 `:workspace/*` 로 감싸고, slug 를 실제 `pathname` 에 넣는 방식을 시도했다. 결과:

- `useRouteAuth`(common)가 `location.pathname` = `/4dplex/system/program` 을 slug 없는 프로그램
  경로(`/system/program`)와 비교 → 매칭 실패 → **403**.
- 사이드바 활성 하이라이트(`openKeysForPath`), `getRouteAuth(pathname)` 등 common 의 **모든 경로 기반
  로직**이 같은 이유로 깨진다.

즉, slug 를 pathname 에 넣으면 common 의 경로 로직과 정면 충돌한다.

### 2.3 채택: React Router `basename`

`<BrowserRouter basename="/4dplex">` 로 두면:

- 브라우저 URL: `/4dplex/system/program` (slug 노출)
- `useLocation().pathname`: `/system/program` (basename 제거됨)
- → `useRouteAuth`, 사이드바, 탭 매칭 등 common 로직이 **slug 를 모른 채 그대로 동작**.
- `navigate('/system/program')` → 브라우저 URL `/4dplex/system/program` 으로 자동 변환.

`basename` 은 slug 가 바뀔 때만 바꾸면 되고, 그 외 메뉴 네비게이션은 common 무수정으로 동작한다.
**이 방식의 핵심 장점: common 코드를 한 줄도 바꾸지 않고 admin 에서만 구현 가능.**

---

## 3. 현재 admin-front 구현 (파일별 상세)

### 3.1 `src/lib/workspace-basename.ts` (신규)

basename slug 를 보관하는 zustand store. `setSlug` 가 URL 을 먼저 맞춘 뒤 store 를 갱신해
App 의 `BrowserRouter` 를 remount 시킨다.

```ts
import { create } from 'zustand'

/** slug 로 취급하지 않는 예약 첫 세그먼트 — 비인증/특수 페이지는 basename 밖에 둔다. */
const RESERVED_SEGMENTS = new Set(['login', 'error', 'maintenance', 'popup', 'publish'])

/** 현재 브라우저 URL 의 첫 세그먼트가 워크스페이스 slug 이면 반환, 아니면 null. */
export function workspaceSlugFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  const seg = window.location.pathname.split('/').filter(Boolean)[0]
  if (!seg || RESERVED_SEGMENTS.has(seg)) return null
  return seg
}

interface WorkspaceBasenameState {
  /** 현재 basename 으로 쓰이는 워크스페이스 slug. null 이면 basename 없음(루트). */
  slug: string | null
  /**
   * @param slug 새 워크스페이스 slug (null = basename 제거)
   * @param opts.toHome true 면 sub-path 를 버리고 워크스페이스 홈(`/<slug>`)으로 이동.
   *        워크스페이스 전환 시 사용 — 새 워크스페이스에 없는 경로로 진입해 403 나는 것을 방지.
   */
  setSlug: (slug: string | null, opts?: { toHome?: boolean }) => void
}

export const useWorkspaceBasenameStore = create<WorkspaceBasenameState>()((set) => ({
  slug: workspaceSlugFromLocation(),

  setSlug: (slug, opts) => {
    const segments = window.location.pathname.split('/').filter(Boolean)
    const hadSlug = workspaceSlugFromLocation() != null
    const sub = opts?.toHome ? [] : hadSlug ? segments.slice(1) : segments
    const target = '/' + (slug ? [slug, ...sub] : sub).join('/')
    window.history.replaceState(null, '', target === '/' ? '/' : target)
    set({ slug })
  },
}))
```

### 3.2 `src/store/workspace-directory-store.ts` (신규)

`slug ↔ workspaceId` 동기 변환표. axios 인터셉터가 모듈 레벨에서 동기로 접근해야 하므로
React Query 가 아닌 store 로 둔다. `/me/workspaces`(admin `MeWorkspaceResponse`, slug 포함)로 채운다.

```ts
import { create } from 'zustand'
import type { MeWorkspaceResponse } from '@/api/me-api'

interface WorkspaceDirectoryState {
  workspaces: MeWorkspaceResponse[]
}
interface WorkspaceDirectoryActions {
  setWorkspaces: (list: MeWorkspaceResponse[]) => void
  findIdBySlug: (slug: string) => number | null
  findSlugById: (workspaceId: number) => string | null
}

export const useWorkspaceDirectoryStore = create<
  WorkspaceDirectoryState & WorkspaceDirectoryActions
>()((set, get) => ({
  workspaces: [],
  setWorkspaces: (list) => set({ workspaces: list }),
  findIdBySlug: (slug) => get().workspaces.find((w) => w.slug === slug)?.workspaceId ?? null,
  findSlugById: (workspaceId) =>
    get().workspaces.find((w) => w.workspaceId === workspaceId)?.slug ?? null,
}))
```

### 3.3 `src/App.tsx` (수정)

`BrowserRouter` 에 basename 주입. slug 가 바뀌면 `key` 가 바뀌어 새 basename 으로 remount.

```tsx
import { useWorkspaceBasenameStore } from '@/lib/workspace-basename'

function App() {
  const slug = useWorkspaceBasenameStore((s) => s.slug)
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          key={slug ?? '__root__'}
          basename={slug ? `/${slug}` : undefined}
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <AppRoutes />
          <MainAppOverlays />
          <PopupMessage />
        </BrowserRouter>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

### 3.4 `src/main.tsx` (수정) — 인터셉터 + 부트 시 디렉토리 채우기

axios 인터셉터가 URL 첫 세그먼트를 slug 로 보고 `workspaceId` 로 변환해 `X-Workspace-Id` 헤더 주입.

```ts
function resolveWorkspaceIdFromUrl(): number | null {
  const seg = window.location.pathname.split('/').filter(Boolean)[0]
  if (!seg) return null
  return useWorkspaceDirectoryStore.getState().findIdBySlug(seg)
}

http.interceptors.request.use((config) => {
  const urlWsId = resolveWorkspaceIdFromUrl()
  const { workspaceId: ctxWsId, systemId } = useActiveContextStore.getState()
  const workspaceId = urlWsId ?? ctxWsId // URL slug 우선, 없으면 active-context 폴백
  config.headers = config.headers ?? {}
  if (workspaceId != null && workspaceId > 0 && config.headers['X-Workspace-Id'] == null) {
    config.headers['X-Workspace-Id'] = String(workspaceId)
  }
  if (systemId != null && config.headers['X-System-Id'] == null) {
    config.headers['X-System-Id'] = String(systemId)
  }
  return config
})
```

부트(`bootstrapAuth().finally`) 에서 `/me/workspaces` 를 받아 디렉토리 store 를 채우고 표시명 보강:

```ts
void fetchMyWorkspaces()
  .then((list) => {
    useWorkspaceDirectoryStore.getState().setWorkspaces(list)
    const activeWsId = useActiveContextStore.getState().workspaceId
    const activeSysId = useActiveContextStore.getState().systemId
    if (activeWsId == null || activeWsId <= 0) return
    const ws = list.find((w) => w.workspaceId === activeWsId)
    if (!ws) return
    const sys = activeSysId != null ? ws.systems.find((s) => s.systemId === activeSysId) : undefined
    useActiveContextStore.getState().setBoth(activeWsId, activeSysId, {
      workspaceName: ws.name,
      systemName: sys?.name ?? null,
    })
  })
  .catch(() => undefined)
```

### 3.5 `src/components/layout/WorkspaceBasenameSync.tsx` (신규)

MainLayout 라우트만 감싼다(예약 경로 제외). URL slug ↔ 활성 워크스페이스 동기화.

```tsx
import { useActiveContextStore } from '@vanta/common'
import { useWorkspaceBasenameStore } from '@/lib/workspace-basename'
import { useWorkspaceDirectoryStore } from '@/store/workspace-directory-store'

export default function WorkspaceBasenameSync({ children }: { children: React.ReactNode }) {
  const basenameSlug = useWorkspaceBasenameStore((s) => s.slug)
  const setSlug = useWorkspaceBasenameStore((s) => s.setSlug)
  const workspaces = useWorkspaceDirectoryStore((s) => s.workspaces)
  const activeWsId = useActiveContextStore((s) => s.workspaceId)

  useEffect(() => {
    if (workspaces.length === 0) return // 디렉토리 미로드 → 보류

    // (2) URL 에 slug 있음 → active-context 를 그 워크스페이스로 맞춘다(직접 진입/북마크).
    if (basenameSlug) {
      const ws = workspaces.find((w) => w.slug === basenameSlug)
      if (ws && ws.workspaceId !== activeWsId) {
        const adminSys = ws.systems.find((s) => s.name.trim().toLowerCase() === 'admin')
        useActiveContextStore.getState().setBoth(ws.workspaceId, adminSys?.systemId ?? null, {
          workspaceName: ws.name,
          systemName: adminSys?.name ?? null,
        })
      }
      return
    }

    // (1) URL 에 slug 없음 + 활성 워크스페이스 있음 → basename 에 slug 부착(remount).
    const activeSlug = workspaces.find((w) => w.workspaceId === activeWsId)?.slug
    if (activeSlug) setSlug(activeSlug)
  }, [basenameSlug, workspaces, activeWsId, setSlug])

  return <>{children}</>
}
```

### 3.6 `src/routes/index.tsx` (수정)

`:workspace` 라우트는 쓰지 않는다. `/*` 그대로 두고 MainLayout 만 `WorkspaceBasenameSync` 로 감싼다.

```tsx
{
  element: <AuthGuard />,
  children: [
    popupWindowRouteTree,
    publishPreviewRouteTree,
    {
      path: '/*',
      element: (
        <WorkspaceBasenameSync>
          <MainLayout routes={mainLayoutOutletRoutes} slots={mainLayoutSlots} />
        </WorkspaceBasenameSync>
      ),
      children: mainLayoutOutletRoutes,
    },
  ],
}
```

### 3.7 워크스페이스 전환 — `HeaderWorkspaceSwitcher.tsx` / `WorkspaceSwitchModal.tsx` (수정)

전환 시 `navigate` 대신 `setSlug(slug, { toHome: true })` 호출.

```ts
// 공통 패턴 (헤더 드롭다운 / 선택 모달 동일)
useActiveContextStore.getState().setBoth(ws.workspaceId, adminSys.systemId, {
  workspaceName: ws.name,
  systemName: adminSys.name,
})
sessionStorage.setItem(WORKSPACE_SESSION_PICKED_KEY, '1')
sessionStorage.setItem(
  ACTIVE_CONTEXT_OVERRIDE_KEY,
  JSON.stringify({ workspaceId: ws.workspaceId, systemId: adminSys.systemId }),
)
// basename 을 새 slug 로 바꿔 URL 노출 + 워크스페이스 홈으로 이동(BrowserRouter remount)
useWorkspaceBasenameStore.getState().setSlug(ws.slug, { toHome: true })
```

> 참고: admin 은 워크스페이스를 바꿔도 admin 시스템에 머무르므로 `systems` 에서 `name === 'admin'`
> 인 시스템을 systemId 로 고정한다. 다른 시스템에서는 자신의 시스템 코드로 바꿔야 한다.

---

## 4. 동작 흐름

| 시나리오                           | 흐름                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 직접 진입 `/4dplex/system/program` | `workspaceSlugFromLocation()`=`4dplex` → App basename=`/4dplex` → RR pathname=`/system/program` → useRouteAuth 정상 → 디렉토리 로드 후 Sync 가 active-context 동기화 |
| 로그인 직후 `/`                    | slug=null → 모달/부트로 활성 워크스페이스 결정 → `WorkspaceBasenameSync` 가 `setSlug(activeSlug)` → URL `/4dplex` 로 remount                                         |
| 메뉴 클릭                          | common `navigate('/system/program')` → basename 유지 → URL `/4dplex/system/program`, **remount 없음**                                                                |
| 워크스페이스 전환                  | `setSlug(newSlug, {toHome})` → URL `/newSlug` → BrowserRouter remount → 메뉴 재조회                                                                                  |
| API 요청                           | 인터셉터가 URL 첫 세그먼트 → 디렉토리 → id → `X-Workspace-Id` 헤더                                                                                                   |

---

## 5. 트레이드오프 / 알려진 한계

1. **워크스페이스 전환 시 BrowserRouter remount.** `key={slug}` 변경으로 라우터 트리가 remount된다.
   탭 상태는 zustand(persist)로 유지되지만 MainLayout 등은 다시 마운트된다. 전환은 드물고 메뉴도
   어차피 재조회하므로 수용 가능.
2. **부트 직후 인터셉터 race.** 디렉토리 store 가 채워지기 전(`/me/workspaces` 응답 전)의 API 호출은
   `active-context.workspaceId`(persisted/sessionStorage) 로 폴백한다. 직접 진입 + 다른 slug 인 드문
   경우 첫 몇 요청이 폴백 id 를 쓸 수 있으나 곧 Sync 가 보정한다.
3. **로그아웃 시 URL 에 slug 잔존 가능.** 로그아웃은 common AppHeader 가 처리하므로 `/4dplex/login`
   형태가 잠깐 남을 수 있다(기능 영향 없음, cosmetic). 필요 시 로그아웃 직전 `setSlug(null)` 추가.
4. **slug 검증.** 알 수 없는 첫 세그먼트(`/garbage/...`)는 디렉토리 매칭 실패 → 인터셉터는 폴백, Sync 는
   `basenameSlug` 가 디렉토리에 없으면 active-context 를 건드리지 않는다. 별도 404 처리는 없음.

---

## 6. common 이관 시 필요한 작업 (TODO)

다른 시스템에도 동일 기능이 필요하므로 아래를 `@vanta/common` 으로 일반화한다.

### 6.1 common 에 추가할 것

- [ ] **`workspace-basename` store/헬퍼 이관**
  - `workspaceSlugFromLocation()`, `useWorkspaceBasenameStore`, `setSlug(slug, {toHome})`
  - `RESERVED_SEGMENTS` 는 앱마다 다를 수 있으므로 `configureReservedSegments(string[])` 같은 주입점 제공 검토.
- [ ] **`workspace-directory` 추상화**
  - 현재 admin 은 `MeWorkspaceResponse`(`/me/workspaces`)에 의존. common 은 me-api 를 모르므로,
    slug↔id 목록을 외부에서 주입받는 형태(`setWorkspaceDirectory(list)`)로 둔다.
  - 또는 이미 common 의 `useAuthStore.user.workspaces[].slug`(= `/auth/me`)를 단일 출처로 사용
    (현재 `UserWorkspace.slug?` 타입 + BE `AuthenticatedUserResponse.WorkspaceResponse.slug` 존재).
    이 경우 admin 의 directory-store 는 제거 가능.
- [ ] **`WorkspaceBasenameSync` 이관**
  - active-context ↔ basename slug 동기화 로직. "전환 후 머무를 시스템" 결정(admin 은 `admin` 시스템)
    은 앱별로 다르므로 콜백/옵션으로 주입.
- [ ] **basename 을 적용한 `BrowserRouter` 래퍼 제공** (예: `<WorkspaceRouter>`),
      각 앱 `App.tsx` 가 이를 사용.
- [ ] **인터셉터 헬퍼**: URL slug → id 변환을 common 의 `initHttpClient` 옵션이나 공용 인터셉터로 흡수.

### 6.2 결정 필요 사항

- **slug 출처 단일화**: `/auth/me` 의 `user.workspaces[].slug` vs 별도 `/me/workspaces`.
  `/auth/me` 로 통일하면 directory-store 가 불필요(common User 타입만으로 충분).
- **"전환 후 시스템" 정책**: admin 은 항상 admin 시스템. 일반 시스템은 자기 시스템. 주입 인터페이스 설계.
- **로그아웃/게스트 진입 시 slug 정리** 정책.

### 6.3 이관 후 admin 에서 제거할 것

- `src/lib/workspace-basename.ts` → common 으로
- `src/store/workspace-directory-store.ts` → (slug 출처를 /auth/me 로 바꾸면) 삭제
- `src/components/layout/WorkspaceBasenameSync.tsx` → common 으로
- `src/main.tsx` 인터셉터의 `resolveWorkspaceIdFromUrl` → common 으로
- `src/App.tsx` 의 basename 배선 → common `<WorkspaceRouter>` 로 대체

---

## 7. 참고 — 변경/추가된 파일 목록 (현재 admin)

| 파일                                                | 변경                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| `src/lib/workspace-basename.ts`                     | 신규 — basename store/헬퍼                         |
| `src/store/workspace-directory-store.ts`            | 신규 — slug↔id 디렉토리                            |
| `src/components/layout/WorkspaceBasenameSync.tsx`   | 신규 — URL↔active-context 동기화                   |
| `src/App.tsx`                                       | 수정 — BrowserRouter basename 배선                 |
| `src/main.tsx`                                      | 수정 — 인터셉터 URL slug 변환 + 부트 디렉토리 적재 |
| `src/routes/index.tsx`                              | 수정 — MainLayout 을 WorkspaceBasenameSync 로 래핑 |
| `src/components/layout/HeaderWorkspaceSwitcher.tsx` | 수정 — 전환 시 `setSlug` 사용                      |
| `src/components/layout/WorkspaceSwitchModal.tsx`    | 수정 — 전환 시 `setSlug` 사용                      |

> common 측 의존: `useActiveContextStore.workspaceName/systemName`(헤더 표시명), `UserWorkspace.slug?`
> (현재 admin 은 directory-store 사용으로 직접 의존하지 않음). 둘 다 common 에 이미 반영됨.

---

## 8. 채택하지 않은 방식 & 제거한 죽은 코드

### 8.1 `:workspace` 라우트 + slug-aware 훅 인프라 (미채택)

초기에 common 에 다음 인프라가 시도된 적이 있다 (2026.06.12, 이후 제거됨).

- `use-ws-navigate.ts` (`useWsNavigate`, `useWorkspaceParam`)
- `use-workspace-slug-sync.ts` (`useWorkspaceSlugSync`)
- `use-current-workspace-slug.ts` (`useCurrentWorkspaceSlug`)
- `utils/workspace-path.ts` (`buildWsPath`, `withWorkspaceRoute` 등)

이 방식은 slug 를 **실제 `pathname` 에 넣고** `:workspace/*` 라우트로 매칭하는 구조였다.
**채택하지 않은 이유**: slug 가 `location.pathname` 에 들어가면 common 의 경로 기반 로직
(`useRouteAuth` 의 프로그램 권한 매칭, 사이드바 활성 하이라이트 등)이 slug 없는 DB 경로와 비교에 실패해
**403/하이라이트 깨짐**이 발생한다 (본문 §2.2 참고). 그래서 `basename` 방식으로 전환했다.

### 8.2 admin 에 유입된 죽은 코드 제거 (2026.06.15)

위 §8.1 파일들이 merge/stash 과정에서 **admin `src/hooks/`, `src/utils/` 로 복사되어 들어왔으나
어디서도 import 되지 않는 죽은 코드**였다. 그 중 `use-workspace-slug-sync.ts` 가
`UserWorkspace.slug` 를 참조하는데, CI 의 published `@vanta/common` 타입에는 `slug` 가 없어
`tsc -b` 빌드가 실패했다.

→ 4개 파일을 모두 삭제했다. 실제 slug 기능은 §3 의 basename + directory-store 구현이 담당하므로
동작에 영향 없음 (사용처 0건, `tsc --noEmit` 클린 확인).

```
삭제:
  src/hooks/use-workspace-slug-sync.ts
  src/hooks/use-ws-navigate.ts
  src/hooks/use-current-workspace-slug.ts
  src/utils/workspace-path.ts
```

> 교훈: common 으로 이관할 때 §8.1 의 pathname-slug 방식이 아니라 **basename 방식**(§2.3)을
> 기준으로 삼는다. pathname 에 slug 를 넣는 접근은 common 경로 로직과 충돌한다.
