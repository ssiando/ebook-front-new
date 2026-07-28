# GNB · 사이드바 · 다크모드 — `@vanta/common` 이관 계획 (영향도 검토)

> 작성일: 2026-06-16
> 상태: **계획 단계.** 현재 GNB 전환 UI / 사이드바 서비스 목록 / 다크 토글은 admin 에만 구현되어
> common `MainLayout` 의 슬롯(`headerWorkspaceArea`, `headerUserMenu`, `sidebarBottom`)에 주입돼 있다.
> 이 슬롯 "내용물"을 common 으로 승격해 모든 시스템이 동일한 GNB/사이드바/테마를 공유하게 한다.
> 연관 문서:
> - [서비스 포털 카탈로그 이관](./service-portal-hydrate-migration.md) — `/me/workspaces` hydrate, `buildSystemPortalUrl`
> - [다크 테마 토큰화 이관](./theme-dark-mode-migration.md) — `:root[data-theme='dark']` 토큰 레이어
> - [워크스페이스 slug URL 마이그레이션](./workspace-slug-url-migration.md) — basename slug
>
> **위 3개 문서와 강하게 얽혀 있다.** 본 문서는 "GNB/사이드바 컴포넌트 자체"의 이관을 다루고,
> URL 조립·테마 토큰·slug 는 각 연관 문서의 결정에 의존한다.

---

## 1. 목적

admin 에만 있는 아래 3개를 `@vanta/common` 으로 올려, **하위 시스템(genx/asset/4dx/vfx/aion 등)도
동일한 헤더 전환 UI · 사이드바 서비스 목록 · 라이트/다크 테마**를 코드 중복 없이 갖게 한다.

1. **GNB 워크스페이스/시스템 전환** (`HeaderWorkspaceSwitcher`)
2. **사이드바 하단 서비스 목록** (`SidebarServiceList`)
3. **다크/라이트 테마 토글 + 토큰 레이어** (`theme-store` + `index.css` 다크 블록 + 유저메뉴 토글 버튼)

---

## 2. 현재 구조 (이관 출발점)

### 2.1 common 에 "이미 있는" 것 (슬롯 인프라)

common `MainLayout` 은 shell 을 고정 구조로 제공하고, 앱별 차이는 슬롯으로만 받는다. **슬롯은 이미 존재**한다.

| 슬롯 (`MainLayoutSlots`) | 위치 | admin 이 주입하는 것 |
|---|---|---|
| `headerWorkspaceArea` | 헤더 워크스페이스 타이틀 영역 교체 | `<HeaderWorkspaceSwitcher />` |
| `headerUserMenu` | 유저 드롭다운 항목 | `<MainLayoutUserMenuSlot>` (다크 토글 포함) |
| `sidebarBottom` | 사이드바 메뉴 아래 | `<SidebarServiceList />` |

> 즉 이관은 "슬롯을 새로 파는 것"이 아니라 **슬롯에 꽂히는 컴포넌트를 common 으로 옮기고,
> 각 시스템이 그걸 재사용**하게 만드는 작업이다. shell 변경은 최소.

또한 common 에는 이미:

- `useActiveContextStore` (워크스페이스/시스템 active context, `ACTIVE_CONTEXT_OVERRIDE_KEY` 포함)
- `me-api.ts` (`fetchMyWorkspaces`, `switchWorkspace`, `updateMyTheme`) — 서비스 포털 이관 때 승격됨
- `use-hydrate-service-portals.ts`, `servicePortalStore`, `buildSystemPortalUrl` (`system-portal-url.ts`)
- `ServiceListLayer.tsx` (GNB 시스템 카탈로그 레이어 — 이미 common)

### 2.2 admin 에만 있는 것 (이관 대상)

