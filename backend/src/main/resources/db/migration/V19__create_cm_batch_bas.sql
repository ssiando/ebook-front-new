-- 배치 관리 화면을 실제 API로 연동하기 위해 배치 작업 정의를 저장하는 테이블을 추가한다.
-- 기존 화면 목데이터(batch-api.ts의 MOCK_BATCHES)와 동일한 데이터로 시드해 화면 연속성을 유지한다.
CREATE TABLE `cm_batch_bas`
(
    `id`               BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    `batch_code`       VARCHAR(50)  NOT NULL,
    `batch_name`       VARCHAR(100) NOT NULL,
    `schedule`         VARCHAR(100) NULL,
    `description`      VARCHAR(255) NULL,
    `requires_path`    TINYINT(1)   NOT NULL DEFAULT 0,
    `last_run_status`  VARCHAR(20)  NOT NULL DEFAULT 'default',
    `last_run_at`      DATETIME     NULL,
    `regr_id`          BIGINT UNSIGNED NULL,
    `updr_id`          BIGINT UNSIGNED NULL,
    `reg_dtm`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `upd_dtm`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `uk_cm_batch_bas_batch_code` UNIQUE (`batch_code`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '배치 작업 정의';

INSERT INTO `cm_batch_bas`
    (`batch_code`, `batch_name`, `schedule`, `requires_path`, `last_run_status`, `last_run_at`)
VALUES
    ('BATCH_EAI_HR', 'EAI 인사정보 동기화 배치', '매일 06:10', 0, 'error', '2026-07-29 06:33:21'),
    ('BATCH_EAI_OFCWRK_TM', 'EAI 근무시간 동기화 배치', '매일 06:20', 0, 'error', '2026-07-29 06:43:34'),
    ('BATCH_USER_EXPIRY', '만료 사용자 비활성화 배치', '매일 01:00', 0, 'success', '2026-07-30 01:30:00'),
    ('BATCH_NOTI_RESEND', '알람 재전송 배치', '1시간 간격 실행', 0, 'success', '2026-07-30 15:26:15'),
    ('BATCH_FPTR_PERMISSION', 'FPTR PermissionRuleSet 마스터정보 동기화 배치', '매일 09:00', 0, 'success', '2026-07-30 11:31:02'),
    ('BATCH_FPTR_DEPT', 'FPTR Department 마스터정보 동기화 배치', '매일 09:00', 0, 'success', '2026-07-30 11:21:12'),
    ('BATCH_FPTR_TO_VANTA_SYNC', 'FPTR To VANTA 동기화배치', 'system-master.col.scheduleFptrToVanta...', 0, 'success', '2026-07-03 14:04:43'),
    ('BATCH_FPTR_USER', 'FPTR HumanUser 마스터정보 동기화 배치', '매일 09:00', 0, 'success', '2026-07-30 11:21:25'),
    ('BATCH_WS_TERMINATION', '워크스페이스 유휴 종료', '', 0, 'default', NULL),
    ('BATCH_DB_BACKUP', 'DB 백업 배치', '수동 실행', 1, 'default', NULL);
