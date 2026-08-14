package com.mict.ebook.book.service;

import com.mict.ebook.book.domain.BookErrorCode;
import com.mict.ebook.common.config.FileStorageProperties;
import com.mict.ebook.common.exception.BusinessException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** 도서 커버/썸네일 이미지를 app.upload.path 아래 book/ 폴더에 저장하고, 정적 서빙 URL을 돌려준다. */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookFileStorageService {

    private static final Map<String, String> ALLOWED_CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/webp", ".webp",
            "image/gif", ".gif");

    private static final String SUB_DIRECTORY = "book";

    private final FileStorageProperties fileStorageProperties;

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(BookErrorCode.EMPTY_FILE);
        }

        String extension = ALLOWED_CONTENT_TYPE_EXTENSIONS.get(file.getContentType());
        if (extension == null) {
            throw new BusinessException(BookErrorCode.UNSUPPORTED_FILE_TYPE);
        }

        // 원본 파일명은 저장 경로에 쓰지 않고 무작위 파일명만 사용한다 (경로 조작 방지).
        String storedFileName = UUID.randomUUID() + extension;

        Path targetDir = Path.of(fileStorageProperties.path(), SUB_DIRECTORY)
                .toAbsolutePath()
                .normalize();
        try {
            Files.createDirectories(targetDir);
            file.transferTo(targetDir.resolve(storedFileName));
        } catch (IOException e) {
            log.error("[BookFileStorageService] 파일 저장 실패: {}", targetDir, e);
            throw new BusinessException(BookErrorCode.FILE_UPLOAD_FAILED);
        }

        return fileStorageProperties.urlPrefix() + "/" + SUB_DIRECTORY + "/" + storedFileName;
    }
}
