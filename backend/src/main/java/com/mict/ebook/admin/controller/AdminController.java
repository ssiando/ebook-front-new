package com.mict.ebook.admin.controller;

import com.mict.ebook.admin.dto.AdminResponse;
import com.mict.ebook.admin.dto.AdminSearchRequest;
import com.mict.ebook.admin.dto.CreateAdminRequest;
import com.mict.ebook.admin.dto.UpdateAdminRequest;
import com.mict.ebook.admin.dto.UpdateAdminRolesRequest;
import com.mict.ebook.admin.service.AdminCommandService;
import com.mict.ebook.admin.service.AdminQueryService;
import com.mict.ebook.common.response.ApiResponse;
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
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class AdminController {

    private final AdminQueryService adminQueryService;
    private final AdminCommandService adminCommandService;

    @GetMapping
    public ApiResponse<List<AdminResponse>> search(
            @RequestParam(required = false) String keyword, @RequestParam(required = false) Boolean activeYn) {
        var request = new AdminSearchRequest(keyword, activeYn);
        return ApiResponse.success(adminQueryService.search(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(adminQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminResponse> create(
            @Valid @RequestBody CreateAdminRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(adminCommandService.create(request, currentAdminPk));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateAdminRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(adminCommandService.update(id, request, currentAdminPk));
    }

    @PutMapping("/{id}/roles")
    public ApiResponse<AdminResponse> updateRoles(
            @PathVariable Long id, @Valid @RequestBody UpdateAdminRolesRequest request) {
        return ApiResponse.success(adminCommandService.updateRoles(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminCommandService.delete(id);
    }
}
