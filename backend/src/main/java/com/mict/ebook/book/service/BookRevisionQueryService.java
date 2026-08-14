package com.mict.ebook.book.service;

import com.mict.ebook.book.dto.BookRevisionResponse;
import com.mict.ebook.book.mapper.BookRevisionRestMapper;
import com.mict.ebook.book.repository.mapper.BookRevisionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookRevisionQueryService {

    private final BookRevisionMapper bookRevisionMapper;
    private final BookRevisionRestMapper bookRevisionRestMapper;

    public List<BookRevisionResponse> listByBookId(Long bookId) {
        return bookRevisionMapper.findByBookId(bookId).stream()
                .map(bookRevisionRestMapper::toResponse)
                .toList();
    }
}
