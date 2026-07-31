package com.mict.ebook.common.response;

import com.mict.ebook.common.exception.ErrorCode;

public record ApiResponse<T>(boolean success, T data, String errorCode, String message) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static ApiResponse<Void> empty() {
        return new ApiResponse<>(true, null, null, null);
    }

    public static <T> ApiResponse<T> failure(ErrorCode errorCode) {
        return new ApiResponse<>(false, null, errorCode.getCode(), errorCode.getMessage());
    }

    public static <T> ApiResponse<T> failure(String code, String message) {
        return new ApiResponse<>(false, null, code, message);
    }
}