| 파일 | 역할 | 이관 시 행선지 |
|---|---|---|
| `src/components/layout/HeaderWorkspaceSwitcher.tsx` | GNB ws/sys 드롭다운 | common 컴포넌트 |
| `src/assets/styles/layout/header-workspace-switcher.css` (159줄) | 위 스타일(`.hws*`) | common CSS |
| `src/components/layout/SidebarServiceList.tsx` | 사이드바 서비스 목록 | common 컴포넌트 |
| `src/assets/styles/layout/sidebar-service-list.css` (74줄) | 위 스타일(`.sidebar-service*`) | common CSS |
| `src/components/layout/system-card-icons.tsx` | 시스템 아이콘 렌더러(`renderSystemIcon`) | common (GNB/사이드바/홈/모달 공용) |
| `src/components/layout/MainLayoutUserMenuSlot.tsx` | 유저메뉴 항목 + **다크 토글** | 토글은 common, 항목 일부(접속기록/사이트맵)는 시스템별 |
| `src/store/theme-store.ts` | 테마 store | common |
| `src/lib/system-fe-url.ts` | 시스템 FE URL(**env 기반**) | common 으로 일원화(아래 §4 충돌 참고) |
| `src/lib/workspace-basename.ts` | slug basename store | slug 문서 의존 (§5) |
| `src/query/me-query.ts` (`useMyWorkspacesQuery`) | `/me/workspaces` 캐시 | common me-query 로 승격 검토 |
| `src/index.css` `:root[data-theme='dark']` 블록 | 다크 토큰 레이어 | common 테마 레이어 (테마 문서) |

---

## 3. 영향도 검토 (핵심)

### 3.1 GNB 전환 UI 를 common 기본 노출하면 안 된다 → **opt-in**

`HeaderWorkspaceSwitcher` 는 **관리자(admin) 전제**가 코드에 박혀 있다:

- "현재 화면이 admin 이므로 시스템 목록에서 자기 자신(admin)을 숨긴다" (`name === 'admin'` 필터)
- "워크스페이스 전환 후에도 admin 시스템에 머무른다" (전환 시 대상 ws 의 admin 시스템 강제 선택)

하위 시스템(예: genx)에서 그대로 쓰면 "genx 를 숨기고 admin 에 머무르는" 잘못된 동작이 된다.
→ **현재 시스템 코드를 파라미터화**해야 한다.

- `currentSystemCode` 를 prop/컨텍스트로 받아 "자기 자신 숨김" 기준으로 사용.
- 워크스페이스 전환 시 "같은 시스템 코드의 대상 ws 시스템으로 이동"하도록 일반화
  (admin → admin 머무름이 특수 케이스가 아니라, `currentSystemCode` 머무름의 한 사례가 되도록).
- `service-portal-hydrate` 문서의 `autoHydratePortals` 처럼, **GNB 전환 UI 자체도 opt-in**.
  (전환 UI 가 없는 시스템은 슬롯에 주입하지 않으면 끝 — shell 영향 없음.)

### 3.2 시스템 URL 조립 전략이 **둘**로 갈려 있다 (가장 큰 리스크)

| | admin `lib/system-fe-url.ts` | common `utils/system-portal-url.ts` |
|---|---|---|
| 소스 | Vite env `VITE_SYSTEM_FE_URL_<CODE>` | 호스트명 패턴 추론 `resolveCurrentEnv()` |
| local | env 값 (`http://localhost:818x`) | `localPorts[systemName]` 또는 `location.origin` |
| dev/stg/prd | env 값 | `https://{env}-{system}.vanta.ai/{slug}` |
| 식별자 | `system.name` 소문자 | `system.code` (= `cm_system_std.cd`) |
| ws slug | query `?wsId=&sysId=` 만 부착 | path `/{slug}` prefix 조립 |

→ **두 전략이 공존하면 시스템마다 URL 이 달라진다.** 이관 전에 하나로 통일해야 한다.

- 서비스 포털 문서는 이미 common `buildSystemPortalUrl`(호스트 패턴 + slug path) 을 표준으로 정함.
- admin GNB/사이드바는 아직 env 기반 `buildSystemSwitchUrl`(query 부착) 을 쓴다 → **이게 레거시.**
- 결정 필요: **common `buildSystemPortalUrl` 로 단일화**하되,
  - `wsId/sysId` query 부착이 여전히 필요한지 (slug path 로 충분한지) 확인.
    - slug URL 마이그레이션이 끝나면 path `/{slug}` 로 ws 가 결정되므로 `wsId` query 는 불필요해질 수 있음.
    - 단 **새 탭 부팅 시 active context bootstrap** 이 query(`wsId/sysId`)에 의존하므로, slug 만으로
      systemId 까지 결정되는지 확인 후 제거 여부 결정. (slug→wsId 는 directory store, sysId 는 호스트→system 코드)
  - local 포트 매핑을 env 로 둘지 `localPorts` 옵션으로 둘지.

