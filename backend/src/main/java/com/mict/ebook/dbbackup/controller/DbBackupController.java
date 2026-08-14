package com.mict.ebook.dbbackup.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.common.security.AuthContext;
import com.mict.ebook.dbbackup.dto.DbBackupResponse;
import com.mict.ebook.dbbackup.dto.DbBackupSearchRequest;
import com.mict.ebook.dbbackup.dto.UpdateDbBackupRequest;
import com.mict.ebook.dbbackup.service.DbBackupCommandService;
import com.mict.ebook.dbbackup.service.DbBackupJobService;
import com.mict.ebook.dbbackup.service.DbBackupQueryService;
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
@RequestMapping("/api/db-backups")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class DbBackupController {

    private final DbBackupQueryService dbBackupQueryService;
    private final DbBackupCommandService dbBackupCommandService;
    private final DbBackupJobService dbBackupJobService;

    @GetMapping
    public ApiResponse<List<DbBackupResponse>> search(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(dbBackupQueryService.search(new DbBackupSearchRequest(keyword)));
    }

    @GetMapping("/{id}")
    public ApiResponse<DbBackupResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(dbBackupQueryService.getById(id));
    }

    @PostMapping("/run")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DbBackupResponse> runBackup() {
        return ApiResponse.success(dbBackupJobService.runBackup(AuthContext.getCurrentAdminPk()));
    }

    @PostMapping("/{id}/restore")
    public ApiResponse<DbBackupResponse> runRestore(@PathVariable Long id) {
        return ApiResponse.success(dbBackupJobService.runRestore(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<DbBackupResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateDbBackupRequest request) {
        return ApiResponse.success(dbBackupCommandService.rename(id, request, AuthContext.getCurrentAdminPk()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        dbBackupCommandService.delete(id);
    }
}
