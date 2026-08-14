package com.mict.ebook.dbbackup.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_db_backup_bas 테이블 — DB 백업 실행 이력. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DbBackup {

    private Long id;
    private String backupName;
    private String filePath;
    private long fileSizeBytes;
    private JobResultStatus status;
    private LocalDateTime restoredAt;
    private JobResultStatus restoreStatus;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DbBackup createNew(
            String backupName, String filePath, long fileSizeBytes, JobResultStatus status, Long registrantId) {
        DbBackup backup = new DbBackup();
        backup.backupName = backupName;
        backup.filePath = filePath;
        backup.fileSizeBytes = fileSizeBytes;
        backup.status = status;
        backup.registrantId = registrantId;
        backup.updaterId = registrantId;
        return backup;
    }

    public void rename(String backupName, Long updaterId) {
        this.backupName = backupName;
        this.updaterId = updaterId;
    }

    public void recordRestoreResult(JobResultStatus restoreStatus, LocalDateTime restoredAt) {
        this.restoreStatus = restoreStatus;
        this.restoredAt = restoredAt;
    }
}
