package com.mict.ebook.bookset.mapper;

import com.mict.ebook.bookset.domain.BookSet;
import com.mict.ebook.bookset.dto.BookSetResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookSetRestMapper {

    BookSetResponse toResponse(BookSet bookSet, long bookCount, List<Long> bookIds);
}
