package com.mict.ebook.common.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 업로드 파일(도서 커버/썸네일 등)을 저장하는 로컬 디렉터리와, 그 파일을 내려받을 때 쓰는 URL prefix. */
@Validated
@ConfigurationProperties(prefix = "app.upload")
public record FileStorageProperties(@NotBlank String path, @NotBlank String urlPrefix) {}
