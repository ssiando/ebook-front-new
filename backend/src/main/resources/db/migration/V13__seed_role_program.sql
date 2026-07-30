-- 역할별 프로그램(메뉴) 부여. role_id는 V11에서 채번된 1~15를 그대로 사용한다.
-- DEFAULT_PROGRAM_IDS = test-misc, workflow  → VIEWER/MEMBER 역할군
INSERT INTO `role_program` (`role_id`, `program_id`)
VALUES (1, 'test-misc'), (1, 'workflow'),   -- VIEWER/DESK
       (2, 'test-misc'), (2, 'workflow'),   -- MEMBER/VFX
       (5, 'test-misc'), (5, 'workflow'),   -- VIEWER/VFX
       (6, 'test-misc'), (6, 'workflow'),   -- VIEWER/GENX
       (7, 'test-misc'), (7, 'workflow'),   -- MEMBER/GENX
       (9, 'test-misc'), (9, 'workflow'),   -- VIEWER/4DX
       (10, 'test-misc'), (10, 'workflow'), -- MEMBER/4DX
       (12, 'test-misc'), (12, 'workflow'), -- VIEWER/ASSET
       (13, 'test-misc'), (13, 'workflow'), -- MEMBER/ASSET
       (15, 'test-misc'), (15, 'workflow'), -- MEMBER/DESK

       -- ADMIN_PROGRAM_IDS = test-misc, workflow, work-list, work-list-read, bbs-list, bbs-list-read
       (4, 'test-misc'), (4, 'workflow'), (4, 'work-list'), (4, 'work-list-read'), (4, 'bbs-list'), (4, 'bbs-list-read'),   -- WORKSPACE_ADMIN/VFX
       (8, 'test-misc'), (8, 'workflow'), (8, 'work-list'), (8, 'work-list-read'), (8, 'bbs-list'), (8, 'bbs-list-read'),   -- ADMIN/GENX
       (11, 'test-misc'), (11, 'workflow'), (11, 'work-list'), (11, 'work-list-read'), (11, 'bbs-list'), (11, 'bbs-list-read'), -- ADMIN/4DX
       (14, 'test-misc'), (14, 'workflow'), (14, 'work-list'), (14, 'work-list-read'), (14, 'bbs-list'), (14, 'bbs-list-read'), -- ADMIN/ASSET

       -- SUPER_ADMIN_PROGRAM_IDS = project-list, project-detail, project-detail-task-list, project-detail-project, step-list, task-detail
       (3, 'project-list'), (3, 'project-detail'), (3, 'project-detail-task-list'),
       (3, 'project-detail-project'), (3, 'step-list'), (3, 'task-detail'); -- SUPER_ADMIN/VFX
