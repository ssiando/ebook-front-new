CREATE TABLE `ebk_book_bas`
(
    `book_id`          BIGINT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '도서 ID',

    `title`            VARCHAR(300)  NOT NULL COMMENT '제목',
    `subtitle`         VARCHAR(500)  NULL COMMENT '부제목',

    `book_type`        ENUM ('EBOOK', 'PAPER', 'BOTH') NOT NULL DEFAULT 'EBOOK' COMMENT '전자책/종이책',

    `page_count`       INT UNSIGNED  NULL COMMENT '총 페이지',

    `copyright_owner`  VARCHAR(200)  NULL COMMENT '판권 소유자',

    `first_publish_dt` DATE          NULL COMMENT '초판 발행일',

    `publisher`        VARCHAR(200)  NULL COMMENT '발행자',

    `isbn`             VARCHAR(20)   NULL COMMENT 'ISBN',

    `free_yn`          CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '무료 여부',

    `cover_image_url`  VARCHAR(1000) NULL COMMENT '커버 이미지',

    `thumbnail_url`    VARCHAR(1000) NULL COMMENT '썸네일',

    `active_yn`        TINYINT(1)    NOT NULL DEFAULT 1,

    `reg_dtm`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `regr_id`          BIGINT UNSIGNED NULL,
    `updr_id`          BIGINT UNSIGNED NULL,

    PRIMARY KEY (`book_id`),

    CONSTRAINT `uk_ebk_book_bas_isbn` UNIQUE (`isbn`),

    KEY `idx_ebk_book_bas_title` (`title`),
    KEY `idx_ebk_book_bas_type` (`book_type`),
    KEY `idx_ebk_book_bas_free` (`free_yn`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '도서 정보';
