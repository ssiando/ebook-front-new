package com.mict.ebook.dbbackup.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.dbbackup.domain.DbBackup;
import com.mict.ebook.dbbackup.domain.DbBackupErrorCode;
import com.mict.ebook.dbbackup.dto.DbBackupResponse;
import com.mict.ebook.dbbackup.dto.UpdateDbBackupRequest;
import com.mict.ebook.dbbackup.mapper.DbBackupRestMapper;
import com.mict.ebook.dbbackup.repository.mapper.DbBackupMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class DbBackupCommandService {

    private final DbBackupMapper dbBackupMapper;
    private final DbBackupRestMapper dbBackupRestMapper;

    public DbBackupResponse rename(Long id, UpdateDbBackupRequest request, Long currentAdminPk) {
        DbBackup dbBackup = findDbBackup(id);
        if (dbBackupMapper.existsByBackupNameExcludingId(request.backupName(), id)) {
            throw new BusinessException(DbBackupErrorCode.DB_BACKUP_NAME_DUPLICATE);
        }

        dbBackup.rename(request.backupName(), currentAdminPk);
        dbBackupMapper.update(dbBackup);
        return dbBackupRestMapper.toResponse(dbBackup);
    }

    /** DB 레코드와 함께 실제 백업 파일도 정리한다. 파일 삭제가 실패해도(권한 등) 목록 정리 자체는 막지 않는다. */
    public void delete(Long id) {
        DbBackup dbBackup = findDbBackup(id);
        dbBackupMapper.deleteById(id);

        if (!dbBackup.getFilePath().isBlank()) {
            try {
                Files.deleteIfExists(Path.of(dbBackup.getFilePath()));
            } catch (IOException e) {
                log.warn("[DbBackupCommandService] 백업 파일 삭제 실패: {}", dbBackup.getFilePath(), e);
            }
        }
    }

    private DbBackup findDbBackup(Long id) {
        return dbBackupMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(DbBackupErrorCode.DB_BACKUP_NOT_FOUND));
    }
}
