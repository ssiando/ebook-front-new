# ebook-backend

`c:\AI\ebook`(프론트엔드)와 짝을 이루는 관리자 백엔드입니다. 아직 컨트롤러/서비스 코드는 없고,
이번 작업에서는 **DB 스키마와 Flyway 마이그레이션만** 구성했습니다 — 프론트엔드가 지금까지
mock으로 다루던 모든 도메인(관리자, 역할, 프로그램, 배치, 공통코드, 메뉴)을 실제 테이블로
옮기고, 목데이터를 시드로 포팅했습니다.

## 기술 스택

Java 21 · Spring Boot 3.3 · Gradle 9(Kotlin DSL) · MariaDB · MyBatis · MapStruct · Lombok ·
SpringDoc OpenAPI · Spring Security(OAuth2 Resource Server) · P6Spy · Logback+Logstash Encoder ·
Actuator · Spring Validation · Dotenv · Spotless(Palantir Java Format) · Flyway

## 폴더 구조

```
backend/
├─ build.gradle.kts / settings.gradle.kts
├─ .env / .env.example              # 로컬 DB 접속 정보 (.env는 gitignore됨)
└─ src/main/
    ├─ java/com/mict/ebook/
    │   ├─ EbookApplication.java
    │   ├─ common/{config,exception,response,util,constant}/  # 아직 빈 패키지 (다음 단계에서 채움)
    │   ├─ role/{controller,service,repository,mapper,dto,entity}/  # 〃
    │   └─ menu/                                                # 〃
    └─ resources/
        ├─ application.yml
        ├─ logback.xml
        └─ db/migration/          # Flyway 마이그레이션 (아래 표 참고)
```

`common`/`role`/`menu` 패키지는 요청하신 구조 그대로 미리 만들어 두었지만, 실제 컨트롤러/서비스/
엔티티 코드는 이번 범위(Flyway 정리)에 포함하지 않았습니다 — 빈 스텁을 미리 채우기보다,
다음 단계에서 실제 요구사항과 함께 만드는 게 맞다고 판단했습니다.

## DB 스키마 & 시드 데이터

`src/main/resources/db/migration`에 버전별로 정리했습니다. **V1~V9는 DDL, V10~V18은 시드
데이터**이며, 프론트엔드 mock(각 `api/*.ts`)의 데이터를 그대로 포팅했습니다.

| 버전  | 내용                             | 비고                                                             |
| ----- | -------------------------------- | ------------------------------------------------------------------ |
| V1    | `common_code_group`, `common_code_item` | 공통코드 (그룹+항목)                                        |
| V2    | `admin`                          | 관리자 계정 (`password_hash` 컬럼은 프론트에 없던 실제 인증용 추가 필드) |
| V3    | `role`                           | 역할                                                              |
| V4    | `admin_role`                     | 관리자-역할 매핑 (다대다)                                        |
| V5    | `program`                        | 역할 관리 화면의 메뉴 부여 트리 (`data/programs.json` 대응)      |
| V6    | `program_admin`                  | 프로그램 관리 화면의 프로그램/API 카탈로그 (`ProgramAdminItem` 대응) |
| V7    | `role_program`                   | 역할-프로그램(`program`) 부여 매핑                               |
| V8    | `batch_job`                      | 배치 작업                                                        |
| V9    | `menu`                           | 사이드바 내비게이션 트리 (`data/menu.json` 대응)                 |
| V10   | 공통코드 시드 (그룹 4 + 항목 10) | `ADMIN_STATUS` 그룹 포함 (활성/휴면/비활성/신규 + 배지색 metadata) |
| V11   | 역할 시드 (15건)                 | id 1~15로 채번되도록 순서 고정 — V13/V15가 이 id를 리터럴로 참조 |
| V12   | 프로그램 트리 시드 (24건)        |                                                                    |
| V13   | 역할-프로그램 부여 시드 (50건)   |                                                                    |
| V14   | 관리자 시드 (23건)               | 데모 비밀번호는 전부 `ebook!2026` (BCrypt) — **배포 전 교체 필수** |
| V15   | 관리자-역할 매핑 시드 (27건)     |                                                                    |
| V16   | 프로그램 관리 시드 (6건)         | 목데이터 중 의미 있는 항목만 선별 (중복 테스트용 더미 행 제외)   |
| V17   | 배치 작업 시드 (9건)             |                                                                    |
| V18   | 메뉴 트리 시드 (10건)            |                                                                    |

### 알아두면 좋은 설계 메모

