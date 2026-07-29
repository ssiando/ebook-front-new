# 다국어 선택(Locale Switch) — `@vanta/common` 이관 계획

> 작성일: 2026-06-23
> 상태: **계획 단계.** admin 에 다국어 선택 모달 + 로케일 변경 API + 메뉴/탭 다국어 적용 흐름이 구현되어 동작 중이다.
> 현재는 admin 한정으로 운영하고, 추후 동일 흐름을 `@vanta/common` 으로 승격해 하위 시스템(GENX·ASSET·4DX·VFX·AION 등)도 동일하게 동작하도록 한다.
> 연관 문서:
>
> - [GNB · 사이드바 · 다크모드 이관](./gnb-sidebar-common-migration.md) — 동일한 "admin → common 승격" 패턴 참고
> - [서비스 포털 hydrate 이관](./service-portal-hydrate-migration.md) — `me-api.ts` common 승격 사례 (이번 작업이 같은 파일에 함수 추가)

---

## 1. 목적

admin 에만 구현된 아래 다국어 선택 흐름을 `@vanta/common` 으로 끌어올려, **하위 시스템도 동일한 모달 · API · 메뉴 라벨 자동 갱신**을 코드 중복 없이 갖게 한다.

1. **다국어 선택 모달** (`LocaleSelectionModal`)
2. **로케일 변경 API** (`updateMyLocale` / `fetchLocales` / `fetchProgramTree`)
3. **탭 라벨 자동 동기화** (메뉴 트리가 새 로케일로 갱신될 때 열린 탭도 따라옴)

---

## 2. 현재 구조 (admin 한정 동작)

### 2.1 admin-back (도메인 책임 — common 외)

| 항목                           | 위치                                                                                 | 비고                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PATCH /me/locale`             | `api/me/controller/MeController`                                                     | preferredLocale 저장 + Redis 인가 캐시 evict (`AuthContext.getSubject()` + `user.getKeycloakSub()` 양쪽 evict)                                                      |
| `GET /system/locales`          | `api/locale/controller/LocaleController`                                             | `cm_locale_std` 전체. 화면에서 `isActive=true` 만 사용                                                                                                              |
| `GET /me/programs` 다국어 응답 | `api/me/service/MeProgramQueryService`                                               | `authz.getPreferredLocale()` 기반 메뉴 트리 라벨 반환. `ProgramI18nMappingRepository.findLocalizedNames` 가 `cm_program_bas.i18n_key_id → cm_i18n_message_dtl` 조회 |
| i18n 시드                      | `db/migration/V64__seed_program_i18n_mapping.sql`, `V65__seed_program_page_i18n.sql` | `program.<cd>.name` 키 + 4개국어 메시지 + `cm_program_bas.i18n_key_id` UPDATE                                                                                       |

> 이 BE 책임은 **admin 도메인**이므로 common 으로 옮기지 않는다. 다른 시스템 BE 가 같은 endpoint 를 제공하거나 admin-be 로 라우팅하는 결정이 본 이관의 **전제 조건**이다 (§5 참조).

### 2.2 admin-front (이관 대상)

| 파일                                                                                                     | 역할                                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/components/layout/LocaleSelectionModal.tsx`                                                         | 프로필 배지 → "다국어 선택" 모달 (Modal/Button/FormSelect 사용, react-hook-form 기반) |
| `src/assets/styles/layout/locale-selection-modal.css`                                                    | `.locale-selection-modal__*` 스타일                                                   |
| `src/api/locale-api.ts`                                                                                  | `fetchLocales()` + `LocaleResponse` 타입                                              |
| `src/api/program-tree-api.ts`                                                                            | `fetchProgramTree(systemId?)`                                                         |
| `src/api/me-api.ts` 의 `updateMyLocale(preferredLocale)`                                                 | PATCH /me/locale 호출 (응답 204)                                                      |
| `src/locales/{ko,en}/common.json` 의 `common.locale.*`, `common.btn.apply`, `common.nav.localeSelection` | i18n 메시지 카탈로그                                                                  |
| (호출부) `AppHeader` 또는 프로필 메뉴의 모달 트리거                                                      | 클릭 핸들러                                                                           |

