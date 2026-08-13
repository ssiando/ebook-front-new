package com.mict.ebook.workspace.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.workspace.dto.CreateWorkspaceRequest;
import com.mict.ebook.workspace.dto.UpdateWorkspaceRequest;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import com.mict.ebook.workspace.dto.WorkspaceSearchRequest;
import com.mict.ebook.workspace.service.WorkspaceCommandService;
import com.mict.ebook.workspace.service.WorkspaceQueryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
//@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class WorkspaceController {

    private final WorkspaceQueryService workspaceQueryService;
    private final WorkspaceCommandService workspaceCommandService;

    @GetMapping
    public ApiResponse<List<WorkspaceResponse>> search(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(workspaceQueryService.search(new WorkspaceSearchRequest(keyword)));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkspaceResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(workspaceQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkspaceResponse> create(
            @Valid @RequestBody CreateWorkspaceRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(workspaceCommandService.create(request, currentAdminPk));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkspaceResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateWorkspaceRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(workspaceCommandService.update(id, request, currentAdminPk));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        workspaceCommandService.delete(id);
    }
}
