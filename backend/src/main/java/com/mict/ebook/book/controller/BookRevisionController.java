package com.mict.ebook.book.controller;

import com.mict.ebook.book.dto.BookRevisionResponse;
import com.mict.ebook.book.dto.CreateBookRevisionRequest;
import com.mict.ebook.book.dto.UpdateBookRevisionRequest;
import com.mict.ebook.book.service.BookRevisionCommandService;
import com.mict.ebook.book.service.BookRevisionQueryService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books/{bookId}/revisions")
@RequiredArgsConstructor
public class BookRevisionController {

    private final BookRevisionQueryService bookRevisionQueryService;
    private final BookRevisionCommandService bookRevisionCommandService;

    @GetMapping
    public ApiResponse<List<BookRevisionResponse>> list(@PathVariable Long bookId) {
        return ApiResponse.success(bookRevisionQueryService.listByBookId(bookId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookRevisionResponse> create(
            @PathVariable Long bookId, @Valid @RequestBody CreateBookRevisionRequest request) {
        return ApiResponse.success(bookRevisionCommandService.create(bookId, request, AuthContext.getCurrentAdminPk()));
    }

    @PutMapping("/{id}")
    public ApiResponse<BookRevisionResponse> update(
            @PathVariable Long bookId, @PathVariable Long id, @Valid @RequestBody UpdateBookRevisionRequest request) {
        return ApiResponse.success(bookRevisionCommandService.update(id, request, AuthContext.getCurrentAdminPk()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long bookId, @PathVariable Long id) {
        bookRevisionCommandService.delete(id);
    }
}
