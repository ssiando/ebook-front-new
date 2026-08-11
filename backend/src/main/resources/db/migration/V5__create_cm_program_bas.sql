CREATE TABLE `cm_program_bas`
(
    `id`           BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `workspace_id` BIGINT UNSIGNED NOT NULL,
    `prnt_id`      BIGINT UNSIGNED NULL,
    `pgm_cd`       VARCHAR(100) NOT NULL,
    `pgm_nm`       VARCHAR(200) NOT NULL,
    `pgm_type`     VARCHAR(20)  NOT NULL DEFAULT 'PAGE',
    `http_mthd`    VARCHAR(10)  NULL,
    `url`          VARCHAR(256) NULL,
    `sort_sseq`    INT          NOT NULL DEFAULT 0,
    `mark_yn`      TINYINT(1)   NOT NULL DEFAULT 1,
    `active_yn`    TINYINT(1)   NOT NULL DEFAULT 1,
    `i18n_key_id`  BIGINT       NULL,
    `descp`        VARCHAR(500) NULL,
    `regr_id`      BIGINT       NULL,
    `updr_id`      BIGINT       NULL,
    `reg_dtm`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_cm_program_bas_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `cm_workspace_bas` (`id`),
    CONSTRAINT `fk_cm_program_bas_parent` FOREIGN KEY (`prnt_id`) REFERENCES `cm_program_bas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '프로그램(메뉴) 기본 정보';
