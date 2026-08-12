-- 프로그램 관리 화면 데모 시드. 상위(부모) 행을 먼저 삽입하는 문(statement)으로 커밋한 뒤,
-- 하위 행을 별도 INSERT 문으로 넣어 prnt_id 자기참조 FK가 안전하게 걸리도록 한다.
INSERT INTO `cm_program_bas`
    (`workspace_id`, `prnt_id`, `pgm_cd`, `pgm_nm`, `pgm_type`, `http_mthd`, `url`, `sort_sseq`,
     `mark_yn`, `active_yn`, `i18n_key_id`, `descp`)
VALUES (1, NULL, 'HOME', '홈', 'PAGE', 'GET', '/', 0, TRUE, TRUE, NULL, '메인 대시보드'), -- id=1
       (1, NULL, 'PROGRAM_MGMT', '프로그램 관리', 'PAGE', 'GET', '/programManagement', 1, TRUE, TRUE, NULL,
        '프로그램 관리 화면'), -- id=2
       (1, NULL, 'USER_MGMT', '사용자 관리', 'PAGE', 'GET', '/userManagement', 2, TRUE, TRUE, NULL,
        '사용자 관리 화면'), -- id=3
       (1, NULL, 'ROLE_MGMT', '역할 관리', 'PAGE', 'GET', '/roleManagement', 3, TRUE, TRUE, NULL,
        '역할 관리 화면'), -- id=4
       (2, NULL, 'DEV_DASHBOARD', '개발 대시보드', 'PAGE', 'GET', '/dev', 0, TRUE, TRUE, NULL,
        '플랫폼개발팀 대시보드'), -- id=5
       (2, NULL, 'DEV_PROJECT', '프로젝트 관리', 'PAGE', 'GET', '/dev/project', 1, TRUE, TRUE, NULL,
        '프로젝트 관리 화면'), -- id=6
       (2, NULL, 'DEV_DEPLOY', '배포 관리', 'PAGE', 'GET', '/dev/deploy', 2, TRUE, TRUE, NULL,
        '배포 관리 화면'); -- id=7

INSERT INTO `cm_program_bas`
    (`workspace_id`, `prnt_id`, `pgm_cd`, `pgm_nm`, `pgm_type`, `http_mthd`, `url`, `sort_sseq`,
     `mark_yn`, `active_yn`, `i18n_key_id`, `descp`)
VALUES (1, 2, 'PROGRAM_LIST_API', '프로그램 목록 조회', 'API', 'GET', '/api/programs', 0, FALSE, TRUE, NULL,
        '프로그램 목록 조회 API'),
       (1, 2, 'PROGRAM_SAVE_API', '프로그램 저장', 'API', 'PUT', '/api/programs', 1, FALSE, TRUE, NULL,
        '프로그램 등록/수정 API'),
       (1, 2, 'PROGRAM_DELETE_API', '프로그램 삭제', 'API', 'DELETE', '/api/programs', 2, FALSE, TRUE, NULL,
        '프로그램 삭제 API'),
       (1, 3, 'USER_LIST_API', '사용자 목록 조회', 'API', 'GET', '/api/v1/admins', 0, FALSE, TRUE, NULL,
        '사용자 목록 조회 API'),
       (1, 3, 'USER_DETAIL_API', '사용자 상세 조회', 'API', 'GET', '/api/v1/admins/{id}', 1, FALSE, TRUE, NULL,
        '사용자 상세 조회 API'),
       (1, 4, 'ROLE_LIST_API', '역할 목록 조회', 'API', 'GET', '/api/roles', 0, FALSE, TRUE, NULL,
        '역할 목록 조회 API'),
       (2, 6, 'DEV_PROJECT_LIST_API', '프로젝트 목록 조회', 'API', 'GET', '/api/dev/projects', 0, FALSE, TRUE, NULL,
        '프로젝트 목록 조회 API'),
       (2, 6, 'DEV_PROJECT_DETAIL_API', '프로젝트 상세 조회', 'API', 'GET', '/api/dev/projects/{id}', 1, FALSE, TRUE,
        NULL, '프로젝트 상세 조회 API');
