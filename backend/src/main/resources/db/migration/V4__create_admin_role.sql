-- 관리자-역할 매핑 (관리자 한 명이 여러 역할을 가질 수 있음)
CREATE TABLE `admin_role`
(
    `admin_id`   BIGINT UNSIGNED NOT NULL,
    `role_id`    BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`admin_id`, `role_id`),
    CONSTRAINT `fk_admin_role_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_admin_role_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '관리자-역할 매핑';
