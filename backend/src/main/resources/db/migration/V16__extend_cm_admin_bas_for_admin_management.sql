-- 관리자 관리 화면(로그인ID/소속/상태/서비스만료일/소속그룹)을 실제 API로 연동하기 위해
-- cm_admin_bas에 컬럼을 추가하고, 상태값·소속그룹은 공통코드(cm_code_group/cm_code_item)로 관리한다.
ALTER TABLE `cm_admin_bas`
    ADD COLUMN `login_id`           VARCHAR(50) NULL AFTER `id`,
    ADD COLUMN `department`        VARCHAR(50) NULL AFTER `admin_email`,
    ADD COLUMN `status`            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER `active_yn`,
    ADD COLUMN `service_expires_at` DATETIME NULL AFTER `status`;

-- 기존 관리자에는 login_id가 없으므로 id 기반으로 채운 뒤 NOT NULL + UNIQUE로 강제한다.
-- (이메일 로컬파트는 다른 도메인끼리 우연히 겹칠 수 있어 고유성이 보장된 id를 사용한다)
UPDATE `cm_admin_bas` SET `login_id` = CONCAT('admin', LPAD(`id`, 3, '0')) WHERE `login_id` IS NULL;

ALTER TABLE `cm_admin_bas`
    MODIFY COLUMN `login_id` VARCHAR(50) NOT NULL,
    ADD CONSTRAINT `uk_cm_admin_bas_login_id` UNIQUE (`login_id`);

-- 관리자-소속그룹 매핑 (관리자 한 명이 여러 그룹에 속할 수 있음, cm_admin_role과 동일한 구조)
CREATE TABLE `cm_admin_group`
(
    `admin_id`   BIGINT UNSIGNED NOT NULL,
    `group_code` VARCHAR(50)     NOT NULL,
    `reg_dtm`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`admin_id`, `group_code`),
    CONSTRAINT `fk_cm_admin_group_admin` FOREIGN KEY (`admin_id`) REFERENCES `cm_admin_bas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '관리자-소속그룹 매핑';

-- 관리자 상태 공통코드 (ADMIN_STATUS 그룹은 프론트엔드에서 이미 참조하고 있었으나 시드가 없었다)
INSERT INTO `cm_code_group` (`group_code`, `group_name`, `description`)
VALUES ('ADMIN_STATUS', '관리자 상태', '관리자 계정 상태값');

INSERT INTO `cm_code_item` (`group_id`, `code`, `code_name`, `sort_order`, `metadata`)
SELECT g.id, x.code, x.code_name, x.sort_order, x.metadata
FROM `cm_code_group` g,
     (SELECT 'ACTIVE' AS code, '활성' AS code_name, 0 AS sort_order, 'green' AS metadata
      UNION ALL
      SELECT 'DORMANT', '휴면', 1, 'gray'
      UNION ALL
      SELECT 'INACTIVE', '비활성', 2, 'red'
      UNION ALL
      SELECT 'NEW', '신규', 3, 'blue') x
WHERE g.group_code = 'ADMIN_STATUS';

-- 관리자 소속 그룹 공통코드
INSERT INTO `cm_code_group` (`group_code`, `group_name`, `description`)
VALUES ('ADMIN_GROUP', '관리자 소속 그룹', '관리자가 속할 수 있는 브랜드/콘텐츠 그룹');

INSERT INTO `cm_code_item` (`group_id`, `code`, `code_name`, `sort_order`)
SELECT g.id, x.code, x.code_name, x.sort_order
FROM `cm_code_group` g,
     (SELECT 'DISNEY' AS code, '디즈니' AS code_name, 0 AS sort_order
      UNION ALL
      SELECT 'MARVEL', '마블', 1
      UNION ALL
      SELECT 'PIXAR', '픽사', 2
      UNION ALL
      SELECT 'NATGEO', '내셔널지오그래픽', 3) x
WHERE g.group_code = 'ADMIN_GROUP';
