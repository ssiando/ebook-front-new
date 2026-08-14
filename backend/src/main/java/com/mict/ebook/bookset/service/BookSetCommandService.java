package com.mict.ebook.bookset.service;

import com.mict.ebook.bookset.domain.BookSet;
import com.mict.ebook.bookset.domain.BookSetErrorCode;
import com.mict.ebook.bookset.dto.BookSetResponse;
import com.mict.ebook.bookset.dto.CreateBookSetRequest;
import com.mict.ebook.bookset.dto.UpdateBookSetRequest;
import com.mict.ebook.bookset.mapper.BookSetRestMapper;
import com.mict.ebook.bookset.repository.mapper.BookSetMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BookSetCommandService {

    private final BookSetMapper bookSetMapper;
    private final BookSetRestMapper bookSetRestMapper;

    public BookSetResponse create(CreateBookSetRequest request, Long currentAdminPk) {
        if (bookSetMapper.existsBySetName(request.setName())) {
            throw new BusinessException(BookSetErrorCode.BOOK_SET_NAME_DUPLICATE);
        }

        BookSet bookSet = BookSet.createNew(request.setName(), request.description(), currentAdminPk);
        bookSetMapper.insert(bookSet);
        return bookSetRestMapper.toResponse(bookSet, 0, List.of());
    }

    public BookSetResponse update(Long id, UpdateBookSetRequest request, Long currentAdminPk) {
        BookSet bookSet = findBookSet(id);
        if (bookSetMapper.existsBySetNameExcludingId(request.setName(), id)) {
            throw new BusinessException(BookSetErrorCode.BOOK_SET_NAME_DUPLICATE);
        }

        bookSet.update(request.setName(), request.description(), request.activeYn(), currentAdminPk);
        bookSetMapper.update(bookSet);
        return bookSetRestMapper.toResponse(
                bookSet, bookSetMapper.countBooksBySetId(id), bookSetMapper.findBookIdsBySetId(id));
    }

    public void delete(Long id) {
        findBookSet(id);
        bookSetMapper.deleteBookSetItems(id);
        bookSetMapper.deleteById(id);
    }

    public BookSetResponse updateBooks(Long id, List<Long> bookIds) {
        BookSet bookSet = findBookSet(id);
        bookSetMapper.deleteBookSetItems(id);
        if (!bookIds.isEmpty()) {
            bookSetMapper.insertBookSetItems(id, bookIds);
        }
        long bookCount = bookSetMapper.countBooksBySetId(id);
        return bookSetRestMapper.toResponse(bookSet, bookCount, bookIds);
    }

    private BookSet findBookSet(Long id) {
        return bookSetMapper.findById(id).orElseThrow(() -> new BusinessException(BookSetErrorCode.BOOK_SET_NOT_FOUND));
    }
}
