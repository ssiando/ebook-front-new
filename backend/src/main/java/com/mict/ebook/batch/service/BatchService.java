package com.mict.ebook.batch.service;

import com.mict.ebook.batch.config.DbBackupProperties;
import com.mict.ebook.batch.domain.BatchErrorCode;
import com.mict.ebook.batch.dto.DbBackupResultResponse;
import com.mict.ebook.batch.repository.mapper.BatchMapper;
import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.common.exception.ErrorCode;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BatchService {

    /** cm_batch_bas에 등록된 DB 백업 배치 행의 batch_code. 실행 결과를 배치 관리 목록에 반영할 때 이 코드로 행을 찾는다. */
    public static final String DB_BACKUP_BATCH_CODE = "BATCH_DB_BACKUP";

    private final JobLauncher jobLauncher;
    private final Job dbBackupJob;
    private final DbBackupProperties dbBackupProperties;
    private final BatchMapper batchMapper;

    public DbBackupResultResponse runDbBackup() {
        JobParameters jobParameters = new JobParametersBuilder()
                .addString("targetPath", dbBackupProperties.targetPath())
                .addLong("runAt", System.currentTimeMillis())
                .toJobParameters();

        JobExecution jobExecution;
        try {
            jobExecution = jobLauncher.run(dbBackupJob, jobParameters);
        } catch (Exception e) {
            recordRunResult("error");
            throw new BusinessException(BatchErrorCode.JOB_EXECUTION_FAILED);
        }

        if (jobExecution.getStatus() != BatchStatus.COMPLETED) {
            recordRunResult("error");
            throw new BusinessException(resolveFailureErrorCode(jobExecution));
        }

        StepExecution stepExecution = jobExecution.getStepExecutions().stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(BatchErrorCode.JOB_EXECUTION_FAILED));
        ExecutionContext executionContext = stepExecution.getExecutionContext();
        String outputFilePath = executionContext.getString("outputFilePath");
        long outputFileSize = executionContext.getLong("outputFileSize");

        LocalDateTime executedAt = LocalDateTime.now();
        recordRunResult("success", executedAt);
        return new DbBackupResultResponse(outputFilePath, outputFileSize, executedAt);
    }

    private void recordRunResult(String status) {
        recordRunResult(status, LocalDateTime.now());
    }

    private void recordRunResult(String status, LocalDateTime runAt) {
        batchMapper
                .findByCode(DB_BACKUP_BATCH_CODE)
                .ifPresent(batchJob -> batchMapper.updateRunResult(batchJob.getId(), status, runAt));
    }

    private ErrorCode resolveFailureErrorCode(JobExecution jobExecution) {
        return jobExecution.getAllFailureExceptions().stream()
                .filter(BusinessException.class::isInstance)
                .map(BusinessException.class::cast)
                .map(BusinessException::getErrorCode)
                .findFirst()
                .orElse(BatchErrorCode.JOB_EXECUTION_FAILED);
    }
}