### 2.3 common 에 이미 있는 것 (재사용 인프라)

- `Modal`, `Button`, `FormSelect` (FormSelectOption) — UI 부품
- `useAuthStore` (`user.preferredLocale` 보관), `useProgramStore` (`setProgramTree`)
- `LabelI18nSync` provider (`user.preferredLocale` watch → `i18n.changeLanguage`)
- `me-api.ts` (`fetchMyWorkspaces`, `switchWorkspace`, `updateMyTheme`) — `updateMyLocale` 만 추가하면 같은 파일에 자연스럽게 합류
- `useTabStore` — `TabItem.label` 보관 (이관 시 lookup 로직 추가 필요, §4.4)

### 2.4 admin 동작 흐름 (이관 후에도 동일)

```
프로필 배지 클릭 → LocaleSelectionModal 오픈
  → FormSelect 로 로케일 선택 → 적용 클릭
  → updateMyLocale(preferredLocale)  ← PATCH /me/locale (204)
     · BE: cm_user_bas.preferred_locale UPDATE
     · BE: Redis 인가 캐시 (user:{sub}:authz) evict
  → authStore.updateUser({...user, preferredLocale})
  → i18n.changeLanguage(preferredLocale)  ← LabelI18nSync 가 자동 트리거하지만 race 방지 명시 호출
  → fetchProgramTree(undefined)  ← GET /me/programs (새 로케일 hydrate 된 캐시 사용)
  → setProgramTree(programs)
  → 사이드바 메뉴 라벨 / (탭 라벨, 옵션 A 적용 후) 새 로케일 표시
```

---

## 3. 이관 대상 — 행선지

| admin-front 파일                                      | common 행선지                                              | 변경                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `components/layout/LocaleSelectionModal.tsx`          | `components/layout/LocaleSelectionModal.tsx`               | 그대로 이동. import 경로(`@/api/...` → 새 common 위치) 조정 |
| `assets/styles/layout/locale-selection-modal.css`     | `assets/styles/layout/locale-selection-modal.css` (common) | 그대로 이동                                                 |
| `api/locale-api.ts`                                   | `api/locale-api.ts` (common)                               | 그대로 이동. `@vanta/common` 의 http/ApiResponse 사용       |
| `api/program-tree-api.ts`                             | `api/program-tree-api.ts` (common)                         | 그대로 이동                                                 |
| `api/me-api.ts` 의 `updateMyLocale`                   | common `api/me-api.ts` 에 함수 추가                        | 시그니처 동일                                               |
| `locales/{ko,en}/common.json` 의 `common.locale.*` 키 | common `locales/{ko,en}/common.json`                       | 키 통째로 이동, admin 측 중복 키 제거                       |

### admin-front 정리 (이관 후)

- 위 4개 파일 삭제 (`LocaleSelectionModal.tsx`, `locale-selection-modal.css`, `locale-api.ts`, `program-tree-api.ts`)
- admin `me-api.ts` 에서 `updateMyLocale` 제거
- admin `common.json` 의 `common.locale.*` 키 제거
- 호출부 import 경로를 `@vanta/common` 으로 교체

---

## 4. 이관 시 고려 사항

### 4.1 i18n 키 충돌

admin 의 `common.btn.apply` / `common.nav.localeSelection` 이 다른 admin 화면에서도 쓰이면 common 으로 옮긴 뒤에도 동일 키로 접근 가능 (네임스페이스 동일). 다만 admin 측 catalog 에 같은 키가 남아있으면 우선순위 충돌이 날 수 있으므로 admin 에서 제거.

### 4.2 호출 endpoint base URL

공용 모달이 하위 시스템에서 호출될 때 어떤 BE 에 도달할지 명확히 해야 한다.

