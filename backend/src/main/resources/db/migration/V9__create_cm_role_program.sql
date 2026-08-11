-- 역할별 프로그램(메뉴) 부여 — cm_program_bas(프로그램 기본 정보)를 참조
CREATE TABLE `cm_role_program`
(
    `role_id`    BIGINT UNSIGNED NOT NULL,
    `program_id` BIGINT UNSIGNED NOT NULL,
    `reg_dtm`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `program_id`),
    CONSTRAINT `fk_cm_role_program_role` FOREIGN KEY (`role_id`) REFERENCES `cm_role_bas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cm_role_program_program` FOREIGN KEY (`program_id`) REFERENCES `cm_program_bas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '역할별 프로그램(메뉴) 부여';
