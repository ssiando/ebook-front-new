package com.mict.ebook.book.repository.mapper;

import com.mict.ebook.book.domain.BookRevision;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BookRevisionMapper {

    List<BookRevision> findByBookId(@Param("bookId") Long bookId);

    Optional<BookRevision> findById(@Param("id") Long id);

    boolean existsByBookIdAndRevisionNo(@Param("bookId") Long bookId, @Param("revisionNo") int revisionNo);

    void insert(BookRevision revision);

    void update(BookRevision revision);

    void deleteById(@Param("id") Long id);
}
