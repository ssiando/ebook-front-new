package com.mict.ebook.bookset.repository.mapper;

import com.mict.ebook.bookset.domain.BookSet;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BookSetMapper {

    List<BookSet> search(@Param("keyword") String keyword);

    Optional<BookSet> findById(@Param("id") Long id);

    boolean existsBySetName(@Param("setName") String setName);

    boolean existsBySetNameExcludingId(@Param("setName") String setName, @Param("id") Long id);

    void insert(BookSet bookSet);

    void update(BookSet bookSet);

    void deleteById(@Param("id") Long id);

    long countBooksBySetId(@Param("setId") Long setId);

    List<Long> findBookIdsBySetId(@Param("setId") Long setId);

    void deleteBookSetItems(@Param("setId") Long setId);

    void insertBookSetItems(@Param("setId") Long setId, @Param("bookIds") List<Long> bookIds);
}
