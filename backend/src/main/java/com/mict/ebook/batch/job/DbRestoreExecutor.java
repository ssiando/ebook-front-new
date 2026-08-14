package com.mict.ebook.batch.job;

import com.mict.ebook.batch.config.DbBackupProperties;
import com.mict.ebook.batch.domain.BatchErrorCode;
import com.mict.ebook.common.config.AppDataSourceProperties;
import com.mict.ebook.common.exception.BusinessException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * mariadb(mysql 호환) 클라이언트로 지정된 덤프 파일을 현재 DB에 복원한다.
 *
 * <p>일부러 Spring Batch Job/Tasklet으로 감싸지 않는다 — Spring Batch의 JobRepository(BATCH_JOB_EXECUTION 등)는
 * 이 앱의 기본 스키마(app.datasource)에 함께 들어있는데, 복원 SQL이 그 메타데이터 테이블까지 통째로 되돌려버리면
 * 방금 시작한 복원 Job 자신의 실행 행이 사라져 JobRepository.update()가
 * "expected 1, actual 0"으로 실패한다(실제로 겪은 문제). 백업은 읽기 전용이라 이 문제가 없어 Job으로 유지하지만,
 * 복원은 자기 자신이 의존하는 저장소를 스스로 지워버리는 구조적 모순이 있어 순수 자바 메서드로 직접 실행한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DbRestoreExecutor {

    private static final Pattern JDBC_URL_PATTERN = Pattern.compile("jdbc:mariadb://([^:/]+):(\\d+)/([^?]+)");

    private final AppDataSourceProperties dataSourceProperties;
    private final DbBackupProperties dbBackupProperties;

    public void restore(String sourceFilePath) {
        Path sourceFile = Path.of(sourceFilePath);
        if (!Files.isReadable(sourceFile)) {
            throw new BusinessException(BatchErrorCode.RESTORE_SOURCE_NOT_FOUND);
        }

        Matcher matcher = JDBC_URL_PATTERN.matcher(dataSourceProperties.url());
        if (!matcher.find()) {
            log.error("[DbRestoreExecutor] JDBC URL 파싱 실패: {}", dataSourceProperties.url());
            throw new BusinessException(BatchErrorCode.RESTORE_EXECUTION_FAILED);
        }
        String host = matcher.group(1);
        String port = matcher.group(2);
        String schema = matcher.group(3);

        ProcessBuilder processBuilder = new ProcessBuilder(
                dbBackupProperties.restoreExecutablePath(),
                "-h",
                host,
                "-P",
                port,
                "-u",
                dataSourceProperties.username(),
                "--password=" + dataSourceProperties.password(),
                schema);
        processBuilder.redirectInput(sourceFile.toFile());

        Process process;
        try {
            process = processBuilder.start();
        } catch (IOException e) {
            log.error("[DbRestoreExecutor] mariadb 실행 파일을 찾을 수 없음: {}", dbBackupProperties.restoreExecutablePath(), e);
            throw new BusinessException(BatchErrorCode.RESTORE_EXECUTION_FAILED);
        }

        String stderr;
        try (InputStream errorStream = process.getErrorStream()) {
            stderr = new String(errorStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BusinessException(BatchErrorCode.RESTORE_EXECUTION_FAILED);
        }

        boolean finished;
        try {
            finished = process.waitFor(5, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(BatchErrorCode.RESTORE_EXECUTION_FAILED);
        }
        if (!finished) {
            process.destroyForcibly();
            throw new BusinessException(BatchErrorCode.RESTORE_TIMEOUT);
        }
        if (process.exitValue() != 0) {
            log.error("[DbRestoreExecutor] mariadb 종료 코드 {}: {}", process.exitValue(), stderr);
            throw new BusinessException(BatchErrorCode.RESTORE_EXECUTION_FAILED);
        }
    }
}