| 옵션                                                                | 설명                                                                                                                                                              | 결정 필요 시점          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| (a) 각 시스템 BE 에 동일 endpoint 구현                              | VFX-be / GENX-be 등이 `/me/locale`, `/system/locales`, `/me/programs` 를 직접 노출. 각자 `cm_user_bas` 갱신 후 admin-be 의 Redis 인가 캐시 evict 를 S2S 로 트리거 | BE 작업과 동기화 필요   |
| (b) admin-be 전용 endpoint, 다른 시스템 FE 가 admin-be 로 직접 호출 | common 의 `http` 인스턴스가 시스템별 baseURL 인데, locale-api 만 admin baseURL 로 강제. 라우팅 정책 필요                                                          | http 인스턴스 분기 필요 |
| (c) Gateway 도입                                                    | 모든 인증·인가 endpoint 를 단일 gateway 가 라우팅. 가장 깔끔하나 인프라 변경 큼                                                                                   | 장기 결정               |

> 현재 멀티시스템 정책상 (a) 가 정답에 가깝지만, **본 이관을 시작하기 전 BE 측 endpoint 가 준비됐는지 반드시 확인**해야 한다 (FE 만 옮기면 다른 시스템에서 404).

### 4.3 인가 캐시 동기화

admin-be 의 `MeCommandService.updatePreferredLocale` 가 `AuthContext.getSubject()` + `user.getKeycloakSub()` 양쪽을 evict 한다. 다른 시스템 BE 가 동일 endpoint 를 구현할 경우 같은 evict 로직이 필요하다 (안 그러면 메뉴/i18n 이 즉시 반영 안 됨). `@vanta/spring-security` 공통 라이브러리에 헬퍼로 두는 게 자연스럽다.

### 4.4 탭 라벨 자동 동기화 (옵션 A — 보류 중)

탭(`useTabStore`)이 `TabItem.label` 에 string 으로 저장하므로 로케일 변경 후 메뉴 트리만 새로 받아도 탭 라벨은 옛 로케일로 남는다.

**옵션 A (권장)**: `TabBarSortableList` 가 `useProgramStore` 의 program tree 를 평탄화해 `path → name` 맵을 만들고, 탭 렌더 시 `labelByPath.get(tab.path) ?? tab.label` 로 lookup. `tab.label` 은 fallback.

```tsx
// 의사 코드 — common/components/layout/TabBar/TabBarSortableList.tsx
const programItems = useProgramStore((s) => s.items)
const labelByPath = useMemo(() => buildLabelByPath(programItems), [programItems])
const resolveLabel = (tab) =>
  tab.id === TAB_HOME_ID ? t('common.layout.tab.homeTab') : (labelByPath.get(tab.path) ?? tab.label)
```

→ `setProgramTree(newPrograms)` 가 호출되면 `labelByPath` 가 자동 재계산되고 탭 라벨이 따라온다.

**옵션 B (간이 패치)**: 모달의 `onSubmit` 에서 `fetchProgramTree` 후 명시적으로 `tabStore.refreshLabels(id → newName)` 호출. 단발성 패치라 즐겨찾기·최근사용 등 다른 영역에서 같은 버그가 재발할 수 있다.

> 본 이관 시 옵션 A 를 같이 반영하는 것을 권장. (이미 시도했다가 revert 되었으므로, 본 이관에서 결정 받아 재적용한다.)

### 4.5 LocaleSelectionModal 의 admin 종속성 점검

승격 전에 모달 내부에 admin 특화 logic 이 없는지 확인:

- ✓ `useAuthStore` / `useProgramStore` — common
- ✓ `Modal` / `Button` / `FormSelect` — common
- ✓ `react-hook-form` / `react-i18next` / `react-hot-toast` — 외부
- ✓ `LabelI18nSync` provider — common
- API 3종(`fetchLocales` / `updateMyLocale` / `fetchProgramTree`) — 본 이관에서 같이 옮김
- 스타일 클래스(`.locale-selection-modal__*`) — common 으로 이동

