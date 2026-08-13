package com.mict.ebook.batch.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_batch_bas 테이블 — 배치 작업 정의 (Spring Batch의 Job/JobExecution과 이름이 겹치지 않도록 BatchJob으로 둔다). */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BatchJob {

    private Long id;
    private String batchCode;
    private String batchName;
    private String schedule;
    private String description;
    private boolean requiresPath;
    private String lastRunStatus;
    private LocalDateTime lastRunAt;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BatchJob createNew(
            String batchCode,
            String batchName,
            String schedule,
            String description,
            boolean requiresPath,
            Long registrantId) {
        BatchJob batchJob = new BatchJob();
        batchJob.batchCode = batchCode;
        batchJob.batchName = batchName;
        batchJob.schedule = schedule;
        batchJob.description = description;
        batchJob.requiresPath = requiresPath;
        batchJob.lastRunStatus = "default";
        batchJob.registrantId = registrantId;
        batchJob.updaterId = registrantId;
        return batchJob;
    }

    public void update(String batchName, String schedule, String description, boolean requiresPath, Long updaterId) {
        this.batchName = batchName;
        this.schedule = schedule;
        this.description = description;
        this.requiresPath = requiresPath;
        this.updaterId = updaterId;
    }

    public void recordRunResult(String status, LocalDateTime runAt) {
        this.lastRunStatus = status;
        this.lastRunAt = runAt;
    }
}