> **권장**: 이관 1단계에서 admin GNB/사이드바의 `buildSystemSwitchUrl` 호출을
> common `buildSystemPortalUrl` 로 교체(동작 동일 검증) → 이후 컴포넌트를 통째로 common 으로 이동.
> 즉 **URL 일원화를 먼저, 컴포넌트 이동을 나중에.**

### 3.3 다크모드는 common CSS 의 하드코딩에 의존 → 토큰 레이어 동반 이관 필수

- GNB/사이드바 다크 스타일의 상당수는 **이미 common CSS 에 `[data-theme='dark']` 로 들어가 있다**
  (테마 문서 §3.4: `app-header.css`, `sidebar.css`, `service-list-layer.css`, `tab-bar.css` 등).
- 그러나 **테마 토큰 레이어 자체(`:root[data-theme='dark']` 변수 override + 회색 반전)는 admin `index.css` 에만** 있다.
  → 하위 시스템은 `data-theme="dark"` 를 켜도 토큰이 안 바뀌어 다크가 안 먹는다.
- 따라서 GNB/사이드바 이관과 **테마 토큰 레이어 이관(테마 문서 TODO)은 같은 PR 묶음**으로 가야 한다.
  토큰만 common 에 올라가면 이미 common 에 있는 헤더/사이드바 다크 CSS 가 자동으로 살아난다.

### 3.4 `theme-store` 의 영속/개인화 출처

- 현재 `theme-store` 는 `localStorage('admin_theme')` + `PATCH /me/theme`.
- common 으로 올리면 키 이름(`admin_theme`)을 **시스템 중립(`vanta_theme`)** 으로 바꿔야 함.
- 초기 테마 출처 일원화: `/auth/me` 응답에 `theme` 포함 시 서버 개인화로 통일 가능
  (테마 문서 §4 TODO 와 동일 — 현재 `/auth/me` 에 theme 없음, BE 추가 검토).
- **마이그레이션 주의**: 기존 admin 사용자의 `admin_theme` 값 보존하려면 1회성 키 마이그레이션 or 둘 다 read.

### 3.5 slug basename 결합

- GNB 워크스페이스 전환은 `useWorkspaceBasenameStore.setSlug(slug, {toHome:true})` 로 URL slug 를 바꾼다.
- 이건 **admin 전용 FE 기능**(slug URL 문서)이라 아직 common 화 안 됨.
- 옵션:
  - (A) GNB 전환 시 slug 처리를 **콜백 prop**(`onWorkspaceSwitch(ws)`)으로 빼서, slug 적용은 소비 앱이 담당.
  - (B) slug basename 자체를 common 으로 승격(slug 문서 진행)한 뒤 GNB 가 직접 호출.
- **권장**: 1단계는 (A) — GNB 컴포넌트는 "전환 의도"만 콜백으로 알리고, slug/basename 같은 라우팅 부작용은
  앱이 주입. common 이 react-router basename 까지 강제하지 않게 해 결합도를 낮춘다.

### 3.6 알림 API 는 하위 시스템에서 **admin BE 로** 호출해야 한다 (별도 base URL)

GNB 알림 벨(`NotificationBellV2`)과 수신함(`Inbox`)을 common 으로 올리면, 알림 호출 경로가 문제가 된다.

- 알림 API(`/notifications/inbox`, `/notifications/inbox/unread-count`, `/notifications/inbox/{id}/read` 등)는
  common `http` 인스턴스로 호출되고, 그 `baseURL` 은 **각 시스템 자신의 `VITE_API_BASE_URL`** 이다.
- 그런데 **알림은 admin BE 가 단일 관리**한다. 하위 시스템(genx/asset/4dx/vfx 등)에는 알림 BE 가 없으므로
  자기 baseURL 로 `/notifications/*` 를 치면 404/미구현이 된다.
- 따라서 **하위 시스템에서는 알림 API 만 admin BE 의 base URL 로 보내야 한다.**

