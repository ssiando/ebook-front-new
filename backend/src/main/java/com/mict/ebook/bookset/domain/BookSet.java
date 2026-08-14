package com.mict.ebook.bookset.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** ebk_book_set 테이블 — 여러 도서를 묶는 세트. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookSet {

    private Long id;
    private String setName;
    private String description;
    private boolean activeYn;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookSet createNew(String setName, String description, Long registrantId) {
        BookSet bookSet = new BookSet();
        bookSet.setName = setName;
        bookSet.description = description;
        bookSet.activeYn = true;
        bookSet.registrantId = registrantId;
        bookSet.updaterId = registrantId;
        return bookSet;
    }

    public void update(String setName, String description, boolean activeYn, Long updaterId) {
        this.setName = setName;
        this.description = description;
        this.activeYn = activeYn;
        this.updaterId = updaterId;
    }
}
