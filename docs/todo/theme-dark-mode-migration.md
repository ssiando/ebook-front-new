# 다크 테마(토큰화) — 현재 구현 기록 & common 이관 계획

> 작성일: 2026-06-15
> 상태: **admin-front 에 구현 + 일부 common CSS 에 다크 override 추가됨.** 다른 시스템(genx/asset/4dx 등)에도
> 동일하게 필요하므로 추후 정리해 `@vanta/common` 의 표준 테마 레이어로 승격 예정.
> 연관 문서: [워크스페이스 slug URL 마이그레이션](./workspace-slug-url-migration.md)

---

## 1. 목적 / 원칙

라이트/다크 테마를 토글하고, **모든 UI 가 테마를 따라가도록** 한다.

핵심 원칙(이관을 쉽게 하기 위함):

- **토큰 우선**: 컴포넌트 CSS 는 하드코딩 색 대신 시맨틱 토큰(`--color-*`, `--bg-white`, `--text`, `--dg-*` 등)을 참조한다.
- **라이트 = 기본값**, **다크 = `:root[data-theme='dark']` override**. 컴포넌트는 토큰만 보므로 override 한 곳만 바꾸면 전체 전환.
- 강제 `!important` / 하드코딩은 최소화. (불가피한 다크 전용 값은 `[data-theme='dark']` 스코프 안에서만)
- 토글 상태는 `localStorage` + 사용자 개인화(`PATCH /me/theme`)에 저장.

---

## 2. 동작 메커니즘

- `theme-store`(admin) 가 `document.documentElement` 의 `data-theme="light|dark"` 속성을 토글한다.
- 모든 CSS 의 다크 규칙은 `:root[data-theme='dark']` 셀렉터 기준.
- portal 로 body 에 렌더되는 요소(toast, 그리드 툴팁, 서비스 팝업 등)도 `documentElement` 의 속성을 상속하므로 동일하게 적용.

---

## 3. 현재 구현 (admin)

### 3.1 테마 store / 토글

- `src/store/theme-store.ts` (신규)
  - `theme`('light'|'dark'), `toggleTheme()`, `setTheme()`
  - `localStorage('admin_theme')` 저장 + `applyTheme()` 로 `data-theme` 반영 + 모듈 로드시 즉시 적용(FOUC 최소화)
  - `setTheme` 시 `updateMyTheme(theme)` 로 `PATCH /me/theme` 호출(fire-and-forget)
- `src/api/me-api.ts` — `updateMyTheme(theme)` 추가 (BE: `PATCH /api/v1/me/theme`, 이미 존재)
- `src/components/layout/MainLayoutUserMenuSlot.tsx` — 프로필 드롭다운에 다크/라이트 토글 버튼
- `src/main.tsx` — `import '@/store/theme-store'` (부트시 저장 테마 적용)
- `src/App.tsx` — `<Toaster>` 에 토큰 기반 스타일(`var(--bg-white)`, `var(--text)`, `var(--border)`)

### 3.2 다크 토큰 레이어 — `src/index.css` `:root[data-theme='dark']`

이관 시 **이 블록이 common 테마 레이어의 핵심**이 된다.

- **Tailwind @theme 토큰**: `--color-bg`, `--color-bg-white`, `--color-text`, `--color-text-heading`,
  `--color-border`, `--color-primary-light`, `--color-text-muted`
- **컴포넌트 참조 별칭**: `--text`, `--text-h`, `--bg`, `--bg-white`, `--border`, `--code-bg`,
  `--text-heading`, `--text-muted`, `--text-secondary`, `--bg-hover`, `--primary`
  - (이 별칭들이 없으면 `var(--text-heading, #111)` 처럼 라이트 fallback 으로 떨어져 다크에서 검정 텍스트가 남는다)
- **회색 프리미티브 스케일 반전**: `--color-gray-25 … --color-gray-980` 을 다크용으로 뒤집음.
  폼 disabled(`--color-gray-100/400`), hover, 툴팁 등 프리미티브 회색을 직접 쓰는 컴포넌트가 한 번에 전환됨.
