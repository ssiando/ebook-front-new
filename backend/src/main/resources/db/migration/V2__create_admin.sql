-- 관리자 계정
CREATE TABLE `admin`
(
    `id`            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `admin_id`      VARCHAR(50)  NOT NULL COMMENT '로그인 ID',
    `admin_name`    VARCHAR(100) NOT NULL,
    `email`         VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'BCrypt 해시',
    `department`    VARCHAR(100) NULL,
    `status`        VARCHAR(20)  NOT NULL DEFAULT 'NEW'
        COMMENT '공통코드 그룹 ADMIN_STATUS의 code 값을 참조 (소프트 레퍼런스, FK 아님)',
    `registrant`    VARCHAR(50)  NULL,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_admin_admin_id` UNIQUE (`admin_id`),
    CONSTRAINT `uq_admin_email` UNIQUE (`email`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '관리자 계정';
