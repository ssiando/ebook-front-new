package com.mict.ebook.menu.controller;

import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.common.response.PageResponse;
import com.mict.ebook.menu.dto.CreateMenuRequest;
import com.mict.ebook.menu.dto.MenuResponse;
import com.mict.ebook.menu.dto.MenuSearchRequest;
import com.mict.ebook.menu.dto.UpdateMenuRequest;
import com.mict.ebook.menu.service.MenuCommandService;
import com.mict.ebook.menu.service.MenuQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/menus")
@RequiredArgsConstructor
// @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'WORKSPACE_ADMIN')")
public class MenuController {

    private final MenuQueryService menuQueryService;
    private final MenuCommandService menuCommandService;

    @GetMapping
    public ApiResponse<PageResponse<MenuResponse>> search(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        var request = new MenuSearchRequest(parentId, keyword, page, pageSize);
        return ApiResponse.success(menuQueryService.search(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuResponse> getById(@PathVariable String id) {
        return ApiResponse.success(menuQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MenuResponse> create(@Valid @RequestBody CreateMenuRequest request) {
        return ApiResponse.success(menuCommandService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MenuResponse> update(@PathVariable String id, @Valid @RequestBody UpdateMenuRequest request) {
        return ApiResponse.success(menuCommandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        menuCommandService.delete(id);
    }
}
