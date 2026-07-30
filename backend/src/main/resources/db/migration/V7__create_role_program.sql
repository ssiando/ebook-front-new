-- 역할별 프로그램(메뉴) 부여 — program(역할 관리의 메뉴 부여 트리)을 참조
CREATE TABLE `role_program`
(
    `role_id`    BIGINT UNSIGNED NOT NULL,
    `program_id` VARCHAR(50)     NOT NULL,
    `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `program_id`),
    CONSTRAINT `fk_role_program_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_program_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '역할별 프로그램(메뉴) 부여';
