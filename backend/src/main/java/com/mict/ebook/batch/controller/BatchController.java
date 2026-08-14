package com.mict.ebook.batch.controller;

import com.mict.ebook.batch.dto.BatchResponse;
import com.mict.ebook.batch.dto.BatchSearchRequest;
import com.mict.ebook.batch.dto.CreateBatchRequest;
import com.mict.ebook.batch.dto.DbBackupResultResponse;
import com.mict.ebook.batch.dto.UpdateBatchRequest;
import com.mict.ebook.batch.service.BatchCommandService;
import com.mict.ebook.batch.service.BatchQueryService;
import com.mict.ebook.batch.service.BatchService;
import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.common.security.AuthContext;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class BatchController {

    private final BatchService batchService;
    private final BatchQueryService batchQueryService;
    private final BatchCommandService batchCommandService;

    @PostMapping("/db-backup/run")
    public ApiResponse<DbBackupResultResponse> runDbBackup() {
        return ApiResponse.success(batchService.runDbBackup());
    }

    @GetMapping
    public ApiResponse<List<BatchResponse>> search(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(batchQueryService.search(new BatchSearchRequest(keyword)));
    }

    @GetMapping("/{id}")
    public ApiResponse<BatchResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(batchQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BatchResponse> create(@Valid @RequestBody CreateBatchRequest request) {
        return ApiResponse.success(batchCommandService.create(request, AuthContext.getCurrentAdminPk()));
    }

    @PutMapping("/{id}")
    public ApiResponse<BatchResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateBatchRequest request) {
        return ApiResponse.success(batchCommandService.update(id, request, AuthContext.getCurrentAdminPk()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        batchCommandService.delete(id);
    }

    @PostMapping("/{id}/run")
    public ApiResponse<BatchResponse> run(@PathVariable Long id) {
        return ApiResponse.success(batchCommandService.run(id));
    }
}
