package com.mict.ebook.book.service;

import com.mict.ebook.book.domain.BookErrorCode;
import com.mict.ebook.book.domain.BookRevision;
import com.mict.ebook.book.dto.BookRevisionResponse;
import com.mict.ebook.book.dto.CreateBookRevisionRequest;
import com.mict.ebook.book.dto.UpdateBookRevisionRequest;
import com.mict.ebook.book.mapper.BookRevisionRestMapper;
import com.mict.ebook.book.repository.mapper.BookMapper;
import com.mict.ebook.book.repository.mapper.BookRevisionMapper;
import com.mict.ebook.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BookRevisionCommandService {

    private final BookMapper bookMapper;
    private final BookRevisionMapper bookRevisionMapper;
    private final BookRevisionRestMapper bookRevisionRestMapper;

    public BookRevisionResponse create(Long bookId, CreateBookRevisionRequest request, Long currentAdminPk) {
        bookMapper.findById(bookId).orElseThrow(() -> new BusinessException(BookErrorCode.BOOK_NOT_FOUND));
        if (bookRevisionMapper.existsByBookIdAndRevisionNo(bookId, request.revisionNo())) {
            throw new BusinessException(BookErrorCode.REVISION_NO_DUPLICATE);
        }

        BookRevision revision = BookRevision.createNew(
                bookId,
                request.revisionNo(),
                request.publishedYn(),
                request.publishStatusCd(),
                request.fileName(),
                request.filePath(),
                request.encryptStatusCd(),
                currentAdminPk);
        bookRevisionMapper.insert(revision);
        return bookRevisionRestMapper.toResponse(revision);
    }

    public BookRevisionResponse update(Long id, UpdateBookRevisionRequest request, Long currentAdminPk) {
        BookRevision revision = findRevision(id);
        revision.update(
                request.publishedYn(),
                request.publishStatusCd(),
                request.fileName(),
                request.filePath(),
                request.encryptStatusCd(),
                currentAdminPk);
        bookRevisionMapper.update(revision);
        return bookRevisionRestMapper.toResponse(revision);
    }

    public void delete(Long id) {
        findRevision(id);
        bookRevisionMapper.deleteById(id);
    }

    private BookRevision findRevision(Long id) {
        return bookRevisionMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(BookErrorCode.REVISION_NOT_FOUND));
    }
}
