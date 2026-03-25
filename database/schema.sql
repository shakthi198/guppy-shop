-- ============================================
-- Guppy Fish Shop - MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS guppy_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE guppy_shop;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fish table
CREATE TABLE IF NOT EXISTS fish (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(500),
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
    payment_id VARCHAR(255),
    shipping_name VARCHAR(100),
    shipping_address TEXT,
    shipping_pincode VARCHAR(20),
    shipping_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    fish_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (fish_id) REFERENCES fish(id) ON DELETE RESTRICT
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    type ENUM('new_fish', 'new_order', 'order_update', 'system') DEFAULT 'system',
    is_read TINYINT(1) DEFAULT 0,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fish_type ON fish(type);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ============================================
-- Seed Data
-- ============================================

-- ⚠️  Admin user seeded with password = "Admin@123"
-- Hash generated via: password_hash('Admin@123', PASSWORD_BCRYPT, ['cost' => 10])
-- After import, verify by visiting: http://localhost/guppy_shop/backend/reset_admin.php
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@guppyshop.com', '$2y$10$TKh8H1.PfQ0A32/tl1gzUeJ1H/YkHIHOZ6WiJMPWjVPsqVgqXYNOS', 'admin')
ON DUPLICATE KEY UPDATE
  password = '$2y$10$TKh8H1.PfQ0A32/tl1gzUeJ1H/YkHIHOZ6WiJMPWjVPsqVgqXYNOS',
  role = 'admin';

-- Sample fish data
INSERT INTO fish (name, type, price, stock, description) VALUES
('Fancy Guppy', 'Fancy', 149.00, 50, 'Vibrant multi-colored fancy guppy with flowing tail fins.'),
('Moscow Blue Guppy', 'Moscow', 299.00, 30, 'Stunning Moscow Blue guppy with deep blue coloration.'),
('Red Dragon Guppy', 'Dragon', 399.00, 20, 'Rare Red Dragon variant with intense red body.'),
('Dumbo Ear Guppy', 'Dumbo', 349.00, 25, 'Unique Dumbo Ear guppy with enlarged pectoral fins.'),
('Cobra Guppy', 'Cobra', 249.00, 40, 'Exotic Cobra pattern guppy with snake-skin like markings.'),
('Platinum White Guppy', 'Platinum', 199.00, 35, 'Elegant all-white platinum guppy.');
