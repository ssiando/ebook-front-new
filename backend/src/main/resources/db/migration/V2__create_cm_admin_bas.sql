CREATE TABLE `cm_admin_bas`
(
    `id`             BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `admin_nm`       VARCHAR(50)  NOT NULL,
    `admin_email`    VARCHAR(100) NOT NULL,
    `admin_pwd`      VARCHAR(100) NULL,
    `fail_fcnt`      INT          NOT NULL DEFAULT 0,
    `reg_dtm`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `regr_id`        BIGINT UNSIGNED NULL,
    `updr_id`        BIGINT UNSIGNED NULL,
    `active_yn`      TINYINT(1)   NOT NULL DEFAULT 1,
    `last_login_dtm` DATETIME     NULL,
    `last_login_ip`  VARCHAR(45)  NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '관리자 기본 정보';
