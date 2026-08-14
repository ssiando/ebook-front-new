package com.mict.ebook.book.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** ebk_book_bas 테이블 — 도서(전자책/종이책) 기본 정보. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Book {

    private Long id;
    private String title;
    private String subtitle;
    private BookType bookType;
    private Integer pageCount;
    private String copyrightOwner;
    private LocalDate firstPublishDt;
    private String publisher;
    private String isbn;
    private boolean freeYn;
    private String coverImageUrl;
    private String thumbnailUrl;
    private boolean activeYn;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Book createNew(
            String title,
            String subtitle,
            BookType bookType,
            Integer pageCount,
            String copyrightOwner,
            LocalDate firstPublishDt,
            String publisher,
            String isbn,
            boolean freeYn,
            String coverImageUrl,
            String thumbnailUrl,
            Long registrantId) {
        Book book = new Book();
        book.title = title;
        book.subtitle = subtitle;
        book.bookType = bookType;
        book.pageCount = pageCount;
        book.copyrightOwner = copyrightOwner;
        book.firstPublishDt = firstPublishDt;
        book.publisher = publisher;
        book.isbn = isbn;
        book.freeYn = freeYn;
        book.coverImageUrl = coverImageUrl;
        book.thumbnailUrl = thumbnailUrl;
        book.activeYn = true;
        book.registrantId = registrantId;
        book.updaterId = registrantId;
        return book;
    }

    public void update(
            String title,
            String subtitle,
            BookType bookType,
            Integer pageCount,
            String copyrightOwner,
            LocalDate firstPublishDt,
            String publisher,
            String isbn,
            boolean freeYn,
            String coverImageUrl,
            String thumbnailUrl,
            boolean activeYn,
            Long updaterId) {
        this.title = title;
        this.subtitle = subtitle;
        this.bookType = bookType;
        this.pageCount = pageCount;
        this.copyrightOwner = copyrightOwner;
        this.firstPublishDt = firstPublishDt;
        this.publisher = publisher;
        this.isbn = isbn;
        this.freeYn = freeYn;
        this.coverImageUrl = coverImageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.activeYn = activeYn;
        this.updaterId = updaterId;
    }
}