- **`program` vs `program_admin`**: 프론트엔드에 이 둘이 서로 다른 카탈로그로 존재합니다
  (역할 관리의 메뉴 부여 트리는 `data/programs.json`, 프로그램 관리 화면은 별도 API/타입).
  일단 각각 그대로 옮겼지만, 개념이 겹치므로 실제로는 하나로 합칠지 검토해 보시는 걸
  권장합니다 — 지금은 임의로 통합하지 않았습니다.
- **공통코드 소프트 레퍼런스**: `admin.status`는 `common_code_group.group_code = 'ADMIN_STATUS'`
  값을 참조하지만 FK로 강제하지는 않습니다(공통코드 특성상 일반적인 패턴). `batch_job.status`는
  프론트에서 아직 공통코드로 옮기지 않았기 때문에 이번에도 그대로 `success/error/default` 문자열로
  두었습니다.
- **역할 id 1~15 고정 채번**: V11에서 역할을 특정 순서로 삽입해 AUTO_INCREMENT id가 1~15가
  되도록 했고, V13(역할-프로그램)·V15(관리자-역할)가 이 정수 id를 리터럴로 직접 참조합니다.
  이는 "최초 1회, 빈 테이블에 시드할 때만" 유효한 전제입니다 — 이후 마이그레이션을 추가할
  때는 이 가정에 의존하지 말고 `role_name`/`system` 같은 비즈니스 키로 조회하세요.

## 실행 방법

### 1. 환경변수

`.env`(이미 생성되어 있고 gitignore됨)에 로컬 DB 접속 정보가 들어 있습니다. 필요하면
`.env.example`을 참고해 값을 바꾸세요.

```
DB_URL=jdbc:mariadb://localhost:3306/ebook
DB_USERNAME=ipnac
DB_PASSWORD=ipnac
```

### 2. Gradle 래퍼 생성

이 저장소에는 `gradlew`/`gradle-wrapper.jar`를 아직 커밋하지 않았습니다 (바이너리 파일이라
직접 생성이 어려워, 로컬에서 한 번 실행해 만들어 주세요):

```bash
gradle wrapper --gradle-version 9.0
```

### 3. 앱 기동 (Flyway 자동 적용)

```bash
./gradlew bootRun
```

Spring Boot가 기동하면서 `spring.flyway.*` 설정에 따라 `db/migration`의 마이그레이션을
자동으로 적용합니다. Gradle CLI에서 앱 기동 없이 마이그레이션만 다루고 싶다면:

```bash
./gradlew flywayInfo      # 적용 이력 확인
./gradlew flywayMigrate   # 마이그레이션만 적용
./gradlew flywayClean     # 전체 스키마 초기화 (주의: 데이터 전부 삭제)
```

### 검증 완료

이번 작업에서 Flyway 엔진으로 로컬 MariaDB(`ebook` DB, 이 문서 상단의 접속정보)에 V1~V18을
**실제로 적용해 확인**했습니다 — `flyway_schema_history`에 18건 모두 `success=1`로 기록되어
있고, 관리자 23건/역할 15건/관리자-역할 매핑 27건/프로그램 24건/역할-프로그램 부여 50건 등
모든 시드 데이터가 정상적으로 들어가 있습니다. 즉 **로컬 `ebook` DB는 이미 이 스키마로
마이그레이션된 상태**입니다. 처음부터 다시 하고 싶으면 `flywayClean` 후 `flywayMigrate`
(또는 앱 재기동)로 재현할 수 있습니다.

## 데모 로그인 계정

관리자 시드 23건은 모두 비밀번호가 `ebook!2026`으로 동일합니다 (BCrypt 해시로 저장됨,
로컬 개발 전용 — 실제 배포 전 반드시 교체하세요). 역할 조합이 다른 예시 계정:

| adminId    | 역할                          | 메뉴 접근 (프론트 permission 기준) |
| ---------- | ----------------------------- | ----------------------------------- |
| `admin001` | SUPER_ADMIN / VFX              | 전체 메뉴                           |
| `admin004` | ADMIN / 4DX                    | 관리자 메뉴까지 (시스템관리 제외)   |
| `admin006` | MEMBER / VFX 단독              | 관리자/시스템관리 메뉴 접근 불가    |

## 다음 단계 (이번 범위 밖)

- `common`/`role`/`menu` 패키지에 실제 컨트롤러/서비스/리포지토리/매퍼/DTO/엔티티 작성
- Spring Security + OAuth2 Resource Server 실제 설정 (인가서버 확정 필요)
- MyBatis 매퍼 XML (`src/main/resources/mapper/`) 작성
- `program` vs `program_admin` 통합 여부 결정
