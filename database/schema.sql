-- =======================================================
-- BHODT AI / Cyber AI Marketplace - MySQL Database Schema
-- Version: 1.0.0
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci
-- =======================================================

CREATE DATABASE IF NOT EXISTS `bhodt_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bhodt_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `profile_image` VARCHAR(500) DEFAULT '/assets/avatar-default.png',
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `account_status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `email_verified` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Password Reset Tokens
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_token` (`token`),
  INDEX `idx_email_resets` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dynamic Products / Tools Marketplace Table (Single Source of Truth)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'LKR',
  `version` VARCHAR(30) NOT NULL,
  `platform` VARCHAR(150) NOT NULL,
  `status` ENUM('AVAILABLE', 'UPDATING', 'COMING SOON', 'SOLD OUT') DEFAULT 'AVAILABLE',
  `features` JSON NOT NULL,
  `requirements` TEXT NOT NULL,
  `license` VARCHAR(150) NOT NULL,
  `file_type` VARCHAR(80) DEFAULT '.zip / Standalone App',
  `support_info` VARCHAR(255) DEFAULT 'Direct Telegram @blackhatmrx / WhatsApp 0724332896',
  `last_updated` DATE NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. AI Conversations
CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) DEFAULT 'New AI Conversation',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_conv` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI Messages
CREATE TABLE IF NOT EXISTS `ai_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender` ENUM('user', 'ai') NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE,
  INDEX `idx_conv_msg` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. User Favorite Tools
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_fav` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. User Security & Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(150) NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  `user_agent` VARCHAR(255) DEFAULT 'Browser',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_act` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. User Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_notif` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INITIAL SEED DATA
-- Default Admin Account: admin@bhodt.dev / Admin@123456
-- (Password hash is bcrypt for "Admin@123456")
-- =======================================================

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `password_hash`, `role`, `account_status`, `email_verified`, `created_at`)
VALUES (
  1,
  'BHODT Master Administrator',
  'admin',
  'admin@bhodt.dev',
  '$2a$10$wK1Fm78e.mQfF/pS4eUa3eK1jFmP8rK7uT3x9aV5bW6cE7dF8gHiG', -- hashed Admin@123456
  'admin',
  'active',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE `role`='admin';

-- Seed BHODT Digital Tools
INSERT INTO `products` (`id`, `name`, `image`, `description`, `category`, `price`, `currency`, `version`, `platform`, `status`, `features`, `requirements`, `license`, `file_type`, `support_info`, `last_updated`)
VALUES
(
  'tool-001',
  'BHODT WebAudit Pro',
  '/src/assets/images/bhodt_web_toolkit_1790926906209.jpg',
  'Automated website accessibility, performance diagnostics, and SEO compliance inspector for web developers.',
  'Web Tools',
  2500.00,
  'LKR',
  '2.4.1',
  'Web / Desktop (Win/macOS/Linux)',
  'AVAILABLE',
  '["Core Web Vitals latency & layout shift diagnostics", "Full WCAG 2.2 accessibility verification scanner", "Responsive multi-viewport stress testing engine", "One-click exportable clean PDF and JSON reports", "Zero external tracking & 100% private local analysis"]',
  'Modern browser (Chrome 110+, Firefox 115+, Safari 16+) or Node 18+ for CLI',
  'Commercial Single Developer License',
  '.zip / Standalone App bundle',
  'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
  '2026-09-18'
),
(
  'tool-002',
  'BHODT DevMatrix Core',
  '/src/assets/images/bhodt_dev_compiler_1790926925391.jpg',
  'High-throughput syntax validator, schema normalizer, and micro-benchmark harness for modern codebases.',
  'Developer Tools',
  3500.00,
  'LKR',
  '3.1.0',
  'Windows, Linux, macOS',
  'AVAILABLE',
  '["Sub-millisecond AST parser and syntax formatting engine", "Automated TypeScript & JSON schema validation runner", "Micro-benchmarking harness with regression visualizer", "Dual-mode interface: high-speed CLI + minimalist GUI", "Offline-native architecture with zero telemetry"]',
  'Windows 10/11 (64-bit), Ubuntu 22.04+, or macOS 12+ (Apple Silicon/Intel)',
  'Perpetual Single Developer License',
  '.exe / .tar.gz / .dmg',
  'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
  '2026-09-25'
),
(
  'tool-003',
  'BHODT GuardSec Auditor',
  '/src/assets/images/bhodt_security_auditor_1790926942962.jpg',
  'Authorized defensive configuration inspector, header security scanner, and cryptographic protocol audit tool.',
  'Security Tools',
  5000.00,
  'LKR',
  '1.8.0',
  'Windows 10/11, Kali/Debian Linux',
  'AVAILABLE',
  '["Automated SSL/TLS cipher suite and certificate chain validator", "HTTP defensive security headers audit and remediation guide", "Local port listening and anomalous socket activity monitor", "Strictly defensive & authorized network diagnostics only"]',
  'Admin/root permissions required for socket inspection. 64-bit OS.',
  'Enterprise Defense License',
  '.zip / Portable executable',
  'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
  '2026-09-30'
),
(
  'tool-004',
  'BHODT PromptFlow Studio',
  '/src/assets/images/bhodt_ai_optimizer_1790926958118.jpg',
  'Visual prompt engineering canvas, token usage estimator, and structured output validator for AI developers.',
  'AI Tools',
  4200.00,
  'LKR',
  '2.0.2',
  'Web App / Desktop Companion',
  'AVAILABLE',
  '["Interactive dual-prompt comparison split canvas", "Real-time token count & latency forecasting engine", "JSON Schema enforcement sandbox for structured LLM outputs", "Local session export and version branching system"]',
  'Any modern web browser or Electron runtime environment',
  'Commercial AI Developer License',
  '.zip web bundle / Electron app',
  'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
  '2026-10-01'
)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
