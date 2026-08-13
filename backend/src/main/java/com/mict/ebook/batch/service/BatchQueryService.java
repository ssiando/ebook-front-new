package com.mict.ebook.batch.service;

import com.mict.ebook.batch.domain.BatchErrorCode;
import com.mict.ebook.batch.domain.BatchJob;
import com.mict.ebook.batch.dto.BatchResponse;
import com.mict.ebook.batch.dto.BatchSearchRequest;
import com.mict.ebook.batch.mapper.BatchRestMapper;
import com.mict.ebook.batch.repository.mapper.BatchMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BatchQueryService {

    private final BatchMapper batchMapper;
    private final BatchRestMapper batchRestMapper;

    public List<BatchResponse> search(BatchSearchRequest request) {
        return batchMapper.search(request.keyword()).stream()
                .map(batchRestMapper::toResponse)
                .toList();
    }

    public BatchResponse getById(Long id) {
        return batchRestMapper.toResponse(findBatch(id));
    }

    private BatchJob findBatch(Long id) {
        return batchMapper.findById(id).orElseThrow(() -> new BusinessException(BatchErrorCode.BATCH_NOT_FOUND));
    }
}
