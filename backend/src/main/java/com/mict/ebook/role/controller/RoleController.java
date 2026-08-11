package com.mict.ebook.role.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.role.dto.CreateRoleRequest;
import com.mict.ebook.role.dto.RoleResponse;
import com.mict.ebook.role.dto.RoleSearchRequest;
import com.mict.ebook.role.dto.UpdateRoleProgramsRequest;
import com.mict.ebook.role.dto.UpdateRoleRequest;
import com.mict.ebook.role.service.RoleCommandService;
import com.mict.ebook.role.service.RoleQueryService;
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
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class RoleController {

    private final RoleQueryService roleQueryService;
    private final RoleCommandService roleCommandService;

    @GetMapping
    public ApiResponse<List<RoleResponse>> search(
            @RequestParam Long workspaceId, @RequestParam(required = false) String keyword) {
        var request = new RoleSearchRequest(workspaceId, keyword);
        return ApiResponse.success(roleQueryService.search(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(roleQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RoleResponse> create(@Valid @RequestBody CreateRoleRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(roleCommandService.create(request, currentAdminPk));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(roleCommandService.update(id, request, currentAdminPk));
    }

    @PutMapping("/{id}/programs")
    public ApiResponse<RoleResponse> updatePrograms(
            @PathVariable Long id, @Valid @RequestBody UpdateRoleProgramsRequest request) {
        return ApiResponse.success(roleCommandService.updatePrograms(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        roleCommandService.delete(id);
    }
}
