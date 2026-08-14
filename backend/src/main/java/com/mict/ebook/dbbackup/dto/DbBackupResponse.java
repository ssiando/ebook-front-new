package com.mict.ebook.dbbackup.dto;

import com.mict.ebook.dbbackup.domain.JobResultStatus;
import java.time.LocalDateTime;

public record DbBackupResponse(
        Long id,
        String backupName,
        String filePath,
        long fileSizeBytes,
        JobResultStatus status,
        LocalDateTime restoredAt,
        JobResultStatus restoreStatus,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
