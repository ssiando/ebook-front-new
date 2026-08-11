-- active_role_nm: active_yn=1일 때만 role_nm 값을 갖는 생성 컬럼.
-- (workspace_id, active_role_nm) UNIQUE로 걸어서, 비활성(active_yn=0) 역할은
-- 유일성 검사에서 제외하면서도 활성 역할명은 워크스페이스 내에서 유일하게 강제한다.
CREATE TABLE `cm_role_bas`
(
    `id`             BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `workspace_id`   BIGINT UNSIGNED NOT NULL,
    `role_nm`        VARCHAR(100) NOT NULL,
    `descp`          VARCHAR(500) NULL,
    `active_yn`      TINYINT(1)   NOT NULL DEFAULT 1,
    `regr_id`        BIGINT UNSIGNED NULL,
    `updr_id`        BIGINT UNSIGNED NULL,
    `reg_dtm`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `active_role_nm` VARCHAR(100) GENERATED ALWAYS AS (CASE WHEN `active_yn` = 1 THEN `role_nm` ELSE NULL END) STORED,
    PRIMARY KEY (`id`),
    CONSTRAINT `uk_mt_role_bas_01` UNIQUE (`workspace_id`, `active_role_nm`),
    KEY `idx_mt_role_bas_workspace` (`workspace_id`),
    CONSTRAINT `fk_mt_role_bas_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `cm_workspace_bas` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '워크스페이스 역할 기본 정보';
