-- 공통코드: 그룹(공통코드 그룹) + 항목(공통코드 상세)
CREATE TABLE `common_code_group`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group_code`  VARCHAR(50)  NOT NULL,
    `group_name`  VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `use_yn`      CHAR(1)      NOT NULL DEFAULT 'Y',
    `i18n_key`    VARCHAR(100) NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_common_code_group_code` UNIQUE (`group_code`),
    CONSTRAINT `ck_common_code_group_use_yn` CHECK (`use_yn` IN ('Y', 'N'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '공통코드 그룹 (예: ADMIN_STATUS)';

CREATE TABLE `common_code_item`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group_id`    BIGINT UNSIGNED NOT NULL,
    `code`        VARCHAR(50)  NOT NULL,
    `code_name`   VARCHAR(100) NOT NULL,
    `sort_order`  INT          NOT NULL DEFAULT 0,
    `use_yn`      CHAR(1)      NOT NULL DEFAULT 'Y',
    `description` VARCHAR(255) NULL,
    -- 관리자 상태(ADMIN_STATUS) 그룹처럼 화면 배지 색상 등 부가 힌트를 담는 자유 필드
    `metadata`    VARCHAR(255) NULL,
    `i18n_key`    VARCHAR(100) NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_common_code_item_group_code` UNIQUE (`group_id`, `code`),
    CONSTRAINT `ck_common_code_item_use_yn` CHECK (`use_yn` IN ('Y', 'N')),
    CONSTRAINT `fk_common_code_item_group` FOREIGN KEY (`group_id`)
        REFERENCES `common_code_group` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '공통코드 항목';