해결 방향(택1, 이관 시 결정):

- (A) **알림 전용 base URL env**: `VITE_ADMIN_API_BASE_URL`(또는 `VITE_NOTIFICATION_API_BASE_URL`) 를 두고,
  알림 API 호출만 `http.get(url, { baseURL: adminApiBaseUrl })` 처럼 per-request override.
  - common `axios.ts` 는 이미 `config.baseURL` per-request override 를 지원(`api.defaults.baseURL` 반영 로직 주의).
    단 **싱글턴 default 를 덮어쓰는 부작용**이 있으므로, 알림용은 default 를 바꾸지 않는 방식(별도 인스턴스 or
    요청별 절대 URL)으로 격리해야 한다. ← **중요 함정**
- (B) **알림 전용 axios 인스턴스**: common 에 admin baseURL 로 고정된 별도 인스턴스를 만들어 알림 API 가 그것만 사용.
  싱글턴 default 오염 위험이 없어 더 안전.
- (C) admin 자신은 default baseURL 이 곧 admin BE 이므로, admin 에서는 override 불필요(=null 이면 default 사용).

토큰/인증 처리:

- 알림 호출도 동일한 인증 토큰을 보내야 한다. 별도 인스턴스(B)를 쓰면 common 의 인터셉터(토큰 주입/리프레시)를
  그 인스턴스에도 동일 적용해야 한다. (현재 인터셉터는 싱글턴 `api` 에 붙어 있으므로 재사용 구조 필요.)
- 크로스 도메인(하위 시스템 FE → admin BE)이면 **CORS** 가 필요하다. admin BE 가 하위 시스템 origin 을 허용해야 함(§5 BE).
- `X-Workspace-Id` / `X-System-Id` 헤더 컨텍스트도 알림 호출에 동일하게 실려야 한다(현재 인터셉터 의존).

> **정리**: 알림 UI 를 common 으로 올릴 때 "알림 API 의 base URL = admin BE" 를 **명시적으로 분리**해야 한다.
> 권장은 (B) 알림 전용 인스턴스(인터셉터 공유) + `VITE_ADMIN_API_BASE_URL`. admin 은 env 미설정 시 자기 BE 사용.

관련 파일(이관 대상):

| 파일 | 비고 |
|---|---|
| `src/components/layout/NotificationBellV2.tsx` | GNB 벨 — common 이관 시 알림 base URL 분리 필요 |
| `src/components/system/notification/inbox/Inbox.tsx` | 수신함 — 동일 |
| `src/api/notification/inbox-api.ts` | `/notifications/inbox*` — base URL override 적용 지점 |
| `src/query/notification/notification-v2-query.ts` | 위 API 의 query 훅 |

> 단, **알림 "관리" 화면**(템플릿/발송이력/대상자 등 `notification-api.ts`, `template-api.ts`,
> `dispatch-log-api.ts`, `workspace-template-api.ts`)은 admin 전용 관리 기능이므로 하위 시스템 이관 대상이 아니다.
> 하위 시스템이 공유하는 것은 **수신(inbox)·미읽음 카운트·읽음 처리**뿐이다. 이관 범위를 inbox 계열로 한정한다.

### 3.7 시스템 목록은 "내 권한 시스템"을 API 로 조회해 렌더한다 (하드코딩 금지)

GNB 시스템 드롭다운과 사이드바 서비스 목록에 뿌리는 시스템은 **로그인 사용자가 권한을 가진 시스템만**이어야 한다.
하드코딩/정적 매핑이 아니라 **API 응답을 단일 소스**로 렌더한다.

- **단일 소스: `/me/workspaces`.** 워크스페이스별 `systems[]` 를 내려주고, GNB/사이드바는 현재 활성 워크스페이스의
  `systems` 를 그대로 그린다. (현재 `useMyWorkspacesQuery` → `currentWs.systems` 로 이미 이 방식.)
- **권한 스코프는 BE 책임.** `/me/workspaces` 의 `systems[]` 자체가 "그 사용자가 그 워크스페이스에서 접근 가능한
  시스템"으로 필터돼 내려와야 한다. FE 는 추가로 권한 판정을 하지 않는다(= 받은 것만 그린다).
