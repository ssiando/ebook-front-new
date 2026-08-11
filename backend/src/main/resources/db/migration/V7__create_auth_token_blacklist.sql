-- 로그아웃 처리된 JWT의 jti(JWT ID)를 원본 만료 시각까지 보관한다.
-- expires_at 이후에는 어차피 토큰 자체가 만료되어 의미가 없으므로 로그아웃 시점에
-- 만료된 항목을 함께 정리해 테이블이 무한히 커지지 않도록 한다 (AuthService.logout 참고).
CREATE TABLE `auth_token_blacklist`
(
    `jti`        VARCHAR(36) NOT NULL PRIMARY KEY COMMENT 'JWT ID(UUID)',
    `expires_at` DATETIME    NOT NULL COMMENT '원본 토큰의 만료 시각',
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '로그아웃된 JWT 블랙리스트';
