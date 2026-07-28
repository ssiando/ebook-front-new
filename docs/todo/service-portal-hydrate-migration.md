# 서비스 포털 카탈로그 — 현재 구현 기록 & common 이관 계획

> 작성일: 2026-06-15
> 상태: **`@vanta/common` 에 기능 + admin 에서 opt-in 적용.** 하위 시스템(genx/asset/4dx 등)은
> GNB 시스템 전환 UI 가 없어 비활성화 상태. 추후 이관 시 시스템별로 opt-in.
> 연관 문서:
> - [워크스페이스 slug URL 마이그레이션](./workspace-slug-url-migration.md)
> - [다크 테마 마이그레이션](./theme-dark-mode-migration.md)

---

## 1. 목적

GNB 시스템 전환 레이어(`ServiceListLayer`)에 표시할 워크스페이스/시스템 카탈로그를 **API 한 곳에서만** 받고, 환경별 호스트와 워크스페이스 slug 를 자동 조립해 새 탭으로 전환한다.

### URL 컨벤션

```
local           : http://localhost:{port}/{slug}
dev/stg/prd     : https://{env}-{system}.vanta.ai/{slug}
```

- system: `cm_system_std.cd` (대소문자 무관, host 에는 소문자)
- slug  : `cm_workspace_bas.slug` (URL `:workspace` segment 와 동일 값)
- env   : 현재 호스트명으로 추론 — `resolveCurrentEnv()`

---

## 2. 배경 — 왜 common 인가

- 하위 시스템들도 동일한 환경 분기 / slug prefix 가 필요.
- 시스템마다 별도 URL 매핑 코드를 갖는 건 중복 + 환경 일관성 문제.
- `@vanta/common` 의 `buildSystemPortalUrl` 1개로 모든 시스템 host/slug 조립을 표준화.

`/me/workspaces` 호출도 admin → common 으로 승격: 하위 시스템들이 같은 API 를 그대로 쓰면 BE 변경 없이 카탈로그 표시 가능.

---

## 3. 현재 구현 (`@vanta/common`)

### 3.1 URL resolver

- `src/utils/system-portal-url.ts`
  - `PortalEnv` = `'local' | 'dev' | 'stg' | 'prd'`
  - `resolveCurrentEnv(host?)` — 호스트명으로 추론
    - `localhost` / `127.x` / `*.local` → `'local'`
    - `{env}-{system}.vanta.ai` → `env`
    - 그 외 `.vanta.ai` → `'prd'` (fallback)
  - `buildSystemPortalUrl({ env, systemName, workspaceSlug?, localPorts?, subPath? })`
    - `local`: `http://localhost:{ports[systemName]}/{slug}` (포트 매핑 없으면 `location.origin`)
    - `dev/stg/prd`: `https://{env}-{systemName}.vanta.ai/{slug}{subPath}`

### 3.2 API (`/me/workspaces` 승격)

- `src/api/me-api.ts`
  - `fetchMyWorkspaces()` → `MeWorkspaceResponse[]` (`workspaceId`, `name`, `slug`, `systems[]`)
  - `MeSystemSummary`: `systemId`, `code?`, `name`, `description?`, `deployed?`
  - `switchWorkspace()`, `updateMyTheme()` 도 같이 승격 (admin 의 동일 함수와 1:1)

### 3.3 자동 hydrate hook

- `src/hooks/use-hydrate-service-portals.ts`
  - `useHydrateServicePortals(enabled?: boolean)`
  - `enabled === true` 일 때만 mount 시 1회 `/me/workspaces` 호출
  - 응답 → `ServicePortalEntry[]` 매핑(systemId 기준 dedup) → `servicePortalStore.setPortals(...)`
  - 이미 채워져 있으면 skip (소비 앱이 직접 `setPortals` 한 경우 자동 양보)
  - 실패는 silent (페이지 동작 영향 없음, GNB 카탈로그만 비어보임)

### 3.4 `MainLayout` opt-in

- `MainLayoutProps.autoHydratePortals?: boolean` (기본 `false`)
  - `true` 일 때만 hook 활성화
  - GNB 시스템 전환 UI 가 있는 앱만 켠다 (admin 등)
  - 하위 시스템(vfx/4dx/aion 등)은 해당 UI 가 없으므로 끈 채로 둬도 영향 없음

### 3.5 `ServiceListLayer` navigation

- 클릭 시 `buildSystemPortalUrl({ env, systemName: portal.code, workspaceSlug: ws.slug })` 로
  최종 URL 을 재조립. workspaceSlug 가 없으면 entry 의 base `portalUrl` 그대로.
- `openInNewTab` 이면 `window.open(..., '_blank', 'noopener,noreferrer')`

### 3.6 제거된 것

