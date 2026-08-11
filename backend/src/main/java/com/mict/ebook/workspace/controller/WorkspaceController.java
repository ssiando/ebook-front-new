package com.mict.ebook.workspace.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import com.mict.ebook.workspace.service.WorkspaceQueryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class WorkspaceController {

    private final WorkspaceQueryService workspaceQueryService;

    @GetMapping
    public ApiResponse<List<WorkspaceResponse>> findAll() {
        return ApiResponse.success(workspaceQueryService.findAll());
    }
}