- **FE 의 현재 필터는 "표시 규칙"뿐이어야 한다.** 지금 코드의 `name === 'admin'` 제외는 "현재 화면 자신을 숨김"
  (=`currentSystemCode` 제외, §3.1)일 뿐, **권한 필터가 아니다.** 권한으로 빼는 일을 FE 가 떠안지 않는다.
- **응답 필드 보강 필요(서비스 포털 문서 §5 와 동일).** 현재 `MeSystemSummary` 는 `systemId/name/description` 뿐 →
  URL 조립용 `code`(= `cm_system_std.cd`), 미배포 안내용 `deployed` 가 필요. 이관 시 BE 응답에 추가.
- **데이터 출처 일원화.** 서비스 포털 문서의 `servicePortalStore`(hydrate) 와 `useMyWorkspacesQuery` 가 둘 다
  `/me/workspaces` 를 친다 → GNB/사이드바/홈/서비스레이어가 **같은 한 출처**를 보도록 통일(중복 호출 제거, §3.6/서비스포털 §4.2).

> 요약: "권한 있는 시스템 = `/me/workspaces` 가 내려준 `systems`". BE 가 권한으로 필터해 주고, FE 는
> 자기 자신(`currentSystemCode`)만 숨겨 그대로 렌더한다. 정적 목록/하드코딩 매핑은 두지 않는다.

### 3.8 의존성 정리

GNB/사이드바 컴포넌트가 쓰는 의존성과 이관 가능 여부:

| 의존 | 현재 위치 | 이관 |
|---|---|---|
| `useActiveContextStore` | common ✅ | 그대로 |
| `useMyWorkspacesQuery` | admin me-query | common me-query 로 승격(또는 `servicePortalStore` 재사용) |
| `renderSystemIcon` | admin system-card-icons | common 으로 (홈/모달도 같이 쓰므로 공용 자산) |
| `buildSystemSwitchUrl` | admin system-fe-url(env) | **common `buildSystemPortalUrl` 로 대체**(§3.2) |
| `useWorkspaceBasenameStore` | admin(slug) | 콜백으로 분리(§3.5) |
| `ACTIVE_CONTEXT_OVERRIDE_KEY` / `WORKSPACE_SESSION_PICKED_KEY` | common / admin | 전자는 common, 후자는 common 승격 검토 |
| i18n `common.nav.*` | `defaultValue` 인라인 | 그대로(공통 네임스페이스) |

---

## 4. 이관 단계 (권장 순서)

> 원칙: **URL 일원화 → 다크 토큰 레이어 → 컴포넌트 이동 → opt-in 노출.** 시스템 하나씩 끊어서.

### 단계 0 — 사전 정리 (admin 안에서)
- [ ] admin GNB/사이드바의 `buildSystemSwitchUrl` 호출을 common `buildSystemPortalUrl` 로 교체.
  - 동작(새 탭 진입, wsId/sysId 부팅) 동일 검증. query vs slug-path 차이 확인(§3.2).
- [ ] `HeaderWorkspaceSwitcher` / `SidebarServiceList` 의 "admin 하드코딩"을 `currentSystemCode` 파라미터로 추출(§3.1).
- [ ] 워크스페이스 전환의 slug 부작용을 `onWorkspaceSwitch` 콜백으로 분리(§3.5).

### 단계 1 — 다크 토큰 레이어 common 승격 (테마 문서 TODO 와 공동)
- [ ] `index.css` 의 `:root[data-theme='dark']` 블록(토큰 override + 별칭 + 회색 반전)을 common 토큰 파일로.
- [ ] `theme-store` → common, 키 `admin_theme` → `vanta_theme`(마이그레이션 처리), `updateMyTheme` 는 common me-api 사용.
- [ ] 다크 토글 버튼을 common 의 재사용 컴포넌트(`ThemeToggleMenuItem` 등)로. 유저메뉴 슬롯에서 호출.
- [ ] 검증: 하위 시스템에서 `data-theme="dark"` 토글 시 헤더/사이드바/그리드/폼 전부 다크 전환(이미 common CSS 에 다크 규칙 존재).

