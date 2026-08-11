CREATE TABLE `cm_code_item`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `group_id`    BIGINT UNSIGNED NOT NULL,
    `code`        VARCHAR(50)  NOT NULL,
    `code_name`   VARCHAR(100) NOT NULL,
    `sort_order`  INT          NOT NULL DEFAULT 0,
    `use_yn`      CHAR(1)      NOT NULL DEFAULT 'Y',
    `description` VARCHAR(255) NULL,
    `metadata`    VARCHAR(255) NULL,
    `i18n_key`    VARCHAR(100) NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_common_code_item_group_code` UNIQUE (`group_id`, `code`),
    CONSTRAINT `fk_common_code_item_group` FOREIGN KEY (`group_id`) REFERENCES `cm_code_group` (`id`) ON DELETE CASCADE,
    CONSTRAINT `ck_common_code_item_use_yn` CHECK (`use_yn` IN ('Y', 'N'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '공통코드 항목';
