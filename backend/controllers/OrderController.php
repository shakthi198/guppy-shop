<?php
// backend/controllers/OrderController.php

class OrderController {
    /**
     * POST /orders - Create new order (after successful payment)
     */
    public static function create(array $user, array $body): void {
        $items = $body['items'] ?? [];
        $shippingName = trim($body['shipping_name'] ?? '');
        $shippingAddress = trim($body['shipping_address'] ?? '');
        $shippingPincode = trim($body['shipping_pincode'] ?? '');
        $shippingPhone = trim($body['shipping_phone'] ?? '');
        $paymentId = trim($body['payment_id'] ?? '');
        $totalAmount = (float)($body['total_amount'] ?? 0);

        if (empty($items) || !$shippingName || !$shippingAddress || $totalAmount <= 0) {
            respond(400, ['error' => 'Missing required order fields']);
        }

        $db = Database::getInstance();
        $conn = $db->getConnection();
        $conn->begin_transaction();

        try {
            // Create order
            $paymentStatus = $paymentId ? 'Paid' : 'Pending';
            $stmt = $db->prepare(
                'INSERT INTO orders (user_id, total_amount, payment_status, payment_id, shipping_name, shipping_address, shipping_pincode, shipping_phone)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $userId = $user['id'];
            $stmt->bind_param('idssssss', $userId, $totalAmount, $paymentStatus, $paymentId, $shippingName, $shippingAddress, $shippingPincode, $shippingPhone);
            $stmt->execute();
            $orderId = $db->lastInsertId();

            // Insert order items & update stock
            foreach ($items as $item) {
                $fishId = (int)($item['fish_id'] ?? 0);
                $quantity = (int)($item['quantity'] ?? 0);
                $price = (float)($item['price'] ?? 0);

                if (!$fishId || $quantity <= 0) continue;

                // Check & deduct stock
                $stockStmt = $db->prepare('SELECT stock FROM fish WHERE id = ? AND is_active = 1');
                $stockStmt->bind_param('i', $fishId);
                $stockStmt->execute();
                $stockResult = $stockStmt->get_result()->fetch_assoc();

                if (!$stockResult || $stockResult['stock'] < $quantity) {
                    throw new Exception("Insufficient stock for fish ID $fishId");
                }

                $itemStmt = $db->prepare('INSERT INTO order_items (order_id, fish_id, quantity, price) VALUES (?, ?, ?, ?)');
                $itemStmt->bind_param('iiid', $orderId, $fishId, $quantity, $price);
                $itemStmt->execute();

                $updateStmt = $db->prepare('UPDATE fish SET stock = stock - ? WHERE id = ?');
                $updateStmt->bind_param('ii', $quantity, $fishId);
                $updateStmt->execute();
            }

            $conn->commit();

            // Notify admin about new order
            $customerName = $user['name'];
            self::notifyAdmin($orderId, $customerName, $totalAmount, $userId);

            respond(201, [
                'message' => 'Order placed successfully',
                'order_id' => $orderId
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            respond(400, ['error' => $e->getMessage()]);
        }
    }

    /**
     * GET /orders - Admin: get all orders
     */
    public static function getAll(): void {
        $db = Database::getInstance();
        $sql = '
            SELECT o.*, u.name as customer_name, u.email as customer_email,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ';
        $result = $db->query($sql);
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['total_amount'] = (float)$row['total_amount'];
            $orders[] = $row;
        }
        respond(200, ['orders' => $orders]);
    }

    /**
     * GET /orders - Customer: get own orders
     */
    public static function getByUser(int $userId): void {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['total_amount'] = (float)$row['total_amount'];
            $orders[] = $row;
        }
        respond(200, ['orders' => $orders]);
    }

    /**
     * GET /orders/{id} - Get order with items
     */
    public static function getOne(int $id, array $user): void {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();

        if (!$order) {
            respond(404, ['error' => 'Order not found']);
        }

        // Only admin or owner can view
        if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $user['id']) {
            respond(403, ['error' => 'Forbidden']);
        }

        // Get order items
        $itemStmt = $db->prepare('
            SELECT oi.*, f.name as fish_name, f.image as fish_image, f.type as fish_type
            FROM order_items oi
            JOIN fish f ON oi.fish_id = f.id
            WHERE oi.order_id = ?
        ');
        $itemStmt->bind_param('i', $id);
        $itemStmt->execute();
        $itemsResult = $itemStmt->get_result();
        $items = [];
        while ($row = $itemsResult->fetch_assoc()) {
            $row['price'] = (float)$row['price'];
            $items[] = $row;
        }

        $order['items'] = $items;
        $order['total_amount'] = (float)$order['total_amount'];
        respond(200, ['order' => $order]);
    }

    /**
     * PUT /orders/{id} - Admin: update order status
     */
    public static function updateStatus(int $id, array $body): void {
        $status = $body['status'] ?? '';
        $validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
        if (!in_array($status, $validStatuses)) {
            respond(400, ['error' => 'Invalid status']);
        }

        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $status, $id);
        $stmt->execute();

        // Get order user and notify
        $orderStmt = $db->prepare('SELECT user_id, id FROM orders WHERE id = ?');
        $orderStmt->bind_param('i', $id);
        $orderStmt->execute();
        $order = $orderStmt->get_result()->fetch_assoc();

        if ($order) {
            $db2 = Database::getInstance();
            $notifStmt = $db2->prepare('INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, "order_update", ?)');
            $msg = "Your order #$id status has been updated to: $status";
            $data = json_encode(['order_id' => $id, 'status' => $status]);
            $notifStmt->bind_param('iss', $order['user_id'], $msg, $data);
            $notifStmt->execute();
        }

        respond(200, ['message' => 'Order status updated']);
    }

    /**
     * Notify admin of new order
     */
    private static function notifyAdmin(int $orderId, string $customerName, float $total, int $userId): void {
        $db = Database::getInstance();
        // Find admin users
        $result = $db->query("SELECT id FROM users WHERE role = 'admin'");
        $message = "🛒 New order #$orderId from $customerName - ₹" . number_format($total, 2);
        $data = json_encode(['order_id' => $orderId, 'customer_name' => $customerName, 'total' => $total, 'user_id' => $userId]);

        while ($admin = $result->fetch_assoc()) {
            $stmt = $db->prepare('INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, "new_order", ?)');
            $stmt->bind_param('iss', $admin['id'], $message, $data);
            $stmt->execute();
        }
    }
}
