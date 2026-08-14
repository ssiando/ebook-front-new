package com.mict.ebook.book.controller;

import com.mict.ebook.book.dto.BookFileUploadResponse;
import com.mict.ebook.book.dto.BookResponse;
import com.mict.ebook.book.dto.BookSearchRequest;
import com.mict.ebook.book.dto.CreateBookRequest;
import com.mict.ebook.book.dto.UpdateBookRequest;
import com.mict.ebook.book.service.BookCommandService;
import com.mict.ebook.book.service.BookFileStorageService;
import com.mict.ebook.book.service.BookQueryService;
import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.common.security.AuthContext;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookQueryService bookQueryService;
    private final BookCommandService bookCommandService;
    private final BookFileStorageService bookFileStorageService;

    @GetMapping
    public ApiResponse<List<BookResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String bookType,
            @RequestParam(required = false) Boolean activeYn) {
        return ApiResponse.success(bookQueryService.search(new BookSearchRequest(keyword, bookType, activeYn)));
    }

    @GetMapping("/{id}")
    public ApiResponse<BookResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(bookQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookResponse> create(@Valid @RequestBody CreateBookRequest request) {
        return ApiResponse.success(bookCommandService.create(request, AuthContext.getCurrentAdminPk()));
    }

    @PutMapping("/{id}")
    public ApiResponse<BookResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateBookRequest request) {
        return ApiResponse.success(bookCommandService.update(id, request, AuthContext.getCurrentAdminPk()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookCommandService.delete(id);
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BookFileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(new BookFileUploadResponse(bookFileStorageService.store(file)));
    }
}
