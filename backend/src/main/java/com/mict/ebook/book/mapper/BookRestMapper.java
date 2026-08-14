package com.mict.ebook.book.mapper;

import com.mict.ebook.book.domain.Book;
import com.mict.ebook.book.dto.BookResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookRestMapper {

    BookResponse toResponse(Book book);
}
