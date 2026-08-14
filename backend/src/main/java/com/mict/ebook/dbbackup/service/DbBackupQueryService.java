package com.mict.ebook.dbbackup.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.dbbackup.domain.DbBackupErrorCode;
import com.mict.ebook.dbbackup.dto.DbBackupResponse;
import com.mict.ebook.dbbackup.dto.DbBackupSearchRequest;
import com.mict.ebook.dbbackup.mapper.DbBackupRestMapper;
import com.mict.ebook.dbbackup.repository.mapper.DbBackupMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DbBackupQueryService {

    private final DbBackupMapper dbBackupMapper;
    private final DbBackupRestMapper dbBackupRestMapper;

    public List<DbBackupResponse> search(DbBackupSearchRequest request) {
        return dbBackupMapper.search(request.keyword()).stream()
                .map(dbBackupRestMapper::toResponse)
                .toList();
    }

    public DbBackupResponse getById(Long id) {
        return dbBackupRestMapper.toResponse(dbBackupMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(DbBackupErrorCode.DB_BACKUP_NOT_FOUND)));
    }
}