- **레이아웃 다크 보정**(스코프 셀렉터): `.vc-main-layout__main` 배경, `.vc-main-layout__sidebar/.vc-sidebar`
  상단 블루 글로우, `.vc-sidebar__nav { flex: 0 1 auto }`(서비스 목록을 메뉴 바로 아래로), 사이드바 hover 등

### 3.3 admin 컴포넌트

- `src/components/layout/SidebarServiceList.tsx` + `sidebar-service-list.css` — 테마 변수 기반(라이트/다크 자동)
- `src/assets/styles/layout/header-workspace-switcher.css` — 드롭다운 배경/hover 토큰화
- `src/assets/styles/pages/notification/templates.css` — 미리보기 `__body` 흰배경 → `var(--bg-white)` (이메일 iframe 은 실제 이메일이라 흰색 유지)
- `src/assets/styles/pages/home.css` — 메인(시스템 선택) 라이트=흰색/다크=블루 그라데이션
- 샘플 페이지 전반 — 하드코딩 색을 테마 토큰으로 교체
  - `bg-white`→`bg-bg-white`, `border-gray-*`→`border-border`,
    `text-gray-400/500/600`→`text-text`, `text-gray-700/800`→`text-text-heading`,
    `bg-gray-50/100/200`→`bg-bg`, `bg-[#f5f5f7]`→`bg-bg`, `text-[#1d1d1f]`→`text-text-heading`,
    `text-[rgba(0,0,0,…)]`→`text-text-muted`
  - 의도적 다크 콘솔(`#1a1a2e`/`#a9b7c6`), 블루 accent(`#0071e3`)는 양 테마 정상이라 유지

### 3.4 common CSS 다크 override (이미 common 에 추가됨 — 이관의 "이미 된 부분")

> 아래는 admin 이 아니라 `@vanta/common` 소스에 직접 들어간 변경이다. 다른 시스템에도 영향(라이트 기본,
> 다크는 `data-theme` 토글 시에만). 이관 정리 시 이 변경들을 테마 레이어로 일원화한다.

