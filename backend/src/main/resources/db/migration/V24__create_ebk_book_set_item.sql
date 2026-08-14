CREATE TABLE `ebk_book_set_item`
(
    `set_id`  BIGINT UNSIGNED NOT NULL COMMENT '세트 ID',
    `book_id` BIGINT UNSIGNED NOT NULL COMMENT '도서 ID',

    PRIMARY KEY (`set_id`, `book_id`),

    KEY `idx_ebk_book_set_item_book` (`book_id`),

    CONSTRAINT `fk_ebk_book_set_item_set`
        FOREIGN KEY (`set_id`)
            REFERENCES `ebk_book_set` (`set_id`),
    CONSTRAINT `fk_ebk_book_set_item_book`
        FOREIGN KEY (`book_id`)
            REFERENCES `ebk_book_bas` (`book_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '도서 세트-도서 매핑';
