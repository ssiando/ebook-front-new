-- 공통코드 그룹 4건 (id는 AUTO_INCREMENT 1~4 순서로 채번됨: group-1~group-4에 대응)
INSERT INTO `common_code_group`
    (`group_code`, `group_name`, `description`, `use_yn`, `i18n_key`, `created_at`, `updated_at`)
VALUES ('VFX_CM003', '진행상태', '진행상태', 'Y', 'code.vfx_cm003', '2026-05-26 16:41:23', '2026-06-01 17:58:15'),
       ('VFX_CM001', '프로젝트유형', '프로젝트 유형 코드', 'Y', 'code.vfx_cm001', '2026-05-20 10:12:00', '2026-05-20 10:12:00'),
       ('VFX_CM002', '승인상태', '승인 상태 코드', 'N', 'code.vfx_cm002', '2026-05-22 09:00:00', '2026-05-22 09:00:00'),
       ('ADMIN_STATUS', '관리자 상태', '관리자 계정 상태 코드', 'Y', 'code.admin_status', '2026-07-01 09:00:00', '2026-07-01 09:00:00');

-- group-1 (VFX_CM003 진행상태) 코드 항목
INSERT INTO `common_code_item`
    (`group_id`, `code`, `code_name`, `sort_order`, `use_yn`, `description`, `metadata`, `i18n_key`, `created_at`, `updated_at`)
SELECT g.id, v.code, v.code_name, v.sort_order, 'Y', v.description, '', '', v.created_at, v.updated_at
FROM `common_code_group` g
         JOIN (
    SELECT '001' AS code, '저장' AS code_name, 1 AS sort_order, 'SX 공통 진행상태-저장' AS description,
           '2026-07-21 09:53:18' AS created_at, '2026-07-22 11:59:16' AS updated_at
    UNION ALL
    SELECT '002', '확정', 2, 'SX 공통 진행상태-확정', '2026-07-21 09:53:22', '2026-07-22 11:59:19'
    UNION ALL
    SELECT '999', '삭제', 3, 'SX 공통 진행상태-삭제', '2026-07-21 09:53:25', '2026-07-22 11:59:19'
    UNION ALL
    SELECT '009', '확정취소', 4, 'SX 공통 진행상태-확정취소', '2026-07-22 11:59:19', '2026-07-22 11:59:19'
) v ON g.group_code = 'VFX_CM003';

-- group-2 (VFX_CM001 프로젝트유형) 코드 항목
INSERT INTO `common_code_item`
    (`group_id`, `code`, `code_name`, `sort_order`, `use_yn`, `description`, `metadata`, `i18n_key`, `created_at`, `updated_at`)
SELECT g.id, v.code, v.code_name, v.sort_order, 'Y', '', '', '', v.created_at, v.updated_at
FROM `common_code_group` g
         JOIN (
    SELECT '001' AS code, '영화' AS code_name, 1 AS sort_order,
           '2026-05-20 10:12:00' AS created_at, '2026-05-20 10:12:00' AS updated_at
    UNION ALL
    SELECT '002', '광고', 2, '2026-05-20 10:12:00', '2026-05-20 10:12:00'
) v ON g.group_code = 'VFX_CM001';

-- group-4 (ADMIN_STATUS 관리자 상태) 코드 항목: metadata에 화면 배지 색상(tone)을 담는다
INSERT INTO `common_code_item`
    (`group_id`, `code`, `code_name`, `sort_order`, `use_yn`, `description`, `metadata`, `i18n_key`, `created_at`, `updated_at`)
SELECT g.id, v.code, v.code_name, v.sort_order, 'Y', v.description, v.metadata, '', v.created_at, v.updated_at
FROM `common_code_group` g
         JOIN (
    SELECT 'ACTIVE' AS code, '활성' AS code_name, 1 AS sort_order,
           '정상적으로 활동 중인 관리자' AS description, 'green' AS metadata,
           '2026-07-01 09:00:00' AS created_at, '2026-07-01 09:00:00' AS updated_at
    UNION ALL
    SELECT 'DORMANT', '휴면', 2, '장기 미접속으로 휴면 처리된 관리자', 'gray', '2026-07-01 09:00:00', '2026-07-01 09:00:00'
    UNION ALL
    SELECT 'INACTIVE', '비활성', 3, '사용이 중지된 관리자', 'red', '2026-07-01 09:00:00', '2026-07-01 09:00:00'
    UNION ALL
    SELECT 'NEW', '신규', 4, '새로 등록되어 아직 승인되지 않은 관리자', 'blue', '2026-07-01 09:00:00', '2026-07-01 09:00:00'
) v ON g.group_code = 'ADMIN_STATUS';
