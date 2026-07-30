-- 사이드바 내비게이션 트리 (프론트엔드 data/menu.json과 동일). 부모(그룹) 노드를 자식보다 먼저 삽입한다.
INSERT INTO `menu` (`id`, `parent_id`, `label`, `path`, `sort_order`)
VALUES ('dashboard', NULL, '대시보드', '/', 0),
       ('home', NULL, '홈', '/', 1),
       ('admin', NULL, '관리자', NULL, 2),
       ('system', NULL, '시스템관리', NULL, 3),
       ('adminManagement', 'admin', '관리자 관리', '/adminManagement', 0),
       ('adminRoleManagement', 'admin', '관리자별 역할 관리', '/adminRoleManagement', 1),
       ('programManagement', 'system', '프로그램 관리', '/programManagement', 0),
       ('roleManagement', 'system', '역할 관리', '/roleManagement', 1),
       ('commonCode', 'system', '공통관리', '/commonCodeManagement', 2),
       ('batchManagement', 'system', '배치 관리', '/batchManagement', 3);