- `layout/app-header.css` — `:root[data-theme='dark']` 헤더 바/유저메뉴/드롭다운 + 텍스트 명시 반전
- `layout/service-list-layer.css` — 서비스 팝업 다크(패널 var 기반 + hover/텍스트 명시 반전)
- `layout/sidebar.css` — active 메뉴를 그라데이션 + 좌측 엣지 + 앞 점(라이트 accent / 다크 흰점)으로 (라이트·다크 공통 디자인)
- `layout/tab-bar.css` — 검은 muted 텍스트 `rgba(0,0,0,…)` → `var(--color-text-muted, …)`
- `components/tooltip.css` — 다크 툴팁 배경 고정
- `components/loading.css` — 로딩 카드 `white` → `var(--color-bg-white)`
- `components/form/form.css`, `form-tiptap.css` — disabled/배경 `white`/`--color-gray-*` 토큰화(+ 회색 반전으로 자동 전환)
- `components/data-grid/*` — DataGrid 전반:
  - `grid.css` `--dg-*` 토큰 다크 override(surface/text/border/bg/accent) + `.vc-dg` 배경 토큰화
  - 선택/포커스/멀티/범위/드롭/행상태/체크 등 가시성 보정(다크 accent #3b9bff 기반)
  - `white`→`var(--dg-bg-white)`, `color: rgba(0,0,0,…)`→`var(--dg-text-muted)` 토큰화
  - `renderer.css` 체크박스 미체크 테두리 다크 보정
  - `cell.css` 행 hover 다크
  - 그리드 툴팁 다크
- `components/common/Chart.tsx` — **모든 echarts** 다크 가독성: 다크일 때 title/축 라벨/축선/splitLine/legend
  텍스트 색을 옵션 위에 덮어써 강제(개별 차트가 어두운 색을 하드코딩해도 보이게) + tooltip/기본 textStyle 다크

### 3.5 책임 경계 — common 이 가진 것 / 못 가진 것 (2026-06-16 재점검, 정정)

> 이전 기록에서 "배포본 dist 에 다크가 ~1개뿐"이라 했는데 **오판이었다**. dist 는 minify 되어 한 줄이라
> `grep -c`(줄 수)가 1로 나왔을 뿐, 실제 `data-theme=dark` 규칙은 **48개**(그리드 15 + 헤더 8 + 사이드바 3 등)다.
> 즉 **common 0.1.242 는 컴포넌트 다크 CSS 와 `--dg-*` 다크 토큰을 이미 배포하고 있다.** (그리드 다크 OK)

진짜 문제는 **토큰 엔진의 책임 경계가 어긋나 있다**는 것이다. common 은 자체 토큰 파일
(`src/assets/styles/tokens/colors.css` 등)을 갖고 일부 별칭을 정의하지만, 일부는 빠져 admin 이 메우고 있다.

| 토큰/레이어 | common 0.1.242 (배포본) | admin `index.css` |
|---|---|---|
| 라이트 별칭 `--text` `--text-h` `--bg-white` `--border` `--accent` `--primary` | ✅ 정의 | ✅ **중복 정의**(충돌 소지) |
| 라이트 별칭 `--text-heading` `--text-muted` `--text-secondary` `--bg-hover` | ❌ **없음** | ✅ admin 이 정의(2026-06-16 추가) |
| 다크 토큰 엔진 — `:root[data-theme='dark']` 의 `--color-bg`/`--bg-white`/`--text` override | ❌ **없음** | ✅ admin 전용 |
| 다크 회색 반전 `--color-gray-*` | ❌ **없음** | ✅ admin 전용 |
| 컴포넌트 다크 CSS(헤더/사이드바/그리드 등) | ✅ 있음(48 규칙) | — |
| `--dg-*` 다크 토큰 | ✅ 있음 | ✅ **중복**(값 동일, fallback) |

**핵심 결론**

- common 은 컴포넌트 다크 CSS 는 가졌지만 **그 CSS 가 참조할 "토큰 엔진"(색/회색/일부 별칭의 라이트·다크 정의)이 불완전**하다.
  그래서 다크 동작은 admin 의 `index.css` 토큰 엔진에 의존한다 → **하위 시스템은 토큰 엔진 부재로 다크가 안 된다.**
- 또한 라이트 별칭 `--text-heading` `--text-muted` `--bg-hover` 가 common 에 없어, admin 컴포넌트 CSS 가 이를
  참조하면 **라이트에서 미정의 → 텍스트가 검게(fallback `#111`)·안 보이거나 primary UI 가 깨졌다**.
  admin `index.css` 라이트 `:root` 에 이 별칭들을 추가해 **임시로** 해결했다(아래 §5, 이관 대상).
- 라이트 별칭 일부(`--text`/`--primary` 등)는 common 과 admin 이 **이중 정의**한다 — 로드 순서에 따라 한쪽이 이김.
  이관 시 common 단일 소스로 정리해야 한다.

**→ 이관 시 할 일**: 토큰 엔진(라이트 별칭 완비 + 다크 색/회색/별칭 override)을 **common 으로 일원화**하고,
admin 의 중복·임시 정의를 제거한다(§4 / §5).

---

## 4. common 이관 시 할 일 (TODO)

- [ ] **토큰 엔진을 common 으로 일원화**(§3.5):
  - 라이트 누락 별칭 `--text-heading` `--text-muted` `--text-secondary` `--bg-hover` 를 common
    `tokens/colors.css`(라이트 `:root`)에 추가. (현재 admin 임시 보유)
  - 다크 토큰 엔진 — `:root[data-theme='dark']` 의 `--color-bg`/`--bg-white`/`--text` 등 색 override + 회색 반전
    (`--color-gray-*`) + 별칭 다크값 — 을 common 으로 이동. (현재 admin 전용 → 하위 시스템 다크의 전제)
  - 라이트 별칭 이중 정의(`--text`/`--primary`/`--bg-white` 등 common+admin 양쪽) 를 common 단일 소스로 정리.
  - `--dg-*` 다크는 이미 common 에 있으므로 admin 의 중복 `--dg-*` 블록 제거.
- [ ] **테마 store/토글 공통화**: `theme-store`, `applyTheme`, 토글 UI 를 common 으로. `data-theme` 토글 표준화.
  - 초기 테마 출처: 현재 localStorage. `/auth/me` 응답에 `theme` 를 포함시키면 서버 개인화로 일원화 가능
    (현재 `/auth/me` 에 theme 없음 → 추가 검토).
- [ ] **common CSS 의 산발적 다크 override 일원화**: 위 3.4 의 파일별 `[data-theme='dark']` 블록을
  토큰 기반으로 정리(가능한 것은 토큰 반전만으로 처리, 다크 전용 리터럴 최소화).
- [ ] **DataGrid `--dg-*` 토큰을 전역 테마 토큰과 연결**(중복 정의 제거 검토).
- [x] **Chart 토큰화 + 라이브 토글**(2026-06-16, common `Chart.tsx`): 축/범례/제목/툴팁 색을 CSS 토큰
  (`--text`/`--text-h`/`--border`)에서 읽어 **라이트·다크 모두** 적용. 라이트에서 축 텍스트가 안 보이던 문제
  (다크 흰색 라벨이 머지 모드로 잔존)와 토글 잔상 해소. ⚠️ common 재빌드/배포 필요(§3.5).
- [ ] **샘플 외 실제 화면 잔여 하드코딩 색 스윕**(필요 시): `bg-white` 리터럴/`rgba(0,0,0,…)`/회색 hex 점검.
- [ ] **common 색 토큰 파일 확보**: common 이 `color-primitives.css`/`color-semantic.css` 를 보유/배포하도록(현재 admin 소유). 토큰 엔진 승격의 전제(§3.5-(1)).
### 이관 후 admin 에서 제거/이동할 것 (현재 admin 임시 보유 — §3.5)

- `src/store/theme-store.ts` → common (또는 토글 UI 만 admin 유지)
- `src/index.css` 라이트 `:root` 의 임시 별칭 `--text-heading` `--text-muted` `--text-secondary` `--bg-hover` `--primary`
  → common `tokens/colors.css` 로 (공통화 후 admin 에서 삭제)
- `src/index.css` 의 `:root[data-theme='dark']` 블록(색 override + 회색 반전 + 별칭) → common 테마 레이어
- `src/index.css` 의 `--dg-*` 다크 중복 블록 → common 에 이미 있으므로 **삭제**
- admin 이 common 과 이중 정의하는 라이트 별칭(`--text`/`--primary`/`--bg-white` 등) → common 단일 소스로 정리

---

## 5. 퍼블리셔 작업 위치 (어디를 수정하나)

> **대원칙: 색은 "토큰"만 바꾼다.** 컴포넌트 CSS 를 직접 고치지 말고, 라이트는 기본 토큰값, 다크는
> `:root[data-theme='dark']` 의 토큰 override 만 손대면 그 토큰을 쓰는 모든 화면이 한 번에 바뀐다.
> 컴포넌트 CSS 를 여는 건 "토큰으로 안 잡히는 하드코딩 색이 남아있을 때"의 예외 작업이다.

### 5.1 색 토큰 (가장 먼저 — 90%는 여기서 끝)

| 무엇을 | 파일 | 블록 |
|---|---|---|
| **라이트 기본 색** | [src/index.css](../../src/index.css) | `@theme { … }` (Tailwind 토큰) + `:root { … }` (별칭) |
| **다크 색 override** | [src/index.css](../../src/index.css) | `:root[data-theme='dark'] { … }` |
| 원시 색 팔레트 | `src/assets/styles/tokens/color-primitives.css` | gray/blue 등 raw 색 |
| 시맨틱 매핑 | `src/assets/styles/tokens/color-semantic.css` | 용도별 색 |

- 예) "다크 배경을 더 어둡게" → `:root[data-theme='dark']` 의 `--color-bg`, `--bg`, `--color-bg-white`, `--bg-white` 수정.
- 예) "다크 본문 글자색" → 같은 블록의 `--color-text`, `--text` 수정.
- **회색 반전 주의**: 다크 블록의 `--color-gray-25 … 980` 은 라이트와 **반대로** 둔다(밝은 회색=배경, 어두운 회색=텍스트).
  폼 disabled/hover/툴팁 등이 이 회색을 직접 참조하므로, 개별로 고치지 말고 이 스케일만 조정하면 일괄 반영된다.

