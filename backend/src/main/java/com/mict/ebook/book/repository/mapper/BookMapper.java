package com.mict.ebook.book.repository.mapper;

import com.mict.ebook.book.domain.Book;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BookMapper {

    List<Book> search(
            @Param("keyword") String keyword, @Param("bookType") String bookType, @Param("activeYn") Boolean activeYn);

    Optional<Book> findById(@Param("id") Long id);

    boolean existsByIsbn(@Param("isbn") String isbn);

    boolean existsByIsbnExcludingId(@Param("isbn") String isbn, @Param("id") Long id);

    void insert(Book book);

    void update(Book book);

    void deleteById(@Param("id") Long id);
}
