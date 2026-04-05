-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 04, 2026 at 08:49 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `guppy_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `fish`
--

CREATE TABLE `fish` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fish`
--

INSERT INTO `fish` (`id`, `name`, `type`, `price`, `stock`, `image`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Full gold', 'Fancy', 120.00, 0, '', 'Vibrant multi-colored fancy guppy with flowing tail fins.', 1, '2026-03-21 15:43:19', '2026-04-04 18:05:59'),
(2, 'Moscow Blue Guppy', 'Moscow', 120.00, 3, '/uploads/fish/fish_69d123a3325082.78230571.webp', 'Stunning Moscow Blue guppy with deep blue coloration.', 1, '2026-03-21 15:43:19', '2026-04-04 18:05:19'),
(3, 'Dark knight Dragon Guppy', 'Dragon', 150.00, 14, '', 'Rare Red Dragon variant with intense red body.', 1, '2026-03-21 15:43:19', '2026-04-04 14:02:21'),
(4, 'Dumbo Ear Guppy', 'Dumbo', 349.00, 24, NULL, 'Unique Dumbo Ear guppy with enlarged pectoral fins.', 1, '2026-03-21 15:43:19', '2026-04-04 14:16:03'),
(5, 'Cobra Guppy', 'Cobra', 249.00, 40, NULL, 'Exotic Cobra pattern guppy with snake-skin like markings.', 1, '2026-03-21 15:43:19', '2026-03-21 15:43:19'),
(6, 'Platinum White Guppy', 'Platinum', 199.00, 35, NULL, 'Elegant all-white platinum guppy.', 1, '2026-03-21 15:43:19', '2026-03-21 15:43:19');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('new_fish','new_order','order_update','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `type`, `is_read`, `data`, `created_at`) VALUES
(1, 1, '🛒 New order #1 from shakthi - ₹299.00', 'new_order', 1, '{\"order_id\":1,\"customer_name\":\"shakthi\",\"total\":299,\"user_id\":2}', '2026-03-21 15:55:23'),
(2, 2, 'Your order #1 status has been updated to: Shipped', 'order_update', 1, '{\"order_id\":1,\"status\":\"Shipped\"}', '2026-03-21 15:56:37'),
(3, 1, '🛒 New COD Order #2 | Customer: sample | Phone: 9876543218 | Address: 39/28\nDevanathan street, 607106 | Items: Moscow Blue Guppy x1 (Rs.120.00) | Total: Rs.120.00', 'new_order', 1, '{\"order_id\":2,\"customer_name\":\"sample\",\"phone\":\"9876543218\",\"address\":\"39\\/28\\nDevanathan street\",\"pincode\":\"607106\",\"total\":120,\"items\":[\"Moscow Blue Guppy x1 (Rs.120.00)\"],\"user_id\":3}', '2026-04-04 11:19:14'),
(4, 1, '🛒 New COD Order #3 | Customer: sample | Phone: 9876543218 | Address: 39/28\nDevanathan street, 607106 | Items: Moscow Blue Guppy x1 (Rs.120.00) | Total: Rs.120.00', 'new_order', 1, '{\"order_id\":3,\"customer_name\":\"sample\",\"phone\":\"9876543218\",\"address\":\"39\\/28\\nDevanathan street\",\"pincode\":\"607106\",\"total\":120,\"items\":[\"Moscow Blue Guppy x1 (Rs.120.00)\"],\"user_id\":3}', '2026-04-04 11:46:32'),
(5, 3, 'Your order #2 has been shipped! It\'s on the way 🚚', 'order_update', 1, '{\"order_id\":2,\"status\":\"Shipped\"}', '2026-04-04 11:47:09'),
(6, 3, 'Your order #3 has been cancelled. Please contact us for more info.', 'order_update', 1, '{\"order_id\":3,\"status\":\"Cancelled\"}', '2026-04-04 11:55:00'),
(7, 3, 'Your order #3 is pending. Admin will contact you soon.', 'order_update', 1, '{\"order_id\":3,\"status\":\"Pending\"}', '2026-04-04 11:57:56'),
(8, 3, 'Your order #3 has been cancelled. Please contact us for more info.', 'order_update', 1, '{\"order_id\":3,\"status\":\"Cancelled\"}', '2026-04-04 11:58:27'),
(9, 1, '⚠️ Order #3 was CANCELLED by customer: sample', 'order_update', 1, '{\"order_id\":3,\"customer_id\":3,\"status\":\"Cancelled\"}', '2026-04-04 11:58:27'),
(10, 1, '🛒 New COD Order #4 | Customer: sample | Phone: 9876543218 | Address: fdghrte, 987654 | Items: Dark knight Dragon Guppy × 1 (Rs.150.00) | Total: Rs.150.00', 'new_order', 1, '{\"order_id\":4,\"customer_name\":\"sample\",\"phone\":\"9876543218\",\"address\":\"fdghrte\",\"pincode\":\"987654\",\"total\":150,\"items\":[\"Dark knight Dragon Guppy \\u00d7 1 (Rs.150.00)\"],\"user_id\":3}', '2026-04-04 14:02:21'),
(11, 1, '🛒 New COD Order #5 | Customer: sample | Phone: 9876543218 | Address: 39/28\nDevanathan street, 607106 | Items: Dumbo Ear Guppy × 1 (Rs.349.00) | Total: Rs.349.00', 'new_order', 1, '{\"order_id\":5,\"customer_name\":\"sample\",\"phone\":\"9876543218\",\"address\":\"39\\/28\\nDevanathan street\",\"pincode\":\"607106\",\"total\":349,\"items\":[\"Dumbo Ear Guppy \\u00d7 1 (Rs.349.00)\"],\"user_id\":3}', '2026-04-04 14:16:03');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash on Delivery',
  `shipping_name` varchar(100) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_pincode` varchar(20) DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_status` enum('Pending','Paid','Unpaid') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `payment_method`, `shipping_name`, `shipping_address`, `shipping_pincode`, `shipping_phone`, `created_at`, `updated_at`, `payment_status`) VALUES
(1, 2, 299.00, 'Shipped', 'Cash on Delivery', 'shakthi', '29, deva street , chennai', '600001', '9876543210', '2026-03-21 15:55:23', '2026-03-21 15:56:37', 'Pending'),
(2, 3, 120.00, 'Shipped', 'Cash on Delivery', 'sample', '39/28\nDevanathan street', '607106', '9876543218', '2026-04-04 11:19:14', '2026-04-04 11:47:09', 'Pending'),
(3, 3, 120.00, 'Cancelled', 'Cash on Delivery', 'sample', '39/28\nDevanathan street', '607106', '9876543218', '2026-04-04 11:46:32', '2026-04-04 13:54:27', 'Unpaid'),
(4, 3, 150.00, 'Pending', 'Cash on Delivery', 'sample', 'fdghrte', '987654', '9876543218', '2026-04-04 14:02:21', '2026-04-04 14:14:54', 'Pending'),
(5, 3, 349.00, 'Pending', 'Cash on Delivery', 'sample', '39/28\nDevanathan street', '607106', '9876543218', '2026-04-04 14:16:03', '2026-04-04 14:16:03', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `fish_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `fish_id`, `quantity`, `price`) VALUES
(1, 1, 2, 1, 299.00),
(2, 2, 2, 1, 120.00),
(3, 3, 2, 1, 120.00),
(4, 4, 3, 1, 150.00),
(5, 5, 4, 1, 349.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@guppyshop.com', '$2y$10$0Mj3PVx9vpDOteodQuelgupIj.2Uh30.ij.SGdbvogUwN3fj0kpaC', 'admin', NULL, NULL, '2026-03-21 15:43:19', '2026-03-21 15:52:01'),
(2, 'shakthi', 'shakthi@gmail.com', '$2y$12$4m6FiT9gBHImmpv3aO2vkuD2QJhS.6XH6ShdNZuPAZ6W.84d2AYTW', 'customer', '9876543210', NULL, '2026-03-21 15:54:00', '2026-03-21 15:54:00'),
(3, 'sample', 'sample@gmail.com', '$2y$12$qBpx5qDVQzn7T/7yEnIhte7NVHxVcf7EEocLpyBgMVR4BcJ8EJVjm', 'customer', '9876543218', NULL, '2026-03-28 06:38:32', '2026-03-28 06:38:32'),
(4, 'shakthi', 'shakthi1@gmail.com', '$2y$12$xmIFNZ9vGld7AokTNCGdquydQrTmf0lEK.vM.EopoKDOMp4I859xW', 'customer', '98765443210', NULL, '2026-04-04 11:11:25', '2026-04-04 11:11:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `fish`
--
ALTER TABLE `fish`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fish_type` (`type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_user` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `fish_id` (`fish_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `fish`
--
ALTER TABLE `fish`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`fish_id`) REFERENCES `fish` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