- `src/config/service-portal-defaults.ts` (`TODO_SERVICE_PORTAL_DEFAULTS`)
  - API 가 항상 응답을 줄 것이므로 hardcoded fallback 불필요.
  - export 도 제거. 기존 사용처는 admin 의 ServiceListLayer 1곳뿐이었고 hook 이 대체.

---

## 4. 현재 적용 (admin)

### 4.1 `routes/index.tsx`

```tsx
<MainLayout
  routes={mainLayoutOutletRoutes}
  slots={mainLayoutSlots}
  autoHydratePortals
/>
```

→ admin 진입 시 `useHydrateServicePortals(true)` 발동 → `/me/workspaces` 1회 호출 → 카탈로그 채워짐.

### 4.2 admin 의 기존 `main.tsx fetchMyWorkspaces`

- `workspace-directory-store` 채우기 / 워크스페이스/시스템 이름 보강용으로 main.tsx 에서 별도로 호출 중.
- common hook 은 `portals` 이 비어있을 때만 호출하므로 둘이 충돌하지 않음. 다만 동일 endpoint 를 2번 치는 cost 가 있으니, 추후 정리할 가치는 있음. (긴급도 낮음)

### 4.3 admin 의 local me-api.ts

- common 의 `me-api.ts` 와 함수 동일 (admin 쪽이 먼저 있던 원본). 시그니처 호환되므로 admin 코드는 그대로 두고, 점진적으로 `import` 를 `@vanta/common` 으로 옮긴다. **현 단계에서 admin 의 me-api.ts 를 지우지 않는다** (중복이지만 호환).

---

## 5. BE 요구사항

### 5.1 `/me/workspaces` 응답에 `code` 필수

```json
{
  "workspaceId": 100,
  "name": "CJ Workspace",
  "slug": "cj4dplex",
  "systems": [
    { "systemId": 1, "code": "ADMIN", "name": "관리자", "deployed": true },
    { "systemId": 2, "code": "VFX",   "name": "VFX",     "deployed": false }
  ]
}
```

- `code`(= `cm_system_std.cd`) 가 host 조립의 source. **현재 admin 의 `MeSystemSummary` 에는 없음** → BE 응답에 추가 필요.
- `code` 누락 시 hook 은 `name` 으로 fallback 하지만, name 이 한글/표시명이면 URL 깨짐.

### 5.2 `deployed` 필드

- 미지정 시 `true` 로 간주. 미배포 시스템 안내는 BE 가 `deployed: false` 를 내려주면 그대로 GNB 에서 ServicePortalNotReady 안내.

---

## 6. 하위 시스템 이관 체크리스트 (내일~)

각 시스템(genx/asset/4dx/aion/desk/vfx/sx 등):

- [ ] `@vanta/common` 최신(>= 0.1.239) 버전으로 업그레이드
- [ ] GNB 에 ServiceListLayer / WorkspaceSwitcher 를 띄우는지 확인
  - [ ] 띄운다 → `<MainLayout autoHydratePortals .../>` 로 켜기
  - [ ] 안 띄운다 → 그대로 두기 (영향 없음)
- [ ] BE `/me/workspaces` endpoint 제공 여부 확인 — 없으면 silent fail (GNB 카탈로그 비어보임)
- [ ] 로컬 개발 시 시스템별 포트 매핑이 필요하면 `buildSystemPortalUrl` 의 `localPorts` 옵션 사용

---

## 7. 미정/추후 결정

- prd 환경의 host 가 `prd-admin.vanta.ai` 인지 `admin.vanta.ai` 인지 운영팀 확정 후 `buildSystemPortalUrl` 분기 추가 가능.
- `'4DX'` 같은 시스템 코드의 host segment 매핑 — 현재 소문자 변환만 (`4dx.vanta.ai`). 별도 alias 가 필요하면 매핑 테이블 추가.
- admin main.tsx 의 중복 `fetchMyWorkspaces` 호출 정리 (긴급도 낮음).

---

## 8. 관련 변경 파일

| 위치 | 파일 | 종류 |
|---|---|---|
| common | `src/utils/system-portal-url.ts` | 신규 |
| common | `src/api/me-api.ts` | 신규 (admin → 승격) |
| common | `src/hooks/use-hydrate-service-portals.ts` | 신규 |
| common | `src/components/layout/MainLayout.tsx` | `autoHydratePortals` prop 추가 |
| common | `src/components/layout/ServiceListLayer.tsx` | navigation 시 resolver 사용 |
| common | `src/config/service-portal-defaults.ts` | 삭제 |
| common | `src/store/service-portal-store.ts` | 주석 갱신 (동작 변화 없음) |
| common | `src/index.ts` | export 갱신 |
| admin | `src/routes/index.tsx` | `<MainLayout autoHydratePortals />` |
