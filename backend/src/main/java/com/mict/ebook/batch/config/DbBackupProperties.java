package com.mict.ebook.batch.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.batch.db-backup")
public record DbBackupProperties(
        String dumpExecutablePath, String restoreExecutablePath, @NotBlank String targetPath) {}
