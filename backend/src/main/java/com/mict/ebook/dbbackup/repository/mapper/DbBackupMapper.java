package com.mict.ebook.dbbackup.repository.mapper;

import com.mict.ebook.dbbackup.domain.DbBackup;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DbBackupMapper {

    List<DbBackup> search(@Param("keyword") String keyword);

    Optional<DbBackup> findById(@Param("id") Long id);

    boolean existsByBackupName(@Param("backupName") String backupName);

    boolean existsByBackupNameExcludingId(@Param("backupName") String backupName, @Param("id") Long id);

    void insert(DbBackup dbBackup);

    void update(DbBackup dbBackup);

    void updateRestoreResult(
            @Param("id") Long id,
            @Param("restoreStatus") String restoreStatus,
            @Param("restoredAt") LocalDateTime restoredAt);

    void deleteById(@Param("id") Long id);
}
