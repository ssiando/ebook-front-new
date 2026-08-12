-- 워크스페이스별 역할. id=1(SUPER_ADMIN)은 워크스페이스 구분과 무관하게 전체 메뉴/권한을 갖는다
-- (프론트엔드 menuPermission.ts, 백엔드 MenuQueryService의 SUPER_ADMIN 우회 로직 참고).
INSERT INTO `cm_role_bas` (`workspace_id`, `role_nm`, `descp`, `active_yn`)
VALUES (1, 'SUPER_ADMIN', '전체 시스템 관리자', 1), -- id=1
       (1, 'WORKSPACE_ADMIN', '워크스페이스 관리자', 1), -- id=2
       (1, 'MEMBER', '일반 사용자', 1), -- id=3
       (2, 'WORKSPACE_ADMIN', '워크스페이스 관리자', 1), -- id=4
       (2, 'MEMBER', '일반 사용자', 1), -- id=5
       (3, 'WORKSPACE_ADMIN', '워크스페이스 관리자', 1), -- id=6
       (3, 'MEMBER', '일반 사용자', 1); -- id=7
