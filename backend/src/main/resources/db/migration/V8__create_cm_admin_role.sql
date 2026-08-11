-- 관리자-역할 매핑 (관리자 한 명이 여러 역할을 가질 수 있음)
CREATE TABLE `cm_admin_role`
(
    `admin_id` BIGINT UNSIGNED NOT NULL,
    `role_id`  BIGINT UNSIGNED NOT NULL,
    `reg_dtm`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`admin_id`, `role_id`),
    CONSTRAINT `fk_cm_admin_role_admin` FOREIGN KEY (`admin_id`) REFERENCES `cm_admin_bas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cm_admin_role_role` FOREIGN KEY (`role_id`) REFERENCES `cm_role_bas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '관리자-역할 매핑';
