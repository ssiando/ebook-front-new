# ebook-backend 코드 컨벤션

VANTA-BACK 코드 컨벤션(`VANTA-BACK-코드컨벤션.pdf`)을 이 프로젝트에 맞게 적용한 버전입니다.
**vanta-common(사내 다른 프로젝트와 공유하는 별도 Gradle 아티팩트)은 이 저장소에 존재하지
않으므로, 그 역할을 하는 클래스를 `common/` 패키지에 최소 구현으로 대체**했습니다. 구조·네이밍·
레이어 규칙은 원본 컨벤션을 최대한 그대로 따르되, 이 프로젝트의 실제 스택(JPA가 아닌
**MyBatis**, 단일 모듈)에 맞게 조정했습니다.

## VANTA 원본 대비 조정 사항

| VANTA 원본 | 이 프로젝트 | 이유 |
| --- | --- | --- |
| `api/{domain}/...` (admin 모듈 하위) | `{domain}/...` (최상위 패키지, `api` 래퍼 없음) | 이 저장소는 admin 모듈 하나뿐이라 `api/` 한 겹을 둘 이유가 없음. 기존에 만들어진 `role/`, `menu/` 패키지 구조를 그대로 유지 |
| `shared/` (프로젝트 내 공용) + `vanta-common`(사내 공용 아티팩트) | `common/` 하나로 통합 | 별도 아티팩트가 없으므로 두 계층을 합침 |
| JPA Entity, JPA Repository, `@Entity`, `@SQLRestriction` | MyBatis Mapper 인터페이스 + XML, plain 도메인 클래스 | `build.gradle.kts`에 `spring-boot-starter-data-jpa`가 없고 MyBatis만 사용 |
| `@ReadOnlyTransaction`/`@WriteTransaction`/`@NewTransaction` (vanta-common 커스텀 어노테이션) | 표준 `@Transactional(readOnly = true)` / `@Transactional(rollbackFor = Exception.class)` | 커스텀 어노테이션이 없으므로 Spring 표준 사용 |
| `ApiResponse`, `PageResponse`, `ErrorCode`, `BusinessException`, `GlobalExceptionHandler`, `BaseEntity`, `SoftDeletableEntity` (vanta-common 소속) | `common/response`, `common/exception`, `common/entity`에 최소 구현 | 로컬 대체 구현 |
| `RedisKeyType`, Kafka wrapper, `@RequireProgramAccess` | 적용 안 함 | Redis/Kafka를 아직 쓰지 않음. `@RequireProgramAccess`(프로그램 단위 세밀 인가)는 `program`/`program_admin` 두 카탈로그가 아직 통합되지 않아 보류 — 도입 시 이 문서에 섹션 추가 |
| Keycloak(외부 인가서버) 연동 JWT | 자체 발급 JWT(HS256, 공유 비밀키) | 별도 인가서버가 없어 `admin` 테이블 자격증명으로 자체 로그인·토큰 발급. 아래 [인증/인가](#인증인가-jwt) 섹션 참고 |
| ArchUnit (`LayeredArchitectureTest` 등) | 적용 안 함 (선택 사항) | 초기 단계에선 생략, 도메인이 늘어나면 도입 검토 |

이 표에 없는 규칙(패키지 구조, 네이밍, DTO record, 에러 처리 패턴, API 응답 포맷, Entity 컨벤션,
레이어 규칙)은 **원본 컨벤션을 그대로 적용**합니다.

## 패키지 구조

```
com.mict.ebook/
├── common/                # VANTA의 shared/ + vanta-common 최소 구현
│   ├── response/          # ApiResponse<T>, PageResponse<T>
│   ├── exception/         # ErrorCode, CommonErrorCode, BusinessException, GlobalExceptionHandler
│   ├── entity/             # BaseEntity (createdAt/updatedAt)
│   ├── config/             # 전역 설정 (Security, Swagger 등 — 아직 비어있음)
│   ├── constant/
│   └── util/
└── {domain}/               # VANTA의 api/{domain}/ 에 대응
    ├── controller/         {Domain}Controller
    ├── dto/                Create{Domain}Request, Update{Domain}Request, {Domain}Response (Record)
    ├── mapper/             {Domain}RestMapper (MapStruct, Entity <-> DTO)
    ├── domain/             {Entity}, {Domain}ErrorCode, (필요시) {Domain}Specifications
    ├── repository/
    │   └── mapper/         {Domain}Mapper 인터페이스 + resources/mapper/{Domain}Mapper.xml
    ├── service/            {Domain}QueryService(조회) / {Domain}CommandService(변경)
    └── event/              도메인 이벤트 (필요시)
```

- 새 도메인을 추가할 땐 `role/`을 참고 예시로 그대로 복제하세요.
- 여러 도메인이 같이 쓰는 것만 `common/`으로 올립니다. 판단 기준은 원본 문서와 동일:
  **한 도메인 전용이면 `{domain}/`, 여러 도메인이 같이 쓰면 `common/`.**

## Layer Rules

`controller → service → repository/mapper` 단방향 의존만 허용합니다. `repository`가
`service`를, `service`가 `controller`를 알아서는 안 됩니다. `dto`는 controller-service
경계에서만 사용하고 repository까지 내려보내지 않습니다.

## Naming Convention

- Controller: `{Domain}Controller`
- Service: CRUD형 도메인은 `{Domain}QueryService`(조회, `readOnly=true`) / `{Domain}CommandService`(변경).
  CRUD로 딱 떨어지지 않으면 그냥 `*Service` (예: `AuthService`).
- MyBatis Mapper: `{Domain}Mapper` (인터페이스는 `repository/mapper/`, XML은 `resources/mapper/`)
- RestMapper(MapStruct): `{Domain}RestMapper` (`{domain}/mapper/`, `repository/mapper/`와 혼동 주의)
- DTO: `Create{Domain}Request`, `Update{Domain}Request`, `{Domain}Response`
- ErrorCode: `{Domain}ErrorCode` (도메인별 enum, `{domain}/domain/`에 위치)
- 패키지명은 소문자(`role`, `menu`), 클래스명은 PascalCase

## Transaction

```java
@Transactional(readOnly = true)   // QueryService
@Transactional(rollbackFor = Exception.class)  // CommandService (Spring 기본은 unchecked만 롤백)
```

`@Transactional`은 항상 서비스 레이어에만 붙입니다. Controller/Repository에는 붙이지 않습니다.

## DTO Convention

- 기본은 **Java Record**. Setter가 필요한 경우(마스킹처럼 값 변형이 필요한 경우)만
  `@Getter + @Builder + @AllArgsConstructor(access = PRIVATE)` 클래스 사용.
- `dto/`는 controller-service 경계 전용. Request 검증은 Bean Validation(`@NotBlank`,
  `@Size` 등) 애노테이션 + `@Valid`로 처리합니다.

## Error Handling

- `BusinessException` + 도메인별 `{Domain}ErrorCode` enum(`{domain}/domain/`).
- 공통 에러는 `common/exception/CommonErrorCode`.
- 모든 예외는 `common/exception/GlobalExceptionHandler`(`@RestControllerAdvice`)에서 잡아
  `ApiResponse.failure()`로 응답.

## API Response

```java
ApiResponse.success(data);   // 성공
ApiResponse.failure(errorCode); // 실패
```

- 등록(POST, 신규 리소스 생성): `201 Created` + `ApiResponse<T>`
- 조회(GET), 취소성 있는 POST(로그인 등), PUT/PATCH(body 있음): `200 OK` + `ApiResponse<T>`
- 삭제(DELETE), body 없는 PUT/PATCH: `204 No Content` + `void`
- 리스트 조회: `ApiResponse<PageResponse<T>>`

## Entity Convention (MyBatis 기준 — JPA `@Entity` 아님)

- `@Getter`, `@NoArgsConstructor(access = PROTECTED)`, **public setter 금지**
- 상태 변경은 의미 있는 메서드로만 (`update()`, `createNew()` 정적 팩토리 등)
- MyBatis는 setter가 없으면 리플렉션으로 private 필드에 직접 값을 채웁니다 — 그래서 setter
  없이도 정상적으로 매핑됩니다. `resultMap`에서 `<result property="..." column="..."/>`만
  선언하면 됩니다.
- 공통 필드(`createdAt`, `updatedAt`)는 `common/entity/BaseEntity`를 상속해서 재사용.
- 이 프로젝트 스키마엔 soft delete(`deleted_at`) 컬럼이 없으므로 `SoftDeletableEntity`는
  아직 만들지 않았습니다. soft delete가 필요한 도메인이 생기면 그때 추가하세요.

## MyBatis 관련 참고

- Mapper 인터페이스: `{domain}/repository/mapper/{Domain}Mapper.java`
- Mapper XML: `src/main/resources/mapper/{Domain}Mapper.xml` (`application.yml`의
  `mybatis.mapper-locations: classpath:mapper/**/*.xml` 참고)
- Enum 컬럼(예: `role.system`)처럼 DB 문자열이 Java enum의 `name()`과 다른 경우
  (`4DX`처럼 숫자로 시작해 enum 상수명으로 못 쓰는 값 등) `BaseTypeHandler`를 만들어
  `resultMap`/파라미터에 `typeHandler`로 명시하세요. `role/domain/SystemTypeHandler`가 예시입니다.

## Testing

- `@SpringBootTest` + 실DB 또는 `@MybatisTest` 조합 권장. ArchUnit은 아직 도입하지 않았습니다.

## 인증/인가 (JWT)

별도 인가서버(Keycloak 등) 없이 `admin` 테이블 자격증명으로 로그인하고, 서버가 직접
JWT(HS256, 공유 비밀키)를 발급·검증합니다.

- **로그인**: `POST /api/auth/login` (`auth/` 패키지) — `admin_id` 또는 `email`(account) +
  비밀번호(BCrypt 검증) 확인 후 액세스 토큰 발급. 계정 `status`가 `ACTIVE`가 아니면 거부.
  응답의 `menus` 필드에 로그인한 관리자의 역할에 따라 필터링된 사이드바 메뉴 트리를 함께
  내려줍니다 — `MenuQueryService.getMenuTree(roles)`가 `menu` 테이블 전체를 트리로 구성한
  뒤, 최상위 그룹 중 `admin`/`system`처럼 제한이 걸린 그룹은 보유 역할명이 일치할 때만
  포함시킵니다(기준은 프론트엔드 `src/utils/menuPermission.ts`의 `MENU_GROUP_ROLE_NAMES`와
  동일 — 두 곳의 규칙이 어긋나지 않도록 메뉴 그룹 접근 정책을 바꿀 때 항상 같이 수정하세요).
  제한이 없는 그룹(대시보드/홈 등)은 모든 관리자에게 노출됩니다.
- **로그아웃**: `POST /api/auth/logout` (인증 필요) — 요청에 실려 온 토큰의 `jti`(JWT ID)를
  `auth_token_blacklist` 테이블에 원본 만료 시각까지 기록합니다. `JwtDecoder`에 등록된
  `common/security/JwtBlacklistValidator`가 매 요청마다 `jti` 블랙리스트 여부를 검사하므로,
  로그아웃 이후에는 토큰이 자연 만료 전이라도 즉시 거부됩니다(진짜 무효화, 클라이언트
  토큰 삭제에만 의존하는 방식이 아님). 블랙리스트 테이블은 로그아웃 시점에 만료된
  항목을 함께 정리해 무한히 커지지 않게 합니다(`AuthService.logout` 참고). Redis 없이
  DB 테이블로 최소 구현했습니다 — 트래픽이 커지면 Redis TTL 키로 교체를 검토하세요.
- **토큰 발급/검증**: `common/security/JwtTokenProvider`(발급), `common/config/SecurityConfig`의
  `JwtEncoder`/`JwtDecoder` 빈(공유 비밀키 `SecretKey`)이 서명·검증을 담당합니다.
  `spring-boot-starter-oauth2-resource-server`가 제공하는 Nimbus 기반 JWT 인코더/디코더를
  그대로 재사용하되, 외부 IdP의 `issuer-uri` 대신 자체 비밀키(`app.jwt.secret`)를 사용합니다.
  실제 IdP(Keycloak 등) 연동 시 `SecurityConfig`의 `jwtDecoder` 빈만 `issuer-uri`/`jwk-set-uri`
  기반으로 교체하면 됩니다.
- **비밀키/만료시간 설정**: `application.yml`의 `app.jwt.secret`, `app.jwt.access-token-validity-seconds`에
  값을 직접 씁니다(환경변수 미사용, `.env` 파일도 두지 않습니다 — 로컬 개발 환경 하나만 다루므로
  `application.yml`이 유일한 설정 소스입니다). **운영 배포 전 `JWT_SECRET`을 반드시 32바이트
  이상의 랜덤 값으로 교체**하세요 (기본값은 로컬 개발 전용).
- **권한 클레임**: JWT의 `roles` 클레임(관리자가 보유한 `role.role_name` distinct 목록)을
  `JwtAuthenticationConverter`가 `ROLE_{roleName}` 형태의 `GrantedAuthority`로 변환합니다.
  프론트엔드 `src/utils/menuPermission.ts`의 `system` 메뉴 그룹 접근 규칙(SUPER_ADMIN/
  WORKSPACE_ADMIN만 접근)과 동일한 기준을 백엔드에도 그대로 적용합니다.
- **API 보호**:
  - `common/config/SecurityConfig`가 `/api/auth/login`, Swagger, `actuator/health`·`info`를
    제외한 모든 요청에 유효한 Bearer 토큰을 요구합니다(Stateless).
  - 역할/메뉴 관리처럼 시스템 설정을 다루는 컨트롤러는 클래스 레벨
    `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")`로 추가 인가를 겁니다
    (`RoleController`, `MenuController` 참고). 새 시스템 관리 도메인을 추가할 때 이 패턴을
    그대로 적용하세요. 일반 CRUD 도메인은 인증(로그인)만 요구하면 충분하면 생략 가능합니다.
  - 인증 실패(토큰 없음/무효)는 `common/security/RestAuthenticationEntryPoint`가,
    인가 실패(`@PreAuthorize` 거부)는 `GlobalExceptionHandler`의
    `AccessDeniedException` 핸들러가 각각 `ApiResponse.failure()` 포맷으로 응답합니다.
- **CORS**: `app.cors.allowed-origins`(`http://localhost:5173`, `application.yml`에 직접 명시)에
  프론트엔드 개발 서버 Origin을 등록해 뒀습니다. 배포 도메인이 늘어나면 콤마로 추가하세요.

## 예시: role 도메인

`role/` 패키지 전체(`controller`, `dto`, `domain`, `mapper`, `repository/mapper`, `service`)가
이 컨벤션을 적용한 참고 예시입니다. 새 도메인을 추가할 때 그대로 복제해서 시작하세요.
