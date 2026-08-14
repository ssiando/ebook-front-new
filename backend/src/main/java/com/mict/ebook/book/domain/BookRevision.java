package com.mict.ebook.book.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** ebk_book_revision 테이블 — 도서 리비전(버전)별 파일/출판 상태. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookRevision {

    private Long id;
    private Long bookId;
    private int revisionNo;
    private boolean publishedYn;
    private PublishStatus publishStatusCd;
    private String fileName;
    private String filePath;
    private int encryptStatusCd;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookRevision createNew(
            Long bookId,
            int revisionNo,
            boolean publishedYn,
            PublishStatus publishStatusCd,
            String fileName,
            String filePath,
            int encryptStatusCd,
            Long registrantId) {
        BookRevision revision = new BookRevision();
        revision.bookId = bookId;
        revision.revisionNo = revisionNo;
        revision.publishedYn = publishedYn;
        revision.publishStatusCd = publishStatusCd;
        revision.fileName = fileName;
        revision.filePath = filePath;
        revision.encryptStatusCd = encryptStatusCd;
        revision.registrantId = registrantId;
        revision.updaterId = registrantId;
        return revision;
    }

    /** revisionNo는 유니크 제약(book_id, revision_no)의 일부라 등록 후 변경하지 않는다. */
    public void update(
            boolean publishedYn,
            PublishStatus publishStatusCd,
            String fileName,
            String filePath,
            int encryptStatusCd,
            Long updaterId) {
        this.publishedYn = publishedYn;
        this.publishStatusCd = publishStatusCd;
        this.fileName = fileName;
        this.filePath = filePath;
        this.encryptStatusCd = encryptStatusCd;
        this.updaterId = updaterId;
    }
}
