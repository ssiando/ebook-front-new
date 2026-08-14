-- FK는 ebk_book_bas.book_id를 참조한다 (원 설계서의 `book` 테이블은 오타 — 실제 도서 기본 테이블명은 ebk_book_bas).
CREATE TABLE `ebk_book_revision`
(
    `id`                BIGINT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '리비전 ID',
    `book_id`           BIGINT UNSIGNED NOT NULL COMMENT '도서 ID',
    `revision_no`       INT UNSIGNED    NOT NULL COMMENT '버전',
    `published_yn`      CHAR(1)         NOT NULL DEFAULT 'N' COMMENT '발행 여부',
    `publish_status_cd` VARCHAR(30)     NOT NULL COMMENT '출판 상태',
    `file_name`         VARCHAR(255)    NOT NULL COMMENT '파일명',
    `file_path`         VARCHAR(1000)   NOT NULL COMMENT '파일 경로',
    `encrypt_status_cd` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0:미진행 1:암호화요청 2:암호화완료',

    `reg_dtm`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `regr_id`           BIGINT UNSIGNED NULL,
    `updr_id`           BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`),

    CONSTRAINT `uk_ebk_book_revision_01` UNIQUE (`book_id`, `revision_no`),

    KEY `idx_ebk_book_revision_book` (`book_id`),
    KEY `idx_ebk_book_revision_publish_status` (`publish_status_cd`),
    KEY `idx_ebk_book_revision_encrypt_status` (`encrypt_status_cd`),
    KEY `idx_ebk_book_revision_published` (`published_yn`),

    CONSTRAINT `fk_ebk_book_revision_book`
        FOREIGN KEY (`book_id`)
            REFERENCES `ebk_book_bas` (`book_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '도서 리비전';
