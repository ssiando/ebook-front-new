-- 배치 작업 9건
INSERT INTO `batch_job` (`batch_code`, `batch_name`, `schedule`, `status`, `last_run_at`)
VALUES ('BATCH_EAI_HR', 'EAI 인사정보 동기화 배치', '매일 06:10', 'error', '2026-07-29 06:33:21'),
       ('BATCH_EAI_OFCWRK_TM', 'EAI 근무시간 동기화 배치', '매일 06:20', 'error', '2026-07-29 06:43:34'),
       ('BATCH_USER_EXPIRY', '만료 사용자 비활성화 배치', '매일 01:00', 'success', '2026-07-30 01:30:00'),
       ('BATCH_NOTI_RESEND', '알람 재전송 배치', '1시간 간격 실행', 'success', '2026-07-30 15:26:15'),
       ('BATCH_FPTR_PERMISSION', 'FPTR PermissionRuleSet 마스터정보 동기화 배치', '매일 09:00', 'success', '2026-07-30 11:31:02'),
       ('BATCH_FPTR_DEPT', 'FPTR Department 마스터정보 동기화 배치', '매일 09:00', 'success', '2026-07-30 11:21:12'),
       ('BATCH_FPTR_TO_VANTA_SYNC', 'FPTR To VANTA 동기화배치', 'system-master.col.scheduleFptrToVanta...', 'success', '2026-07-03 14:04:43'),
       ('BATCH_FPTR_USER', 'FPTR HumanUser 마스터정보 동기화 배치', '매일 09:00', 'success', '2026-07-30 11:21:25'),
       ('BATCH_WS_TERMINATION', '워크스페이스 유휴 종료', NULL, 'default', NULL);