### 단계 2 — GNB/사이드바 컴포넌트 common 이동
- [ ] `system-card-icons.tsx` → common (`renderSystemIcon`). 아이콘 SVG 팔레트/시스템 코드 매핑 정리.
- [ ] `HeaderWorkspaceSwitcher` → common. props: `currentSystemCode`, `onWorkspaceSwitch?`, (옵션) 데이터 출처.
  - `header-workspace-switcher.css`(`.hws*`) → common CSS, 다크 규칙 포함.
- [ ] `SidebarServiceList` → common. props: `currentSystemCode`, URL 빌더는 common.
  - `sidebar-service-list.css` → common CSS.
- [ ] 데이터 출처 통일: `servicePortalStore`(hydrate) 또는 common `useMyWorkspacesQuery` 중 하나로.
  (admin main.tsx 중복 `fetchMyWorkspaces` 정리도 이때 — 서비스 포털 문서 §4.2/§7.)

### 단계 2.5 — 알림 벨/수신함 common 이동 + 알림 base URL 분리 (§3.6)
- [ ] 알림 전용 axios 인스턴스(또는 base URL override) 를 common 에 추가. `VITE_ADMIN_API_BASE_URL` env.
  - common 싱글턴 인터셉터(토큰/리프레시/컨텍스트 헤더) 를 알림 인스턴스에도 적용(재사용 구조).
  - admin 은 env 미설정 시 자기 BE(default) 사용 → 동작 불변 검증.
- [ ] `NotificationBellV2` → common. 알림 API 호출이 알림 base URL 을 쓰도록.
- [ ] `Inbox` + `inbox-api.ts` + `notification-v2-query.ts` → common(또는 inbox API 만 common, 화면은 시스템별 유지 결정).
- [ ] 이관 범위는 **inbox 계열(수신/미읽음/읽음)만**. 알림 관리(템플릿/발송이력/대상자)는 admin 전용으로 유지.
- [ ] 새 탭 컨텍스트 전파(`?wsId=&sysId=`)·linkUrl 새 탭 열기 동작 유지 검증.

### 단계 3 — admin 을 common 소비로 전환 + 잔재 제거
- [ ] admin slots 가 common 컴포넌트를 주입하도록 변경(`headerWorkspaceArea: <CommonHeaderWorkspaceSwitcher currentSystemCode="admin" onWorkspaceSwitch={applySlug} />`).
- [ ] admin 에서 이동 완료된 파일 삭제: `system-fe-url.ts`(대체됐으면), `system-card-icons.tsx`,
  `HeaderWorkspaceSwitcher.tsx`, `SidebarServiceList.tsx`, 관련 CSS, `theme-store.ts`,
  `index.css` 다크 블록(common 으로 이동분).
- [ ] admin `me-api.ts`/`me-query.ts` 중복 제거(서비스 포털 문서 §4.3 — 호환 확인 후).

### 단계 4 — 하위 시스템 opt-in
- [ ] 각 시스템: `@vanta/common` 최신 버전 업.
- [ ] GNB 전환 UI 가 필요한 시스템만 슬롯 주입 + `autoHydratePortals`.
- [ ] 다크 토글은 유저메뉴에 공통 노출(시스템 무관).
- [ ] BE `/me/workspaces` 응답에 `code`/`deployed` 제공 확인(서비스 포털 문서 §5).

---

## 5. BE / 인프라 의존

- [ ] **`/me/workspaces` 의 `systems[]` 는 사용자 권한 시스템만** 내려준다 — GNB/사이드바의 단일 소스(§3.7).
  FE 는 권한 판정을 하지 않고 받은 목록만 렌더(자기 자신 숨김 제외).
- [ ] `/me/workspaces` 응답 `code`(시스템 코드) 필수 — URL 조립 소스(서비스 포털 문서 §5.1).
- [ ] `/me/workspaces` 응답 `deployed` 권장 — 미배포 시스템 안내(`ServicePortalNotReady`)용(서비스 포털 문서 §5.2).
- [ ] (선택) `/auth/me` 응답에 `theme` 추가 — 테마 서버 개인화 일원화(§3.4, 테마 문서 §4).
- [ ] 시스템별 호스트 컨벤션 확정 — `prd-admin.vanta.ai` vs `admin.vanta.ai`(서비스 포털 문서 §7).
- [ ] (slug 문서) slug URL 표준이 모든 시스템 라우터에 적용되는지 — wsId query 제거 가능 여부 판단(§3.2).
- [ ] **알림 BE CORS**: admin BE 가 하위 시스템 FE origin(genx/asset/4dx/vfx 등)의 `/notifications/inbox*` 요청을
  허용하도록 CORS 설정(§3.6). 인증 토큰·컨텍스트 헤더(`X-Workspace-Id`/`X-System-Id`) 포함 허용.