### 5.2 토큰으로 안 잡히는 컴포넌트별 다크 (예외 — 하드코딩 색 보정)

토큰만으로 해결 안 되는(원래 하드코딩 색이 박혀 있던) 곳은 해당 CSS 의 `:root[data-theme='dark']` 블록에서 보정한다.
**대부분 이미 처리돼 있으니, 새로 깨진 곳이 보일 때만 연다.**

- admin 화면 CSS:
  - `src/assets/styles/pages/home.css` — 홈(시스템 선택) 배경 그라데이션(라이트=흰색/다크=블루)
  - `src/assets/styles/layout/header-workspace-switcher.css` — GNB 드롭다운
  - `src/assets/styles/layout/sidebar-service-list.css` — 사이드바 서비스 목록
  - `src/assets/styles/pages/notification/templates.css` — 알림 템플릿 미리보기(이메일 iframe 은 흰색 유지)
- common 컴포넌트 CSS(공통, **수정 시 common 재빌드·배포 필요** — §3.5):
  - `layout/app-header.css`, `layout/sidebar.css`, `layout/service-list-layer.css`, `layout/tab-bar.css`
  - `components/tooltip.css`, `components/loading.css`
  - `components/form/form.css`, `components/form/form-tiptap.css`
  - `components/data-grid/grid.css`(`--dg-*` 토큰), `data-grid/cell.css`, `data-grid/renderer.css`

