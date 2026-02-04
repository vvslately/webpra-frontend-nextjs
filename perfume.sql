/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `delivery_method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'เงินที่ user เก็บได้',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint unsigned DEFAULT NULL COMMENT '1-5',
  `product_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `reviews_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT 'ผู้ซื้อ (null = ลูกค้าทั่วไป)',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อจริง',
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'นามสกุล',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'เบอร์ติดต่อ',
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ที่อยู่จัดส่ง',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'pending, paid, shipped, cancelled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `qty` int NOT NULL DEFAULT 1,
  `selected_options` json DEFAULT NULL COMMENT 'JSON เก็บ options ที่เลือก เช่น {"สี": "แดง", "ขนาด": "L"}',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `order_items_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALTER TABLE สำหรับเพิ่ม selected_options ถ้ามี table อยู่แล้ว
-- ALTER TABLE `order_items` ADD COLUMN `selected_options` json DEFAULT NULL COMMENT 'JSON เก็บ options ที่เลือก เช่น {"สี": "แดง", "ขนาด": "L"}' AFTER `qty`;

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อ',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'โทรศัพท์',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'อีเมล',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ข้อความ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_option_values`;
DROP TABLE IF EXISTS `product_options`;
CREATE TABLE `product_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อ option เช่น สี, ขนาด',
  `display_order` int NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดง',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_options_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_option_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `option_id` int NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ค่าของ option เช่น แดง, S',
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'คำบรรยายค่าของ option',
  `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'การปรับราคา (บวก/ลบ)',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL รูปภาพของ option นี้',
  `display_order` int NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดง',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_option_id` (`option_id`),
  CONSTRAINT `product_option_values_option_id_fk` FOREIGN KEY (`option_id`) REFERENCES `product_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALTER TABLE สำหรับเพิ่ม description และ price_adjustment ถ้ามี table อยู่แล้ว
-- ALTER TABLE `product_option_values` ADD COLUMN `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'คำบรรยายค่าของ option' AFTER `value`;
-- ALTER TABLE `product_option_values` ADD COLUMN `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'การปรับราคา (บวก/ลบ)' AFTER `description`;

DROP TABLE IF EXISTS `product_option_combinations`;
CREATE TABLE `product_option_combinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `combination` json NOT NULL COMMENT 'JSON เก็บ combination เช่น {"สี": "แดง", "ขนาด": "L"}',
  `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'การปรับราคา (บวก/ลบ)',
  `display_order` int NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดง',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_option_combinations_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALTER TABLE สำหรับเพิ่ม product_option_combinations ถ้ามี table อยู่แล้ว
-- CREATE TABLE `product_option_combinations` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `product_id` int NOT NULL,
--   `combination` json NOT NULL COMMENT 'JSON เก็บ combination เช่น {"สี": "แดง", "ขนาด": "L"}',
--   `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'การปรับราคา (บวก/ลบ)',
--   `display_order` int NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดง',
--   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   KEY `idx_product_id` (`product_id`),
--   CONSTRAINT `product_option_combinations_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `about`;
CREATE TABLE `about` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL รูปภาพ',
  `content` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ข้อความเกี่ยวกับเรา',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ข้อมูลเริ่มต้นสำหรับหน้าเกี่ยวกับเรา
INSERT INTO `about` (`image_url`, `content`) VALUES
('https://files.cdn-files-a.com/admin/system_photos_stock/2000_695b11503992e.jpg', 'ร้านของเราเป็นร้านจำหน่ายน้ำหอมออนไลน์ที่ก่อตั้งขึ้นด้วยความตั้งใจในการนำเสนอน้ำหอมคุณภาพดีในราคาที่เข้าถึงได้ เพื่อให้ลูกค้าทุกคนสามารถเลือกกลิ่นหอมที่เหมาะกับบุคลิกและโอกาสต่าง ๆ ในชีวิตประจำวันได้อย่างสะดวกสบายผ่านระบบออนไลน์\n\nเราคัดสรรน้ำหอมหลากหลายกลิ่น ทั้งโทนหวาน สดชื่น หรูหรา และสุภาพ เพื่อรองรับความต้องการของลูกค้าทุกเพศทุกวัย พร้อมให้ข้อมูลรายละเอียดของสินค้าอย่างชัดเจน เพื่อช่วยในการตัดสินใจเลือกซื้อ');

-- ถ้ามีตาราง users อยู่แล้ว ให้รัน: ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'เงินที่ user เก็บได้';
--
-- ตัวอย่างรีวิว (รันหลังสร้างตาราง products และมี id อย่างน้อย 1)
-- INSERT INTO `reviews` (`author_name`, `content`, `rating`, `product_id`) VALUES
-- ('คุณ A', 'กลิ่นหอมนาน ใช้แล้วชอบมาก', 5, 1),
-- ('คุณ B', 'ราคาคุ้มค่า ส่งเร็ว', 4, 1);

-- ตัวอย่างสินค้า (ถ้ายังไม่มี)
-- INSERT INTO `products` (`name`, `subtitle`, `image`, `price`, `delivery_method`) VALUES
-- ('น้ำหอมกลิ่น A', 'กลิ่นฟลอรัล สดชื่น', NULL, 599.00, 'ส่งธรรมดา'),
-- ('น้ำหอมกลิ่น B', 'กลิ่นวูดดี้ อบอุ่น', NULL, 799.00, 'ส่งด่วน');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;