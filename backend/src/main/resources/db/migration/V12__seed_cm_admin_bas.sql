-- 데모 비밀번호는 전부 'ebook!2026' (BCrypt 해시) — 로컬 개발용이며 실제 배포 전 반드시 교체할 것.
INSERT INTO `cm_admin_bas` (`admin_nm`, `admin_email`, `admin_pwd`, `fail_fcnt`, `active_yn`)
VALUES ('관리자 1', 'admin001@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', 0, 1), -- id=1
       ('관리자 2', 'admin002@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', 0, 1); -- id=2