→ admin 종속성 없음. 순수 승격 가능.

---

## 5. 이관 순서 (제안)

```
[Phase 0 — 전제 확인]
  - 하위 시스템 BE 가 /me/locale, /me/programs, /system/locales 를 처리할 수 있는지 점검
  - 안 되면 §4.2 옵션 결정 + BE 작업 우선

[Phase 1 — common 신규 (이관)]
  1. common 의 api/me-api.ts 에 updateMyLocale 추가
  2. common 에 api/locale-api.ts 신규 (admin 의 것 그대로)
  3. common 에 api/program-tree-api.ts 신규 (admin 의 것 그대로)
  4. common 에 components/layout/LocaleSelectionModal.tsx 신규 (admin 의 것 그대로, import 경로 수정)
  5. common 에 assets/styles/layout/locale-selection-modal.css 신규
  6. common 의 locales/{ko,en}/common.json 에 common.locale.* 키 추가
  7. common 의 index.ts 에 export 추가

[Phase 2 — 탭 라벨 동기화 (옵션 A)]
  8. common 의 TabBarSortableList 에 useProgramStore lookup 추가
  9. common 측 단위 테스트 추가 (TabBarSortableList: 메뉴 트리 변경 시 라벨 갱신)

[Phase 3 — admin-front 정리]
  10. admin 의 LocaleSelectionModal / locale-api / program-tree-api / css 삭제
  11. admin 의 me-api.ts 에서 updateMyLocale 제거
  12. admin 의 common.json 에서 common.locale.* 키 제거 (common 의 것이 우선)
  13. 호출부 import 경로를 @vanta/common 으로 변경

[Phase 4 — 검증]
  14. admin: 로케일 변경 → 메뉴 + 탭 라벨이 새 로케일로 표시
  15. 하위 시스템(VFX 등) 한 곳에서 동일 동작 확인
  16. common publish (또는 dist 임시 복사로 회귀 점검)
```

각 Phase 는 별도 PR 로 분리 권장 (특히 Phase 1 과 Phase 3 사이에 publish + admin 의존성 업데이트가 끼므로).

---

## 6. 리스크 / 결정 보류 사항

- **BE endpoint 미준비**: 본 이관의 가장 큰 차단 요인. 다른 시스템 BE 가 `/me/locale` 등을 처리할 준비가 안 되면 FE 만 옮겨도 다른 시스템에서 동작 안 함 → §4.2 결정 필요.
- **Redis 인가 캐시 동기화**: admin-be 외 시스템 BE 도 evict 책임을 가져야 함. `@vanta/spring-security` 헬퍼로 정리 권장.
- **탭 라벨 옵션 A 의 영향 범위**: program tree 가 비어 있는 초기 상태에서 fallback (`tab.label`) 이 정상 동작하는지 검증 필요. 특히 페이지 새로고침 직후 program-store rehydrate 전 짧은 시간.
- **i18n 키 통합**: admin / common 에 같은 키가 동시에 있으면 i18next 의 resource merge 우선순위에 따라 동작이 달라질 수 있음. 이관 시 admin 측을 명시적으로 제거.
- **다국어 시드 (V64/V65)**: BE 시드는 admin 도메인 그대로. 다른 시스템 BE 가 동일 시드를 갖거나, admin DB 를 공유하거나, S2S 로 끌어오는 방식 결정 필요.

---

## 7. 본 이관과 별개로 처리되는 admin 작업 (참고)

- `MeProgramQueryService` 로케일 기반 메뉴 응답 — admin-back 도메인. 이관 외.
- V64/V65 i18n 시드 — admin-back/db/migration. 이관 외.
- `MeCommandService.updatePreferredLocale` 의 evict — admin-back. 이관 외 (단, 다른 시스템 BE 의 참고 모델).
