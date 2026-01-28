CREATE DATABASE IF NOT EXISTS play_companion_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE play_companion_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  `password` VARCHAR(255) NOT NULL COMMENT '加密密码',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT 'https://placehold.co/200x200/png?text=Avatar' COMMENT '头像',
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色: user, admin',
  `is_companion` TINYINT(1) DEFAULT 0 COMMENT '是否陪玩: 0否 1是',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '钱包余额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Games Table
CREATE TABLE IF NOT EXISTS `games` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL COMMENT '游戏名称',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
  `cover` VARCHAR(255) DEFAULT NULL COMMENT '封面',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Companion Services Table
CREATE TABLE IF NOT EXISTS `companion_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `game_id` INT NOT NULL COMMENT '游戏ID',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `description` TEXT COMMENT '服务描述',
  `audit_status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `status` TINYINT(1) DEFAULT 0 COMMENT '1在线 0离线',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL UNIQUE,
  `user_id` INT NOT NULL COMMENT '下单用户',
  `companion_id` INT NOT NULL COMMENT '接单陪玩',
  `game_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, accepted, completed, cancelled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`companion_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Wallet Logs
CREATE TABLE IF NOT EXISTS `wallet_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT 'deposit, payment, income, withdraw',
  `amount` DECIMAL(10,2) NOT NULL,
  `related_id` INT DEFAULT NULL COMMENT 'order_id etc',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Data

-- Admin Account (Password: 123456)
-- Note: In real app, password should be hashed. Here assuming simple hash or plain for demo if not using bcrypt yet.
-- Let's assume we will use bcrypt in Node.js, so I'll insert a placeholder or plain text and handle it in code.
-- For now, let's just insert a record.
INSERT INTO `users` (`username`, `password`, `nickname`, `role`, `avatar`) VALUES 
('admin', '123456', '系统管理员', 'admin', 'https://placehold.co/200x200/png?text=Admin');

-- Test Users
INSERT INTO `users` (`username`, `password`, `nickname`, `role`, `balance`) VALUES 
('user1', '123456', '老板001', 'user', 1000.00),
('play1', '123456', '电竞女神', 'user', 0.00);

-- Update play1 to be companion
UPDATE `users` SET `is_companion` = 1 WHERE `username` = 'play1';

-- Games
INSERT INTO `games` (`name`, `icon`, `cover`) VALUES 
('王者荣耀', 'https://placehold.co/100x100/png?text=王者', 'https://placehold.co/300x200/png?text=王者荣耀封面'),
('和平精英', 'https://placehold.co/100x100/png?text=吃鸡', 'https://placehold.co/300x200/png?text=和平精英封面'),
('英雄联盟', 'https://placehold.co/100x100/png?text=LOL', 'https://placehold.co/300x200/png?text=LOL封面'),
('原神', 'https://placehold.co/100x100/png?text=原神', 'https://placehold.co/300x200/png?text=原神封面');

-- Companion Service for play1
INSERT INTO `companion_services` (`user_id`, `game_id`, `price`, `description`, `audit_status`, `status`) 
SELECT u.id, g.id, 50.00, '人美声甜，技术强！', 'approved', 1 
FROM `users` u, `games` g 
WHERE u.username = 'play1' AND g.name = '王者荣耀';
