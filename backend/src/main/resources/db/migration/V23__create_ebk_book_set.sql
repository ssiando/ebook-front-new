CREATE TABLE `ebk_book_set`
(
    `set_id`      BIGINT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '세트 ID',
    `set_name`    VARCHAR(200)  NOT NULL COMMENT '세트명',
    `description` VARCHAR(500)  NULL COMMENT '설명',
    `active_yn`   TINYINT(1)    NOT NULL DEFAULT 1,

    `reg_dtm`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `regr_id`     BIGINT UNSIGNED NULL,
    `updr_id`     BIGINT UNSIGNED NULL,

    PRIMARY KEY (`set_id`),

    CONSTRAINT `uk_ebk_book_set_name` UNIQUE (`set_name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '도서 세트';