### 5.3 퍼블리셔가 직접 만지기 어려운 곳 (개발자 영역)

- **차트(echarts)**: `components/common/Chart.tsx` — 색이 JS 옵션에 들어가서 CSS 로 못 바꾼다. 축/범례/툴팁 색은 개발자가 처리.
- **테마 토글 동작/저장**: `src/store/theme-store.ts`(localStorage·`data-theme` 토글) — 로직이라 개발 영역.

### 5.4 확인 방법

1. 브라우저 devtools 에서 `<html>` 의 `data-theme` 가 `dark`/`light` 로 바뀌는지 확인.
2. 색을 바꿨는데 안 먹으면 → 그 요소가 **토큰이 아니라 하드코딩 색**을 쓰는 것. §5.2 에서 해당 CSS 의 다크 블록 보정.
3. common CSS 를 고쳤는데 admin/타 시스템에 반영 안 됨 → **common 재빌드·배포 + 버전 업** 필요(§3.5-(2)).

---

## 6. 알려진 한계

- **common 배포 의존(중요)**: 그리드 등 common 컴포넌트의 다크는 common dist 배포에 달려 있다. 현재 다크 소스가
  배포본(dist)에 안 실려 있어(§3.5), DEV 그리드 보정용으로 admin `index.css` 에 `--dg-*` 토큰 + `.vc-dg` 배경을
  **임시 복제**해 둔 상태다. common 재빌드/배포 + admin 의존 버전 업 후 이 복제는 **제거 대상**이다.
- **하위 시스템 다크 미동작**: 토큰 엔진이 admin 에만 있어(§3.5-(1)), 하위 시스템은 토글해도 다크가 안 된다.
  토큰 엔진 common 승격 전까지는 admin 로컬만 정상.
- **차트 라이브 토글**: 토큰화로 대부분 해소(축/범례/제목/툴팁 색은 토글 시 재계산되어 즉시 반영).
  단 series 자체 색을 차트가 하드코딩한 경우는 여전히 그대로다(공통 팔레트 사용 권장).
- **이메일 미리보기 iframe**: 실제 이메일 WYSIWYG 라 흰색 유지(의도).
- **로그아웃/게스트**: 다크에서 로그아웃 시 헤더 등 일부가 잠깐 다크로 보일 수 있음(기능 영향 없음).
