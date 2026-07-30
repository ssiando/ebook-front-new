-- 역할 (소속 인원 수는 admin_role을 COUNT하여 조회 — 별도 컬럼으로 저장하지 않음)
CREATE TABLE `role`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `role_name`   VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `system`      VARCHAR(20)  NOT NULL COMMENT 'VFX/GENX/4DX/ASSET/DESK',
    `registrant`  VARCHAR(50)  NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_role_name_system` UNIQUE (`role_name`, `system`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '역할';
