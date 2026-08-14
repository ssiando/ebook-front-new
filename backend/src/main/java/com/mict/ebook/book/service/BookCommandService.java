package com.mict.ebook.book.service;

import com.mict.ebook.book.domain.Book;
import com.mict.ebook.book.domain.BookErrorCode;
import com.mict.ebook.book.dto.BookResponse;
import com.mict.ebook.book.dto.CreateBookRequest;
import com.mict.ebook.book.dto.UpdateBookRequest;
import com.mict.ebook.book.mapper.BookRestMapper;
import com.mict.ebook.book.repository.mapper.BookMapper;
import com.mict.ebook.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BookCommandService {

    private final BookMapper bookMapper;
    private final BookRestMapper bookRestMapper;

    public BookResponse create(CreateBookRequest request, Long currentAdminPk) {
        if (StringUtils.hasText(request.isbn()) && bookMapper.existsByIsbn(request.isbn())) {
            throw new BusinessException(BookErrorCode.ISBN_DUPLICATE);
        }

        Book book = Book.createNew(
                request.title(),
                request.subtitle(),
                request.bookType(),
                request.pageCount(),
                request.copyrightOwner(),
                request.firstPublishDt(),
                request.publisher(),
                request.isbn(),
                request.freeYn(),
                request.coverImageUrl(),
                request.thumbnailUrl(),
                currentAdminPk);
        bookMapper.insert(book);
        return bookRestMapper.toResponse(book);
    }

    public BookResponse update(Long id, UpdateBookRequest request, Long currentAdminPk) {
        Book book = findBook(id);
        if (StringUtils.hasText(request.isbn()) && bookMapper.existsByIsbnExcludingId(request.isbn(), id)) {
            throw new BusinessException(BookErrorCode.ISBN_DUPLICATE);
        }

        book.update(
                request.title(),
                request.subtitle(),
                request.bookType(),
                request.pageCount(),
                request.copyrightOwner(),
                request.firstPublishDt(),
                request.publisher(),
                request.isbn(),
                request.freeYn(),
                request.coverImageUrl(),
                request.thumbnailUrl(),
                request.activeYn(),
                currentAdminPk);
        bookMapper.update(book);
        return bookRestMapper.toResponse(book);
    }

    public void delete(Long id) {
        findBook(id);
        bookMapper.deleteById(id);
    }

    private Book findBook(Long id) {
        return bookMapper.findById(id).orElseThrow(() -> new BusinessException(BookErrorCode.BOOK_NOT_FOUND));
    }
}
