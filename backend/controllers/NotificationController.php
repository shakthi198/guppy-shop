<?php
// backend/controllers/NotificationController.php

class NotificationController {
    /**
     * GET /notifications - Get notifications for user
     */
    public static function getForUser(array $user): void {
        $db = Database::getInstance();
        $userId = $user['id'];
        $role = $user['role'];

        if ($role === 'admin') {
            // Admin gets their own notifications
            $stmt = $db->prepare('
                SELECT * FROM notifications
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 50
            ');
            $stmt->bind_param('i', $userId);
        } else {
            // Customers get personal + broadcast (user_id IS NULL, type = new_fish)
            $stmt = $db->prepare('
                SELECT * FROM notifications
                WHERE user_id = ? OR (user_id IS NULL AND type = "new_fish")
                ORDER BY created_at DESC
                LIMIT 50
            ');
            $stmt->bind_param('i', $userId);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $notifications = [];
        $unreadCount = 0;

        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['is_read'] = (bool)$row['is_read'];
            if ($row['data']) {
                $row['data'] = json_decode($row['data'], true);
            }
            if (!$row['is_read']) $unreadCount++;
            $notifications[] = $row;
        }

        respond(200, [
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * POST /notifications/read - Mark notifications as read
     */
    public static function markRead(array $user, array $body): void {
        $db = Database::getInstance();
        $userId = $user['id'];
        $ids = $body['ids'] ?? [];

        if (empty($ids)) {
            // Mark all as read
            if ($user['role'] === 'customer') {
                $stmt = $db->prepare('
                    UPDATE notifications SET is_read = 1
                    WHERE user_id = ? OR (user_id IS NULL AND type = "new_fish")
                ');
                $stmt->bind_param('i', $userId);
            } else {
                $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
                $stmt->bind_param('i', $userId);
            }
        } else {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $types = str_repeat('i', count($ids));
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id IN ($placeholders)");
            $stmt->bind_param($types, ...$ids);
        }

        $stmt->execute();
        respond(200, ['message' => 'Marked as read']);
    }

    /**
     * POST /notifications - Admin: create notification
     */
    public static function create(array $body): void {
        $message = trim($body['message'] ?? '');
        $type = $body['type'] ?? 'system';
        $userId = $body['user_id'] ?? null;

        if (!$message) {
            respond(400, ['error' => 'Message is required']);
        }

        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)');
        $stmt->bind_param('iss', $userId, $message, $type);
        $stmt->execute();

        respond(201, ['message' => 'Notification created']);
    }

    /**
     * Broadcast notification to all customers (used internally)
     */
    public static function broadcastToCustomers(string $message, string $type, array $data = []): void {
        $db = Database::getInstance();
        $dataJson = json_encode($data);
        // NULL user_id = broadcast to all customers
        $stmt = $db->prepare('INSERT INTO notifications (user_id, message, type, data) VALUES (NULL, ?, ?, ?)');
        $stmt->bind_param('sss', $message, $type, $dataJson);
        $stmt->execute();
    }
}
