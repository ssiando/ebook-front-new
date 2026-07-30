-- 관리자 계정 23건. 데모 비밀번호는 전부 'ebook!2026' (BCrypt 해시) — 로컬 개발용이며 실제 배포 전 반드시 교체할 것.
INSERT INTO `admin`
    (`admin_id`, `admin_name`, `email`, `password_hash`, `department`, `status`, `registrant`, `created_at`, `updated_at`)
VALUES
('admin001', '관리자 1', 'admin001@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'ACTIVE', 'vfx', '2026-07-02 00:00:00', '2026-07-02 00:00:00'),
('admin002', '관리자 2', 'admin002@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'ACTIVE', 'vfx', '2026-07-03 00:00:00', '2026-07-03 00:00:00'),
('admin003', '관리자 3', 'admin003@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'DORMANT', 'vfx', '2026-07-04 00:00:00', '2026-07-04 00:00:00'),
('admin004', '관리자 4', 'admin004@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '콘텐츠운영팀', 'INACTIVE', 'vfx', '2026-07-05 00:00:00', '2026-07-05 00:00:00'),
('admin005', '관리자 5', 'admin005@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'ACTIVE', 'vfx', '2026-07-06 00:00:00', '2026-07-06 00:00:00'),
('admin006', '관리자 6', 'admin006@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'ACTIVE', 'vfx', '2026-07-07 00:00:00', '2026-07-07 00:00:00'),
('admin007', '관리자 7', 'admin007@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'ACTIVE', 'vfx', '2026-07-08 00:00:00', '2026-07-08 00:00:00'),
('admin008', '관리자 8', 'admin008@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '콘텐츠운영팀', 'DORMANT', 'vfx', '2026-07-09 00:00:00', '2026-07-09 00:00:00'),
('admin009', '관리자 9', 'admin009@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'INACTIVE', 'vfx', '2026-07-10 00:00:00', '2026-07-10 00:00:00'),
('admin010', '관리자 10', 'admin010@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'ACTIVE', 'vfx', '2026-07-11 00:00:00', '2026-07-11 00:00:00'),
('admin011', '관리자 11', 'admin011@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'ACTIVE', 'vfx', '2026-07-12 00:00:00', '2026-07-12 00:00:00'),
('admin012', '관리자 12', 'admin012@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '콘텐츠운영팀', 'ACTIVE', 'vfx', '2026-07-13 00:00:00', '2026-07-13 00:00:00'),
('admin013', '관리자 13', 'admin013@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'DORMANT', 'vfx', '2026-07-14 00:00:00', '2026-07-14 00:00:00'),
('admin014', '관리자 14', 'admin014@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'INACTIVE', 'vfx', '2026-07-15 00:00:00', '2026-07-15 00:00:00'),
('admin015', '관리자 15', 'admin015@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'ACTIVE', 'vfx', '2026-07-16 00:00:00', '2026-07-16 00:00:00'),
('admin016', '관리자 16', 'admin016@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '콘텐츠운영팀', 'ACTIVE', 'vfx', '2026-07-17 00:00:00', '2026-07-17 00:00:00'),
('admin017', '관리자 17', 'admin017@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'ACTIVE', 'vfx', '2026-07-18 00:00:00', '2026-07-18 00:00:00'),
('admin018', '관리자 18', 'admin018@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'DORMANT', 'vfx', '2026-07-19 00:00:00', '2026-07-19 00:00:00'),
('admin019', '관리자 19', 'admin019@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'INACTIVE', 'vfx', '2026-07-20 00:00:00', '2026-07-20 00:00:00'),
('admin020', '관리자 20', 'admin020@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '콘텐츠운영팀', 'ACTIVE', 'vfx', '2026-07-21 00:00:00', '2026-07-21 00:00:00'),
('admin021', '관리자 21', 'admin021@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '라이선스팀', 'ACTIVE', 'vfx', '2026-07-22 00:00:00', '2026-07-22 00:00:00'),
('admin022', '관리자 22', 'admin022@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '플랫폼개발팀', 'ACTIVE', 'vfx', '2026-07-23 00:00:00', '2026-07-23 00:00:00'),
('admin023', '관리자 23', 'admin023@cj.net', '$2b$10$a5a4DPhSo.nNhYvtraAYouRwzAJyWjXUEeItbAGBp8NPy8P7Sk/ye', '데이터팀', 'DORMANT', 'vfx', '2026-07-24 00:00:00', '2026-07-24 00:00:00');
