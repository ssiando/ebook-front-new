-- 프로그램 관리 화면이 다루는 실제 프로그램/API 카탈로그 (프론트엔드 ProgramAdminItem에 대응)
CREATE TABLE `program_admin`
(
    `id`                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `system`              VARCHAR(20)  NOT NULL,
    `parent_program_id`   BIGINT UNSIGNED NULL,
    `code`                VARCHAR(100) NOT NULL,
    `name`                VARCHAR(150) NOT NULL,
    `type`                VARCHAR(10)  NOT NULL COMMENT 'PAGE/API',
    `http_method`         VARCHAR(10)  NOT NULL DEFAULT '',
    `url`                 VARCHAR(255) NULL,
    `sort_order`          INT          NOT NULL DEFAULT 0,
    `display_yn`          CHAR(1)      NOT NULL DEFAULT 'Y',
    `use_yn`              CHAR(1)      NOT NULL DEFAULT 'Y',
    `platform_admin_only` CHAR(1)      NOT NULL DEFAULT 'N',
    `i18n_key_id`         VARCHAR(100) NULL,
    `description`         VARCHAR(255) NULL,
    `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_program_admin_system_code` UNIQUE (`system`, `code`),
    CONSTRAINT `ck_program_admin_display_yn` CHECK (`display_yn` IN ('Y', 'N')),
    CONSTRAINT `ck_program_admin_use_yn` CHECK (`use_yn` IN ('Y', 'N')),
    CONSTRAINT `ck_program_admin_platform_admin_only` CHECK (`platform_admin_only` IN ('Y', 'N')),
    CONSTRAINT `fk_program_admin_parent` FOREIGN KEY (`parent_program_id`)
        REFERENCES `program_admin` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '프로그램 관리 화면의 프로그램/API 카탈로그';
