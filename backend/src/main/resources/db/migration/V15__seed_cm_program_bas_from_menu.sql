-- 프론트엔드 sidebar가 실제로 그리는 메뉴(frontend/src/data/menu.json)를 그대로 프로그램으로 반영한다.
-- 이전에 넣어둔 workspace 1의 가상 데모 프로그램(HOME/PROGRAM_MGMT/USER_MGMT/ROLE_MGMT 및 그 API 하위 행)은
-- 실제 메뉴와 맞지 않아 정리하고, 메뉴 트리와 1:1로 대응하는 행으로 교체한다.
DELETE FROM `cm_program_bas` WHERE `workspace_id` = 1;

-- 최상위 메뉴(대시보드/홈/관리자/시스템관리)를 먼저 삽입해 커밋한 뒤, 하위 메뉴를 별도 문으로 넣어
-- prnt_id 자기참조 FK가 안전하게 걸리도록 한다.
INSERT INTO `cm_program_bas`
    (`workspace_id`, `prnt_id`, `pgm_cd`, `pgm_nm`, `pgm_type`, `http_mthd`, `url`, `sort_sseq`,
     `mark_yn`, `active_yn`, `i18n_key_id`, `descp`)
VALUES (1, NULL, 'dashboard', '대시보드', 'PAGE', 'GET', '/', 0, TRUE, TRUE, NULL, '메인 대시보드'),
       (1, NULL, 'home', '홈', 'PAGE', 'GET', '/', 1, TRUE, TRUE, NULL, '홈 화면'),
       (1, NULL, 'admin', '관리자', 'PAGE', NULL, NULL, 2, TRUE, TRUE, NULL, '관리자 메뉴 그룹'),
       (1, NULL, 'system', '시스템관리', 'PAGE', NULL, NULL, 3, TRUE, TRUE, NULL, '시스템관리 메뉴 그룹');

INSERT INTO `cm_program_bas`
    (`workspace_id`, `prnt_id`, `pgm_cd`, `pgm_nm`, `pgm_type`, `http_mthd`, `url`, `sort_sseq`,
     `mark_yn`, `active_yn`, `i18n_key_id`, `descp`)
VALUES (1, (SELECT id FROM cm_program_bas WHERE workspace_id = 1 AND pgm_cd = 'admin'),
        'adminManagement', '관리자 관리', 'PAGE', 'GET', '/adminManagement', 0, TRUE, TRUE, NULL, '관리자 관리 화면'),
       (1, (SELECT id FROM cm_program_bas WHERE workspace_id = 1 AND pgm_cd = 'system'),
        'programManagement', '프로그램 관리', 'PAGE', 'GET', '/programManagement', 0, TRUE, TRUE, NULL,
        '프로그램 관리 화면'),
       (1, (SELECT id FROM cm_program_bas WHERE workspace_id = 1 AND pgm_cd = 'system'),
        'roleManagement', '역할 관리', 'PAGE', 'GET', '/roleManagement', 1, TRUE, TRUE, NULL, '역할 관리 화면'),
       (1, (SELECT id FROM cm_program_bas WHERE workspace_id = 1 AND pgm_cd = 'system'),
        'commonCode', '공통관리', 'PAGE', 'GET', '/commonCodeManagement', 2, TRUE, TRUE, NULL, '공통코드 관리 화면'),
       (1, (SELECT id FROM cm_program_bas WHERE workspace_id = 1 AND pgm_cd = 'system'),
        'batchManagement', '배치 관리', 'PAGE', 'GET', '/batchManagement', 3, TRUE, TRUE, NULL, '배치 관리 화면');
