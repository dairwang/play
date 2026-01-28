USE play_companion_db;

INSERT INTO users (username, password, nickname, avatar, role, is_companion, balance, created_at)
VALUES
('admin', '123456', '管理员', 'https://placehold.co/200x200/png?text=Admin', 'admin', 0, 0.00, NOW())
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO users (username, password, nickname, avatar, role, is_companion, balance, created_at)
VALUES
('comp1', '123456', '陪玩师Alice', 'https://placehold.co/200x200/png?text=Alice', 'user', 1, 0.00, NOW())
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO users (username, password, nickname, avatar, role, is_companion, balance, created_at)
VALUES
('user1', '123456', '普通用户Bob', 'https://placehold.co/200x200/png?text=Bob', 'user', 0, 0.00, NOW())
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO games (name, icon, cover, created_at)
VALUES
('英雄联盟', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop', NOW()),
('王者荣耀', 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=1200&auto=format&fit=crop', NOW()),
('和平精英', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop', NOW()),
('原神', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', NOW())
ON DUPLICATE KEY UPDATE icon=VALUES(icon), cover=VALUES(cover);

INSERT INTO companion_services (user_id, game_id, price, description, audit_status, status, created_at)
SELECT u.id, g.id, 20.00, '高水平陪玩，聊天开黑', 'approved', 1, NOW()
FROM users u, games g
WHERE u.username='comp1' AND g.name='英雄联盟'
ON DUPLICATE KEY UPDATE user_id=user_id;
