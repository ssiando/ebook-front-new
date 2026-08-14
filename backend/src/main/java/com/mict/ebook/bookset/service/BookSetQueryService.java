package com.mict.ebook.bookset.service;

import com.mict.ebook.bookset.domain.BookSet;
import com.mict.ebook.bookset.domain.BookSetErrorCode;
import com.mict.ebook.bookset.dto.BookSetResponse;
import com.mict.ebook.bookset.dto.BookSetSearchRequest;
import com.mict.ebook.bookset.mapper.BookSetRestMapper;
import com.mict.ebook.bookset.repository.mapper.BookSetMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookSetQueryService {

    private final BookSetMapper bookSetMapper;
    private final BookSetRestMapper bookSetRestMapper;

    public List<BookSetResponse> search(BookSetSearchRequest request) {
        return bookSetMapper.search(request.keyword()).stream()
                .map(this::toResponse)
                .toList();
    }

    public BookSetResponse getById(Long id) {
        return toResponse(findBookSet(id));
    }

    private BookSet findBookSet(Long id) {
        return bookSetMapper.findById(id).orElseThrow(() -> new BusinessException(BookSetErrorCode.BOOK_SET_NOT_FOUND));
    }

    private BookSetResponse toResponse(BookSet bookSet) {
        long bookCount = bookSetMapper.countBooksBySetId(bookSet.getId());
        List<Long> bookIds = bookSetMapper.findBookIdsBySetId(bookSet.getId());
        return bookSetRestMapper.toResponse(bookSet, bookCount, bookIds);
    }
}
