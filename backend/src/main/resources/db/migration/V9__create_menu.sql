-- 사이드바 내비게이션 트리 (프론트엔드 data/menu.json에 대응)
CREATE TABLE `menu`
(
    `id`         VARCHAR(50)  NOT NULL PRIMARY KEY COMMENT 'menu.json의 id와 동일',
    `parent_id`  VARCHAR(50)  NULL,
    `label`      VARCHAR(100) NOT NULL,
    `path`       VARCHAR(255) NULL COMMENT '리프 메뉴만 값을 가짐, 그룹 노드는 NULL',
    `sort_order` INT          NOT NULL DEFAULT 0,
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '사이드바 내비게이션 트리';
