package com.mict.ebook.batch.job;

import com.mict.ebook.batch.config.DbBackupProperties;
import com.mict.ebook.batch.domain.BatchErrorCode;
import com.mict.ebook.common.config.AppDataSourceProperties;
import com.mict.ebook.common.exception.BusinessException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

/**
 * mariadb-dump(mysqldump 호환) 외부 프로세스를 호출해 DB 전체를 지정된 경로에 .sql로 덤프한다.
 * targetPath는 Java 파일 출력 경로로만 쓰이고 프로세스 인자로 셸에 전달되지 않으므로(ProcessBuilder는
 * 셸을 거치지 않음) 커맨드 인젝션 여지가 없다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DbBackupTasklet implements Tasklet {

    private static final Pattern JDBC_URL_PATTERN = Pattern.compile("jdbc:mariadb://([^:/]+):(\\d+)/([^?]+)");
    private static final String JOB_PARAM_TARGET_PATH = "targetPath";
    private static final String CONTEXT_OUTPUT_FILE_PATH = "outputFilePath";
    private static final String CONTEXT_OUTPUT_FILE_SIZE = "outputFileSize";

    private final AppDataSourceProperties dataSourceProperties;
    private final DbBackupProperties dbBackupProperties;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        JobParameters jobParameters =
                chunkContext.getStepContext().getStepExecution().getJobParameters();
        String targetPath = jobParameters.getString(JOB_PARAM_TARGET_PATH);

        Path targetDir = resolveTargetDirectory(targetPath);
        Path outputFile = targetDir.resolve(dumpFileName());

        Matcher matcher = JDBC_URL_PATTERN.matcher(dataSourceProperties.url());
        if (!matcher.find()) {
            log.error("[DbBackupTasklet] JDBC URL 파싱 실패: {}", dataSourceProperties.url());
            throw new BusinessException(BatchErrorCode.DUMP_EXECUTION_FAILED);
        }
        String host = matcher.group(1);
        String port = matcher.group(2);
        String schema = matcher.group(3);

        ProcessBuilder processBuilder = new ProcessBuilder(
                dbBackupProperties.dumpExecutablePath(),
                "-h",
                host,
                "-P",
                port,
                "-u",
                dataSourceProperties.username(),
                "--password=" + dataSourceProperties.password(),
                "--single-transaction",
                schema);
        processBuilder.redirectOutput(outputFile.toFile());

        Process process;
        try {
            process = processBuilder.start();
        } catch (IOException e) {
            log.error("[DbBackupTasklet] mariadb-dump 실행 파일을 찾을 수 없음: {}", dbBackupProperties.dumpExecutablePath(), e);
            throw new BusinessException(BatchErrorCode.DUMP_EXECUTION_FAILED);
        }

        String stderr;
        try (InputStream errorStream = process.getErrorStream()) {
            stderr = new String(errorStream.readAllBytes(), StandardCharsets.UTF_8);
        }

        boolean finished = process.waitFor(5, TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            throw new BusinessException(BatchErrorCode.DUMP_TIMEOUT);
        }
        if (process.exitValue() != 0) {
            log.error("[DbBackupTasklet] mariadb-dump 종료 코드 {}: {}", process.exitValue(), stderr);
            Files.deleteIfExists(outputFile);
            throw new BusinessException(BatchErrorCode.DUMP_EXECUTION_FAILED);
        }

        long fileSize = Files.size(outputFile);
        contribution
                .getStepExecution()
                .getExecutionContext()
                .putString(CONTEXT_OUTPUT_FILE_PATH, outputFile.toString());
        contribution.getStepExecution().getExecutionContext().putLong(CONTEXT_OUTPUT_FILE_SIZE, fileSize);

        return RepeatStatus.FINISHED;
    }

    private Path resolveTargetDirectory(String targetPath) {
        Path dir;
        try {
            dir = Path.of(targetPath);
        } catch (InvalidPathException e) {
            throw new BusinessException(BatchErrorCode.INVALID_TARGET_PATH);
        }
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            log.error("[DbBackupTasklet] 저장 경로 생성 실패: {}", targetPath, e);
            throw new BusinessException(BatchErrorCode.TARGET_PATH_NOT_WRITABLE);
        }
        if (!Files.isWritable(dir)) {
            throw new BusinessException(BatchErrorCode.TARGET_PATH_NOT_WRITABLE);
        }
        return dir;
    }

    private String dumpFileName() {
        String timestamp =
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return "ebook_backup_" + timestamp + ".sql";
    }
}
