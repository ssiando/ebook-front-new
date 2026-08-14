package com.mict.ebook.book.mapper;

import com.mict.ebook.book.domain.BookRevision;
import com.mict.ebook.book.dto.BookRevisionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookRevisionRestMapper {

    BookRevisionResponse toResponse(BookRevision revision);
}
