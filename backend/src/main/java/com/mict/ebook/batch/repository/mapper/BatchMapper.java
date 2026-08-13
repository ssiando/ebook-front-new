package com.mict.ebook.batch.repository.mapper;

import com.mict.ebook.batch.domain.BatchJob;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BatchMapper {

    List<BatchJob> search(@Param("keyword") String keyword);

    Optional<BatchJob> findById(@Param("id") Long id);

    Optional<BatchJob> findByCode(@Param("batchCode") String batchCode);

    boolean existsByCode(@Param("batchCode") String batchCode);

    void insert(BatchJob batchJob);

    void update(BatchJob batchJob);

    void updateRunResult(@Param("id") Long id, @Param("status") String status, @Param("runAt") LocalDateTime runAt);

    void deleteById(@Param("id") Long id);
}
