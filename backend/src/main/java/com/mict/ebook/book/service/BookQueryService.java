package com.mict.ebook.book.service;

import com.mict.ebook.book.domain.Book;
import com.mict.ebook.book.domain.BookErrorCode;
import com.mict.ebook.book.dto.BookResponse;
import com.mict.ebook.book.dto.BookSearchRequest;
import com.mict.ebook.book.mapper.BookRestMapper;
import com.mict.ebook.book.repository.mapper.BookMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookQueryService {

    private final BookMapper bookMapper;
    private final BookRestMapper bookRestMapper;

    public List<BookResponse> search(BookSearchRequest request) {
        return bookMapper.search(request.keyword(), request.bookType(), request.activeYn()).stream()
                .map(bookRestMapper::toResponse)
                .toList();
    }

    public BookResponse getById(Long id) {
        return bookRestMapper.toResponse(findBook(id));
    }

    private Book findBook(Long id) {
        return bookMapper.findById(id).orElseThrow(() -> new BusinessException(BookErrorCode.BOOK_NOT_FOUND));
    }
}
