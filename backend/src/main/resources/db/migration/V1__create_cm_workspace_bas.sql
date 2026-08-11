CREATE TABLE `cm_workspace_bas`
(
    `id`         BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `name`       VARCHAR(200) NOT NULL,
    `stat`       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    `descp`      VARCHAR(500) NULL,
    `regr_id`    BIGINT       NULL,
    `updr_id`    BIGINT       NULL,
    `reg_dtm`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '워크스페이스 기본 정보';
