package com.mict.ebook.bookset.controller;

import com.mict.ebook.bookset.dto.BookSetResponse;
import com.mict.ebook.bookset.dto.BookSetSearchRequest;
import com.mict.ebook.bookset.dto.CreateBookSetRequest;
import com.mict.ebook.bookset.dto.UpdateBookSetBooksRequest;
import com.mict.ebook.bookset.dto.UpdateBookSetRequest;
import com.mict.ebook.bookset.service.BookSetCommandService;
import com.mict.ebook.bookset.service.BookSetQueryService;
import com.mict.ebook.common.response.ApiResponse;
import com.mict.ebook.common.security.AuthContext;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/book-sets")
@RequiredArgsConstructor
public class BookSetController {

    private final BookSetQueryService bookSetQueryService;
    private final BookSetCommandService bookSetCommandService;

    @GetMapping
    public ApiResponse<List<BookSetResponse>> search(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(bookSetQueryService.search(new BookSetSearchRequest(keyword)));
    }

    @GetMapping("/{id}")
    public ApiResponse<BookSetResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(bookSetQueryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookSetResponse> create(@Valid @RequestBody CreateBookSetRequest request) {
        return ApiResponse.success(bookSetCommandService.create(request, AuthContext.getCurrentAdminPk()));
    }

    @PutMapping("/{id}")
    public ApiResponse<BookSetResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateBookSetRequest request) {
        return ApiResponse.success(bookSetCommandService.update(id, request, AuthContext.getCurrentAdminPk()));
    }

    @PutMapping("/{id}/books")
    public ApiResponse<BookSetResponse> updateBooks(
            @PathVariable Long id, @Valid @RequestBody UpdateBookSetBooksRequest request) {
        return ApiResponse.success(bookSetCommandService.updateBooks(id, request.bookIds()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookSetCommandService.delete(id);
    }
}
