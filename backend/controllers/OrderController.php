<?php
// backend/controllers/OrderController.php
// Cash on Delivery only — no payment gateway

class OrderController {

    /**
     * POST /orders — Place a Cash on Delivery order
     */
    public static function create(array $user, array $body): void {
        $items           = $body['items']            ?? [];
        $shippingName    = trim($body['shipping_name']    ?? '');
        $shippingAddress = trim($body['shipping_address'] ?? '');
        $shippingPincode = trim($body['shipping_pincode'] ?? '');
        $shippingPhone   = trim($body['shipping_phone']   ?? '');
        $totalAmount     = (float)($body['total_amount']  ?? 0);

        // ── Validation ─────────────────────────────────────────────────────
        if (empty($items)) {
            respond(400, ['error' => 'Cart is empty']);
        }
        if (!$shippingName) {
            respond(400, ['error' => 'Customer name is required']);
        }
        if (!$shippingPhone || !preg_match('/^\d{10}$/', $shippingPhone)) {
            respond(400, ['error' => 'A valid 10-digit phone number is required']);
        }
        if (!$shippingAddress) {
            respond(400, ['error' => 'Delivery address is required']);
        }
        if (!$shippingPincode || !preg_match('/^\d{6}$/', $shippingPincode)) {
            respond(400, ['error' => 'A valid 6-digit pincode is required']);
        }
        if ($totalAmount <= 0) {
            respond(400, ['error' => 'Invalid order total']);
        }

        $db   = Database::getInstance();
        $conn = $db->getConnection();
        $conn->begin_transaction();

        try {
            // ── Insert order ───────────────────────────────────────────────
            $paymentMethod = 'Cash on Delivery';
            $stmt = $db->prepare(
                'INSERT INTO orders
                 (user_id, total_amount, status, payment_method,
                  shipping_name, shipping_address, shipping_pincode, shipping_phone)
                 VALUES (?, ?, "Pending", ?, ?, ?, ?, ?)'
            );
            $userId = $user['id'];
            $stmt->bind_param(
                'idsssss',
                $userId, $totalAmount, $paymentMethod,
                $shippingName, $shippingAddress, $shippingPincode, $shippingPhone
            );
            $stmt->execute();
            $orderId = $db->lastInsertId();

            // ── Insert items & deduct stock ────────────────────────────────
            $itemSummary = [];   // for notification message
            foreach ($items as $item) {
                $fishId   = (int)($item['fish_id']  ?? 0);
                $quantity = (int)($item['quantity'] ?? 0);
                $price    = (float)($item['price']  ?? 0);

                if (!$fishId || $quantity <= 0) continue;

                // Check stock
                $stockStmt = $db->prepare('SELECT name, stock FROM fish WHERE id = ? AND is_active = 1');
                $stockStmt->bind_param('i', $fishId);
                $stockStmt->execute();
                $fishRow = $stockStmt->get_result()->fetch_assoc();

                if (!$fishRow) {
                    throw new Exception("Fish ID $fishId not found or is no longer available");
                }
                if ($fishRow['stock'] < $quantity) {
                    throw new Exception(
                        "Insufficient stock for \"{$fishRow['name']}\" " .
                        "(requested: $quantity, available: {$fishRow['stock']})"
                    );
                }

                // Insert item row
                $itemStmt = $db->prepare(
                    'INSERT INTO order_items (order_id, fish_id, quantity, price) VALUES (?, ?, ?, ?)'
                );
                $itemStmt->bind_param('iiid', $orderId, $fishId, $quantity, $price);
                $itemStmt->execute();

                // Deduct stock
                $updStmt = $db->prepare('UPDATE fish SET stock = stock - ? WHERE id = ?');
                $updStmt->bind_param('ii', $quantity, $fishId);
                $updStmt->execute();

                $itemSummary[] = "{$fishRow['name']} × {$quantity} (Rs." . number_format($price * $quantity, 2) . ")";
            }

            $conn->commit();

            // ── Notify all admins ──────────────────────────────────────────
            self::notifyAdmins(
                $orderId,
                $user['name'],
                $shippingPhone,
                $shippingAddress,
                $shippingPincode,
                $totalAmount,
                $itemSummary,
                $user['id']
            );

            respond(201, [
                'message'  => 'Order placed successfully. Our admin will contact you soon.',
                'order_id' => $orderId,
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            respond(400, ['error' => $e->getMessage()]);
        }
    }

    /**
     * GET /orders — Admin: all orders | Customer: own orders
     */
    public static function getAll(): void {
        $db  = Database::getInstance();
        $sql = '
            SELECT
                o.*,
                u.name  AS customer_name,
                u.email AS customer_email,
                COUNT(oi.id) AS item_count
            FROM orders o
            JOIN  users u        ON o.user_id  = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ';
        $result = $db->query($sql);
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['id']           = (int)$row['id'];
            $row['total_amount'] = (float)$row['total_amount'];
            $orders[] = $row;
        }
        respond(200, ['orders' => $orders]);
    }

    /**
     * GET /orders — Customer: own orders only
     */
    public static function getByUser(int $userId): void {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
        );
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['id']           = (int)$row['id'];
            $row['total_amount'] = (float)$row['total_amount'];
            $orders[] = $row;
        }
        respond(200, ['orders' => $orders]);
    }

    /**
     * GET /orders/{id} — Order detail with items
     */
    public static function getOne(int $id, array $user): void {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ?'
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$order) {
            respond(404, ['error' => 'Order not found']);
        }

        // Only admin or order owner can view
        if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $user['id']) {
            respond(403, ['error' => 'Forbidden']);
        }

        // Fetch items with fish details
        $itemStmt = $db->prepare(
            'SELECT oi.*, f.name AS fish_name, f.image AS fish_image, f.type AS fish_type
             FROM order_items oi
             JOIN fish f ON oi.fish_id = f.id
             WHERE oi.order_id = ?'
        );
        $itemStmt->bind_param('i', $id);
        $itemStmt->execute();
        $res = $itemStmt->get_result();
        
        $items = [];
        while ($row = $res->fetch_assoc()) {
            $row['price'] = (float)$row['price'];
            $items[] = $row;
        }
        $itemStmt->close();

        $order['items']        = $items;
        $order['total_amount'] = (float)$order['total_amount'];
        respond(200, ['order' => $order]);
    }

    /**
     * PUT /orders/{id} — Admin: update order status
     */
    public static function updateStatus(int $id, array $user, array $body): void {
        $status          = $body['status']  ?? null;
        $paymentStatus   = $body['payment_status'] ?? null;
        
        $validStatuses   = ['Pending', 'Confirmed', 'Delivered', 'Cancelled', 'Shipped'];
        $validPayStates  = ['Pending', 'Paid', 'Unpaid'];

        if ($status && !in_array($status, $validStatuses)) {
            respond(400, ['error' => "Invalid status: $status. Allowed: " . implode(', ', $validStatuses)]);
        }
        if ($paymentStatus && !in_array($paymentStatus, $validPayStates)) {
            respond(400, ['error' => 'Invalid payment status. Allowed: ' . implode(', ', $validPayStates)]);
        }

        $db   = Database::getInstance();
        
        // ── Fetch current order details ──────
        $orderStmt = $db->prepare('SELECT user_id, status, shipping_name FROM orders WHERE id = ?');
        $orderStmt->bind_param('i', $id);
        $orderStmt->execute();
        $orderRes = $orderStmt->get_result();
        $order    = $orderRes->fetch_assoc();
        $orderStmt->close(); // Close ASAP

        if (!$order) {
            respond(404, ['error' => "Order #$id not found"]);
        }

        // ── Permission & Business Logic ──────
        $isAdmin = ($user['role'] === 'admin');
        $isOwner = ((int)$order['user_id'] === $user['id']);

        if (!$isAdmin) {
            if (!$isOwner) {
                respond(403, ['error' => 'You do not have permission to update this order']);
            }
            if ($paymentStatus) {
                respond(403, ['error' => 'Customers cannot update payment status.']);
            }
            if ($status !== 'Cancelled') {
                respond(403, ['error' => 'Customers can only cancel their orders.']);
            }
            if ($order['status'] !== 'Pending') {
                respond(400, ['error' => 'Order cannot be cancelled because it is no longer pending.']);
            }
        }

        // ── Proceed with Update ──────
        $updates = [];
        $params = [];
        $types = "";

        if ($status) {
            $updates[] = "status = ?";
            $params[] = $status;
            $types .= "s";
        }
        if ($paymentStatus) {
            $updates[] = "payment_status = ?";
            $params[] = $paymentStatus;
            $types .= "s";
        }

        if (!empty($updates)) {
            $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE id = ?";
            $params[] = $id;
            $types .= "i";

            $stmt = $db->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $stmt->close();
        }

        // ── Notify Customer ──────
        if ($status) {
            $statusMessages = [
                'Confirmed'  => "Your order #$id has been confirmed! We will deliver it soon.",
                'Shipped'    => "Your order #$id has been shipped! 🐟",
                'Delivered'  => "Your order #$id has been delivered. Thank you! 📦",
                'Cancelled'  => "Your order #$id has been cancelled. Please contact us for more info.",
                'Pending'    => "Your order #$id is pending. Admin will contact you soon.",
            ];
            $msg  = $statusMessages[$status] ?? "Your order #$id status updated to: $status";
            $data = json_encode(['order_id' => $id, 'status' => $status]);

            $notifStmt = $db->prepare(
                'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, "order_update", ?)'
            );
            $notifStmt->bind_param('iss', $order['user_id'], $msg, $data);
            $notifStmt->execute();
            $notifStmt->close();
        }

        // ── Notify Admins on Customer Cancellation ──────
        if (!$isAdmin && $status === 'Cancelled') {
            $adminMsg = "⚠️ Order #$id was CANCELLED by customer: {$order['shipping_name']}";
            $adminData = json_encode(['order_id' => $id, 'customer_id' => $user['id'], 'status' => 'Cancelled']);
            
            // Fetch all admin IDs first to avoid sync issues
            $adminIds = [];
            $adminsRes = $db->query("SELECT id FROM users WHERE role = 'admin'");
            while ($row = $adminsRes->fetch_assoc()) {
                $adminIds[] = $row['id'];
            }
            $adminsRes->free();

            // Notify each admin
            foreach ($adminIds as $adminId) {
                $admNotif = $db->prepare(
                    'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, "order_update", ?)'
                );
                $admNotif->bind_param('iss', $adminId, $adminMsg, $adminData);
                $admNotif->execute();
                $admNotif->close();
            }
        }

        respond(200, ['message' => "Order #$id updated successfully"]);
    }

    /**
     * Send full order notification to all admin users
     */
    private static function notifyAdmins(
        int    $orderId,
        string $customerName,
        string $phone,
        string $address,
        string $pincode,
        float  $total,
        array  $itemSummary,
        int    $userId
    ): void {
        $db       = Database::getInstance();
        $admins   = $db->query("SELECT id FROM users WHERE role = 'admin'");
        $itemsStr = implode(', ', $itemSummary);
        $message  =
            "🛒 New COD Order #$orderId | " .
            "Customer: $customerName | " .
            "Phone: $phone | " .
            "Address: $address, $pincode | " .
            "Items: $itemsStr | " .
            "Total: Rs." . number_format($total, 2);

        $data = json_encode([
            'order_id'      => $orderId,
            'customer_name' => $customerName,
            'phone'         => $phone,
            'address'       => $address,
            'pincode'       => $pincode,
            'total'         => $total,
            'items'         => $itemSummary,
            'user_id'       => $userId,
        ]);

        while ($admin = $admins->fetch_assoc()) {
            $stmt = $db->prepare(
                'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, "new_order", ?)'
            );
            $stmt->bind_param('iss', $admin['id'], $message, $data);
            $stmt->execute();
        }
    }
}
