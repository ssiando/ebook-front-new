package com.mict.ebook.dbbackup.service;

import com.mict.ebook.batch.config.DbBackupProperties;
import com.mict.ebook.batch.job.DbRestoreExecutor;
import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.dbbackup.domain.DbBackup;
import com.mict.ebook.dbbackup.domain.DbBackupErrorCode;
import com.mict.ebook.dbbackup.domain.JobResultStatus;
import com.mict.ebook.dbbackup.dto.DbBackupResponse;
import com.mict.ebook.dbbackup.mapper.DbBackupRestMapper;
import com.mict.ebook.dbbackup.repository.mapper.DbBackupMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Service;

/**
 * DB 백업은 Spring Batch Job(dbBackupJob, batch 패키지)을 그대로 재사용해 실행하고 결과를 cm_db_backup_bas에
 * 기록한다. DB 복원은 JobRepository 없이 {@link DbRestoreExecutor}를 직접 호출한다 — 그 이유는
 * DbRestoreExecutor의 클래스 주석 참고(복원 SQL이 JobRepository 자신의 메타데이터 테이블까지
 * 되돌려버려 Job으로 감싸면 자기 자신의 실행 기록을 잃는 구조적 모순이 있다).
 *
 * <p>Job 실행 자체는 JobRepository가 자체 트랜잭션으로 관리하므로 이 서비스는 @Transactional을 걸지 않는다
 * (batch.service.BatchService와 동일한 이유).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DbBackupJobService {

    private static final DateTimeFormatter BACKUP_NAME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final JobLauncher jobLauncher;
    private final Job dbBackupJob;
    private final DbRestoreExecutor dbRestoreExecutor;
    private final DbBackupProperties dbBackupProperties;
    private final DbBackupMapper dbBackupMapper;
    private final DbBackupRestMapper dbBackupRestMapper;

    public DbBackupResponse runBackup(Long currentAdminPk) {
        String backupName = "ebook_backup_" + BACKUP_NAME_FORMAT.format(LocalDateTime.now());

        JobParameters jobParameters = new JobParametersBuilder()
                .addString("targetPath", dbBackupProperties.targetPath())
                .addLong("runAt", System.currentTimeMillis())
                .toJobParameters();

        JobExecution jobExecution;
        try {
            jobExecution = jobLauncher.run(dbBackupJob, jobParameters);
        } catch (Exception e) {
            log.error("[DbBackupJobService] 백업 Job 실행 실패", e);
            return persistBackup(backupName, "", 0, JobResultStatus.FAILED, currentAdminPk);
        }

        if (jobExecution.getStatus() != BatchStatus.COMPLETED) {
            return persistBackup(backupName, "", 0, JobResultStatus.FAILED, currentAdminPk);
        }

        StepExecution stepExecution =
                jobExecution.getStepExecutions().stream().findFirst().orElse(null);
        ExecutionContext executionContext = stepExecution == null ? null : stepExecution.getExecutionContext();
        String outputFilePath = executionContext == null ? "" : executionContext.getString("outputFilePath", "");
        long outputFileSize = executionContext == null ? 0 : executionContext.getLong("outputFileSize", 0);

        return persistBackup(backupName, outputFilePath, outputFileSize, JobResultStatus.SUCCESS, currentAdminPk);
    }

    public DbBackupResponse runRestore(Long id) {
        DbBackup dbBackup = dbBackupMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(DbBackupErrorCode.DB_BACKUP_NOT_FOUND));
        if (dbBackup.getStatus() != JobResultStatus.SUCCESS || !Files.isReadable(Path.of(dbBackup.getFilePath()))) {
            throw new BusinessException(DbBackupErrorCode.DB_BACKUP_FILE_MISSING);
        }

        JobResultStatus restoreStatus;
        try {
            dbRestoreExecutor.restore(dbBackup.getFilePath());
            restoreStatus = JobResultStatus.SUCCESS;
        } catch (Exception e) {
            log.error("[DbBackupJobService] 복원 실행 실패", e);
            restoreStatus = JobResultStatus.FAILED;
        }

        dbBackupMapper.updateRestoreResult(id, restoreStatus.name(), LocalDateTime.now());
        if (restoreStatus == JobResultStatus.FAILED) {
            throw new BusinessException(DbBackupErrorCode.DB_RESTORE_FAILED);
        }

        DbBackup updated = dbBackupMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(DbBackupErrorCode.DB_BACKUP_NOT_FOUND));
        return dbBackupRestMapper.toResponse(updated);
    }

    private DbBackupResponse persistBackup(
            String backupName, String filePath, long fileSizeBytes, JobResultStatus status, Long currentAdminPk) {
        DbBackup backup = DbBackup.createNew(backupName, filePath, fileSizeBytes, status, currentAdminPk);
        dbBackupMapper.insert(backup);
        if (status == JobResultStatus.FAILED) {
            throw new BusinessException(DbBackupErrorCode.DB_BACKUP_JOB_FAILED);
        }
        return dbBackupRestMapper.toResponse(backup);
    }
}
