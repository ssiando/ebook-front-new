-- 역할 관리에서 system(시스템 구분) 개념을 제거한다. role_name만으로 유일성을 보장한다.
ALTER TABLE `role`
    DROP INDEX `uq_role_name_system`,
    DROP COLUMN `system`,
    ADD CONSTRAINT `uq_role_name` UNIQUE (`role_name`);
