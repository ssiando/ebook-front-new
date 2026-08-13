package com.mict.ebook.program.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.program.dto.DeleteProgramsRequest;
import com.mict.ebook.program.dto.ProgramListResponse;
import com.mict.ebook.program.dto.ProgramSearchRequest;
import com.mict.ebook.program.dto.SaveProgramsRequest;
import com.mict.ebook.program.service.ProgramCommandService;
import com.mict.ebook.program.service.ProgramQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
// @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class ProgramController {

    private final ProgramQueryService programQueryService;
    private final ProgramCommandService programCommandService;

    @GetMapping
    public ApiResponse<ProgramListResponse> search(
            @RequestParam Long workspaceId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String useYn) {
        ProgramSearchRequest request = new ProgramSearchRequest(workspaceId, keyword, type, useYn);
        return ApiResponse.success(programQueryService.search(request));
    }

    @PutMapping
    public ApiResponse<ProgramListResponse> save(
            @Valid @RequestBody SaveProgramsRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long currentAdminPk = jwt.getClaim("adminPk");
        return ApiResponse.success(programCommandService.saveAll(request, currentAdminPk));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@Valid @RequestBody DeleteProgramsRequest request) {
        programCommandService.deleteAll(request);
    }
}
