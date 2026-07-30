-- 프로그램 관리 화면 목데이터 중 의미 있는 항목만 선별해 시드 (테스트용 중복 더미 행은 제외).
-- 부모 행을 자식보다 먼저 삽입해 AUTO_INCREMENT id로 parent_program_id를 안전하게 채운다.
INSERT INTO `program_admin`
(`system`, `parent_program_id`, `code`, `name`, `type`, `http_method`, `url`, `sort_order`,
 `display_yn`, `use_yn`, `platform_admin_only`, `i18n_key_id`, `description`, `created_at`, `updated_at`)
VALUES ('VFX', NULL, 'PROGRAM_API_LIST', '프로그램 목록 조회', 'API', 'GET',
        '/api/v1/workspaces/{workspaceId}/programs', 1, 'N', 'Y', 'N', '263', '프로그램 목록 조회 API',
        '2026-05-08 14:41:11', '2026-05-08 14:41:11'), -- id=1
       ('VFX', NULL, 'MANAGEMENT_API_C', '프로젝트 목록 조회', 'API', 'GET',
        '/api/project/list', 1, 'Y', 'Y', 'N', '', '프로젝트 목록 조회',
        '2026-05-08 14:41:11', '2026-05-08 14:41:11'), -- id=2
       ('VFX', NULL, 'USR_MGT', '사용자 관리', 'PAGE', 'GET',
        '/api/v1/users', 1, 'Y', 'Y', 'N', '611', '사용자 관리 화면',
        '2026-06-08 17:19:32', '2026-06-08 17:19:32'), -- id=3
       ('VFX', NULL, 'VFXMASTERMNG', '대시보드', 'PAGE', 'GET',
        '/api/v1/users', 1, 'Y', 'Y', 'N', '622', '사용자 관리 화면',
        '2026-06-08 17:27:13', '2026-06-08 17:27:13'), -- id=4
       ('VFX', 1, 'PROGRAM_API_DETAIL', '프로그램 상세 조회', 'API', 'GET',
        '/api/v1/workspaces/{workspaceId}/programs/{id}', 2, 'N', 'Y', 'N', '302', '프로그램 상세 조회 API',
        '2026-05-08 14:41:11', '2026-05-08 14:41:11'), -- id=5, parent=1
       ('VFX', 2, 'PROJECT_API_DETAIL', '프로젝트 상세 조회', 'API', 'GET',
        '/api/project/detail', 2, 'N', 'Y', 'N', '', '프로젝트 상세 조회',
        '2026-05-08 14:41:11', '2026-05-08 14:41:11'); -- id=6, parent=2
