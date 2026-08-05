-- 워크스페이스 관리자 권한 기능 제거
ALTER TABLE `admin`
    DROP COLUMN `is_workspace_admin`;
