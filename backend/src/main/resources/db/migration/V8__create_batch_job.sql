-- 배치 작업 정의 및 최근 실행 결과
CREATE TABLE `batch_job`
(
    `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `batch_code`  VARCHAR(100) NOT NULL,
    `batch_name`  VARCHAR(200) NOT NULL,
    `schedule`    VARCHAR(200) NULL COMMENT '자연어 표현 또는 cron 문자열',
    `status`      VARCHAR(20)  NOT NULL DEFAULT 'default' COMMENT 'success/error/default',
    `last_run_at` DATETIME     NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_batch_job_code` UNIQUE (`batch_code`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '배치 작업';
