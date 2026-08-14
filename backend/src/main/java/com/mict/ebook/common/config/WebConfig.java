package com.mict.ebook.common.config;

import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** app.upload.path 아래 저장된 파일(도서 커버/썸네일 등)을 app.upload.url-prefix 경로로 정적 서빙한다. */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of(fileStorageProperties.path())
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        registry.addResourceHandler(fileStorageProperties.urlPrefix() + "/**").addResourceLocations(location);
    }
}
