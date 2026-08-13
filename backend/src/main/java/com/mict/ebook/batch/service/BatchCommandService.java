package com.mict.ebook.batch.service;

import com.mict.ebook.batch.domain.BatchErrorCode;
import com.mict.ebook.batch.domain.BatchJob;
import com.mict.ebook.batch.dto.BatchResponse;
import com.mict.ebook.batch.dto.CreateBatchRequest;
import com.mict.ebook.batch.dto.UpdateBatchRequest;
import com.mict.ebook.batch.mapper.BatchRestMapper;
import com.mict.ebook.batch.repository.mapper.BatchMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BatchCommandService {

    private final BatchMapper batchMapper;
    private final BatchRestMapper batchRestMapper;

    public BatchResponse create(CreateBatchRequest request, Long currentAdminPk) {
        if (batchMapper.existsByCode(request.batchCode())) {
            throw new BusinessException(BatchErrorCode.BATCH_CODE_DUPLICATE);
        }

        BatchJob batchJob = BatchJob.createNew(
                request.batchCode(),
                request.batchName(),
                request.schedule(),
                request.description(),
                request.requiresPath(),
                currentAdminPk);
        batchMapper.insert(batchJob);
        return batchRestMapper.toResponse(batchJob);
    }

    public BatchResponse update(Long id, UpdateBatchRequest request, Long currentAdminPk) {
        BatchJob batchJob = findBatch(id);
        batchJob.update(
                request.batchName(), request.schedule(), request.description(), request.requiresPath(), currentAdminPk);
        batchMapper.update(batchJob);
        return batchRestMapper.toResponse(batchJob);
    }

    public void delete(Long id) {
        findBatch(id);
        batchMapper.deleteById(id);
    }

    /** 실제 실행 로직이 없는 배치(수동 확인용/등록 전용)는 실행 결과를 성공으로 기록만 한다. DB 백업처럼 경로 입력이 필요한 배치는 BatchService.runDbBackup을 통해 별도로 실행한다. */
    public BatchResponse run(Long id) {
        BatchJob batchJob = findBatch(id);
        batchJob.recordRunResult("success", LocalDateTime.now());
        batchMapper.updateRunResult(id, batchJob.getLastRunStatus(), batchJob.getLastRunAt());
        return batchRestMapper.toResponse(batchJob);
    }

    private BatchJob findBatch(Long id) {
        return batchMapper.findById(id).orElseThrow(() -> new BusinessException(BatchErrorCode.BATCH_NOT_FOUND));
    }
}