- [ ] 알림 base URL env(`VITE_ADMIN_API_BASE_URL`) 를 각 시스템 환경(.env.dev/stg/prd)에 배포.

---

## 6. 리스크 / 알려진 함정

- **이중 URL 전략(§3.2)**: 가장 큰 리스크. 먼저 일원화하지 않고 컴포넌트만 옮기면 시스템마다 링크가 깨진다.
- **admin 하드코딩(§3.1)**: `name === 'admin'` 필터/머무름 로직을 파라미터화하지 않으면 하위 시스템에서 오작동.
- **다크 토큰 미동반(§3.3)**: 컴포넌트만 옮기고 토큰 레이어를 안 옮기면 하위 시스템에서 다크가 안 먹는다.
- **slug 결합(§3.5)**: common 이 react-router basename 을 강제하면 라우팅 구조가 다른 시스템에서 깨질 수 있음 → 콜백으로 분리.
- **theme 키 충돌**: `admin_theme` → `vanta_theme` 변경 시 기존 사용자 설정 유실 방지(마이그레이션/병행 read).
- **`/me/workspaces` 중복 호출**: hydrate hook + admin main.tsx 가 둘 다 호출 — 이관 때 단일화.
- **알림 base URL 오염(§3.6)**: per-request `config.baseURL` override 가 common 싱글턴 `api.defaults.baseURL` 을
  영구 변경하면 이후 일반 API 가 admin BE 로 새는 치명적 부작용. **알림 전용 인스턴스로 격리** 권장.
- **알림 CORS/토큰**: 크로스 도메인(하위 FE → admin BE) 시 CORS·preflight·토큰 전파 누락하면 알림만 조용히 실패.
- **빌드/배포 순서**: common 변경은 dist 배포 후에만 소비 앱에 반영(그리드 다크 사례처럼). 단계 전환 시 배포 의존 명시.

---

## 7. 관련 변경 파일 (예상)

| 위치 | 파일 | 작업 |
|---|---|---|
| common | `src/components/layout/HeaderWorkspaceSwitcher.tsx` | 신규(admin 이관, 파라미터화) |
| common | `src/components/layout/SidebarServiceList.tsx` | 신규(admin 이관) |
| common | `src/components/layout/system-card-icons.tsx` | 신규(admin 이관) |
| common | `src/assets/styles/layout/header-workspace-switcher.css` | 신규(다크 포함) |
| common | `src/assets/styles/layout/sidebar-service-list.css` | 신규(다크 포함) |
| common | `src/components/layout/NotificationBellV2.tsx` | 신규(admin 이관, 알림 base URL 분리) |
| common | 알림 전용 axios 인스턴스 / base URL override | 신규(`VITE_ADMIN_API_BASE_URL`, §3.6) |
| common | `src/api/notification/inbox-api.ts` + inbox query | 신규(admin 이관, inbox 계열만) |
| common | `src/store/theme-store.ts` | 신규(키 중립화) |
| common | 테마 토큰 파일(`color-semantic.css` 등) | `[data-theme='dark']` 레이어 추가 |
| common | `src/utils/system-portal-url.ts` | URL 단일 진입점 확정(query/slug 정리) |
| common | `src/index.ts` | export 갱신 |
| admin | `src/routes/index.tsx` | 슬롯을 common 컴포넌트로 주입 |
| admin | `HeaderWorkspaceSwitcher/SidebarServiceList/system-card-icons/theme-store/system-fe-url` | 삭제(이관 후) |
| admin | `src/index.css` 다크 블록 | common 으로 이동분 제거 |
| admin | `me-api.ts`/`me-query.ts` | 중복 제거 검토 |
