CREATE TABLE `cm_code_group`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `group_code`  VARCHAR(50)  NOT NULL,
    `group_name`  VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `use_yn`      CHAR(1)      NOT NULL DEFAULT 'Y',
    `i18n_key`    VARCHAR(100) NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_common_code_group_code` UNIQUE (`group_code`),
    CONSTRAINT `ck_common_code_group_use_yn` CHECK (`use_yn` IN ('Y', 'N'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '공통코드 그룹 (예: ADMIN_STATUS)';
