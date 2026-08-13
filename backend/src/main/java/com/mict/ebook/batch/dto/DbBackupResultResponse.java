package com.mict.ebook.batch.dto;

import java.time.LocalDateTime;

public record DbBackupResultResponse(String filePath, long fileSizeBytes, LocalDateTime executedAt) {}
