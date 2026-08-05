-- 관리자 화면 개편: 워크스페이스 관리자 권한, 그룹 태그, 서비스 사용 만료일, 마지막 로그인 시각 추가
ALTER TABLE `admin`
    ADD COLUMN `is_workspace_admin`  TINYINT(1) NOT NULL DEFAULT 0 COMMENT '워크스페이스 전체 관리 권한 여부' AFTER `department`,
    ADD COLUMN `group_names`        VARCHAR(500) NULL COMMENT '그룹 태그, 콤마(,)로 구분' AFTER `is_workspace_admin`,
    ADD COLUMN `service_expires_at` DATE NULL COMMENT '서비스 사용 만료일 (비워두면 영구 사용)' AFTER `group_names`,
    ADD COLUMN `last_login_at`      DATETIME NULL COMMENT '마지막 로그인 일시' AFTER `service_expires_at`;
