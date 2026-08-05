package com.mict.ebook.commoncode.controller;

import com.mict.ebook.commoncode.dto.CodeGroupResponse;
import com.mict.ebook.commoncode.dto.CodeItemResponse;
import com.mict.ebook.commoncode.dto.CommonCodeSearchRequest;
import com.mict.ebook.commoncode.dto.CreateCodeGroupRequest;
import com.mict.ebook.commoncode.dto.CreateCodeItemRequest;
import com.mict.ebook.commoncode.dto.UpdateCodeGroupRequest;
import com.mict.ebook.commoncode.dto.UpdateCodeItemRequest;
import com.mict.ebook.commoncode.service.CommonCodeCommandService;
import com.mict.ebook.commoncode.service.CommonCodeQueryService;
import com.mict.ebook.common.response.ApiResponse;
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
@RequestMapping("/api/common-codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeQueryService commonCodeQueryService;
    private final CommonCodeCommandService commonCodeCommandService;

    @GetMapping("/groups")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<List<CodeGroupResponse>> searchGroups(
            @RequestParam(required = false) String keyword, @RequestParam(required = false) String useYn) {
        var request = new CommonCodeSearchRequest(keyword, useYn);
        return ApiResponse.success(commonCodeQueryService.searchGroups(request));
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<CodeGroupResponse> createGroup(@Valid @RequestBody CreateCodeGroupRequest request) {
        return ApiResponse.success(commonCodeCommandService.createGroup(request));
    }

    @PutMapping("/groups/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<CodeGroupResponse> updateGroup(
            @PathVariable Long id, @Valid @RequestBody UpdateCodeGroupRequest request) {
        return ApiResponse.success(commonCodeCommandService.updateGroup(id, request));
    }

    @DeleteMapping("/groups/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public void deleteGroup(@PathVariable Long id) {
        commonCodeCommandService.deleteGroup(id);
    }

    @GetMapping("/groups/{groupId}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<List<CodeItemResponse>> getItems(@PathVariable Long groupId) {
        return ApiResponse.success(commonCodeQueryService.findItemsByGroupId(groupId));
    }

    /** 그룹코드로 사용 중인 코드 항목만 조회합니다 (다른 화면의 select 옵션/배지 라벨 조회용). */
    @GetMapping("/groups/by-code/{groupCode}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<List<CodeItemResponse>> getItemsByGroupCode(@PathVariable String groupCode) {
        return ApiResponse.success(commonCodeQueryService.findItemsByGroupCode(groupCode));
    }

    @PostMapping("/groups/{groupId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<CodeItemResponse> createItem(
            @PathVariable Long groupId, @Valid @RequestBody CreateCodeItemRequest request) {
        return ApiResponse.success(commonCodeCommandService.createItem(groupId, request));
    }

    @PutMapping("/groups/{groupId}/items/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public ApiResponse<CodeItemResponse> updateItem(
            @PathVariable Long groupId, @PathVariable Long id, @Valid @RequestBody UpdateCodeItemRequest request) {
        return ApiResponse.success(commonCodeCommandService.updateItem(groupId, id, request));
    }

    @DeleteMapping("/groups/{groupId}/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
    public void deleteItem(@PathVariable Long groupId, @PathVariable Long id) {
        commonCodeCommandService.deleteItem(groupId, id);
    }
}
