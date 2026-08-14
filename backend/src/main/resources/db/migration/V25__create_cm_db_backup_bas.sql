CREATE TABLE `cm_db_backup_bas`
(
    `id`              BIGINT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '백업 ID',
    `backup_name`     VARCHAR(200)  NOT NULL COMMENT '백업명',
    `file_path`       VARCHAR(1000) NOT NULL COMMENT '백업 파일 경로',
    `file_size_bytes` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '파일 크기(byte)',
    `status`          VARCHAR(20)   NOT NULL COMMENT '백업 상태 (SUCCESS/FAILED)',
    `restored_at`     DATETIME      NULL COMMENT '최근 복원 일시',
    `restore_status`  VARCHAR(20)   NULL COMMENT '최근 복원 상태 (SUCCESS/FAILED)',

    `reg_dtm`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `regr_id`         BIGINT UNSIGNED NULL,
    `updr_id`         BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`),

    CONSTRAINT `uk_cm_db_backup_bas_name` UNIQUE (`backup_name`),

    KEY `idx_cm_db_backup_bas_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'DB 백업 이력';
