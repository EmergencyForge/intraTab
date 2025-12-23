-- ============================================
-- ASU Database Schema
-- ============================================
-- This SQL file creates the necessary database structure
-- for storing Atemschutzüberwachung (Breathing Apparatus Monitoring) protocols
-- 
-- Requirements:
-- - MySQL 5.7+ or MariaDB 10.2+
-- 
-- Usage:
-- mysql -u your_user -p your_database < asu_schema.sql

-- ============================================
-- Main Protocol Table
-- ============================================

CREATE TABLE IF NOT EXISTS `asu_protocols` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `mission_number` VARCHAR(100) NOT NULL,
  `mission_location` VARCHAR(255) NOT NULL,
  `mission_date` DATE NOT NULL,
  `supervisor` VARCHAR(255) NOT NULL,
  `protocol_data` LONGTEXT NOT NULL COMMENT 'Full protocol data in JSON format',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mission_number` (`mission_number`),
  INDEX `idx_mission_date` (`mission_date`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Trupp Details Table (optional - normalized structure)
-- ============================================

CREATE TABLE IF NOT EXISTS `asu_trupps` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `protocol_id` INT(11) UNSIGNED NOT NULL,
  `trupp_number` TINYINT(1) NOT NULL COMMENT '1, 2, or 3 (Sicherheitstrupp)',
  `trupp_type` ENUM('1. Trupp', '2. Trupp', 'Sicherheitstrupp') NOT NULL,
  `truppfuehrer` VARCHAR(255) NOT NULL,
  `truppmann1` VARCHAR(255) NOT NULL,
  `truppmann2` VARCHAR(255) NULL,
  `start_pressure` INT(11) NULL COMMENT 'in bar',
  `start_time` TIME NULL,
  `mission_type` VARCHAR(100) NULL,
  `check1_time` TIME NULL,
  `check1_data` TEXT NULL,
  `check2_time` TIME NULL,
  `check2_data` TEXT NULL,
  `objective` VARCHAR(255) NULL,
  `retreat_time` TIME NULL,
  `end_time` TIME NULL,
  `elapsed_seconds` INT(11) NULL COMMENT 'Total operation time in seconds',
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`protocol_id`) REFERENCES `asu_protocols`(`id`) ON DELETE CASCADE,
  INDEX `idx_protocol_id` (`protocol_id`),
  INDEX `idx_trupp_number` (`trupp_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Views for Easy Querying
-- ============================================

-- View: All protocols with basic info
CREATE OR REPLACE VIEW `asu_protocols_overview` AS
SELECT 
  p.id,
  p.mission_number,
  p.mission_location,
  p.mission_date,
  p.supervisor,
  p.created_at,
  COUNT(DISTINCT t.id) as trupp_count
FROM `asu_protocols` p
LEFT JOIN `asu_trupps` t ON p.id = t.protocol_id
GROUP BY p.id;

-- View: Trupp statistics
CREATE OR REPLACE VIEW `asu_trupp_statistics` AS
SELECT 
  DATE(p.mission_date) as date,
  COUNT(DISTINCT p.id) as total_missions,
  COUNT(t.id) as total_trupps,
  AVG(t.elapsed_seconds) as avg_operation_time_seconds,
  MAX(t.elapsed_seconds) as max_operation_time_seconds,
  MIN(t.elapsed_seconds) as min_operation_time_seconds
FROM `asu_protocols` p
LEFT JOIN `asu_trupps` t ON p.id = t.protocol_id
GROUP BY DATE(p.mission_date);

-- ============================================
-- Example Queries
-- ============================================

-- Get all protocols for a specific mission number
-- SELECT * FROM asu_protocols WHERE mission_number = 'E-2024-001';

-- Get all trupps for a specific protocol
-- SELECT * FROM asu_trupps WHERE protocol_id = 1;

-- Get protocols from the last 7 days
-- SELECT * FROM asu_protocols WHERE mission_date >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Get protocols with more than 45 minutes operation time
-- SELECT p.*, t.* 
-- FROM asu_protocols p
-- JOIN asu_trupps t ON p.id = t.protocol_id
-- WHERE t.elapsed_seconds > 2700;

-- Get average operation time by mission type
-- SELECT 
--   t.mission_type,
--   AVG(t.elapsed_seconds) / 60 as avg_minutes,
--   COUNT(*) as count
-- FROM asu_trupps t
-- WHERE t.mission_type IS NOT NULL
-- GROUP BY t.mission_type;
