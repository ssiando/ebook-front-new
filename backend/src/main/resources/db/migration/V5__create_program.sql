-- 역할 관리 화면의 메뉴/프로그램 부여 트리 (프론트엔드 data/programs.json에 대응).
-- 아래 program_admin 테이블(프로그램 관리 화면)과 개념이 겹치는 별개 카탈로그입니다 —
-- 현재 프론트엔드 화면 두 개가 서로 다른 카탈로그를 쓰고 있어 우선 각각 그대로 옮겼습니다.
-- 추후 하나로 통합할지는 백엔드 설계 시 다시 검토하는 것을 권장합니다.
CREATE TABLE `program`
(
    `id`         VARCHAR(50)  NOT NULL PRIMARY KEY COMMENT 'programs.json의 id 슬러그와 동일',
    `parent_id`  VARCHAR(50)  NULL,
    `label`      VARCHAR(150) NOT NULL,
    `code`       VARCHAR(100) NOT NULL,
    `type`       VARCHAR(10)  NOT NULL COMMENT 'PAGE/API',
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_program_parent` FOREIGN KEY (`parent_id`) REFERENCES `program` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '역할 관리의 메뉴/프로그램 부여 트리';
