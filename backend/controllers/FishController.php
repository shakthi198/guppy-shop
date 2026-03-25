<?php
// backend/controllers/FishController.php

class FishController {
    /**
     * GET /fish - Get all fish (with optional search/filter)
     */
    public static function getAll(): void {
        $db = Database::getInstance();
        $search = trim($_GET['search'] ?? '');
        $type = trim($_GET['type'] ?? '');

        $sql = 'SELECT * FROM fish WHERE is_active = 1';
        $params = [];
        $types = '';

        if ($search) {
            $sql .= ' AND (name LIKE ? OR description LIKE ?)';
            $likeSearch = "%$search%";
            $params[] = &$likeSearch;
            $params[] = &$likeSearch;
            $types .= 'ss';
        }

        if ($type) {
            $sql .= ' AND type = ?';
            $params[] = &$type;
            $types .= 's';
        }

        $sql .= ' ORDER BY created_at DESC';

        if ($params) {
            $stmt = $db->prepare($sql);
            array_unshift($params, $types);
            call_user_func_array([$stmt, 'bind_param'], $params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $db->query($sql);
        }

        $fish = [];
        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['price'] = (float)$row['price'];
            $row['stock'] = (int)$row['stock'];
            $fish[] = $row;
        }

        respond(200, ['fish' => $fish, 'count' => count($fish)]);
    }

    /**
     * GET /fish/{id}
     */
    public static function getOne(int $id): void {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM fish WHERE id = ? AND is_active = 1');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            respond(404, ['error' => 'Fish not found']);
        }

        $fish = $result->fetch_assoc();
        $fish['id'] = (int)$fish['id'];
        $fish['price'] = (float)$fish['price'];
        $fish['stock'] = (int)$fish['stock'];

        respond(200, ['fish' => $fish]);
    }

    /**
     * POST /fish - Admin: create new fish
     */
    public static function create(array $body): void {
        $name = trim($body['name'] ?? '');
        $type = trim($body['type'] ?? '');
        $price = (float)($body['price'] ?? 0);
        $stock = (int)($body['stock'] ?? 0);
        $image = trim($body['image'] ?? '');
        $description = trim($body['description'] ?? '');

        if (!$name || !$type || $price <= 0) {
            respond(400, ['error' => 'Name, type, and valid price are required']);
        }

        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO fish (name, type, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssdiss', $name, $type, $price, $stock, $image, $description);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to add fish']);
        }

        $fishId = $db->lastInsertId();

        // Notify all customers about new fish
        require_once __DIR__ . '/NotificationController.php';
        NotificationController::broadcastToCustomers(
            "🐟 New fish added: $name is now available in the shop!",
            'new_fish',
            ['fish_id' => $fishId, 'fish_name' => $name]
        );

        respond(201, [
            'message' => 'Fish added successfully',
            'fish_id' => $fishId
        ]);
    }

    /**
     * PUT /fish/{id} - Admin: update fish
     */
    public static function update(int $id, array $body): void {
        $db = Database::getInstance();

        // Check fish exists
        $stmt = $db->prepare('SELECT id FROM fish WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            respond(404, ['error' => 'Fish not found']);
        }

        $name = trim($body['name'] ?? '');
        $type = trim($body['type'] ?? '');
        $price = (float)($body['price'] ?? 0);
        $stock = (int)($body['stock'] ?? 0);
        $image = trim($body['image'] ?? '');
        $description = trim($body['description'] ?? '');

        $stmt = $db->prepare('UPDATE fish SET name=?, type=?, price=?, stock=?, image=?, description=? WHERE id=?');
        $stmt->bind_param('ssdissi', $name, $type, $price, $stock, $image, $description, $id);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to update fish']);
        }

        respond(200, ['message' => 'Fish updated successfully']);
    }

    /**
     * DELETE /fish/{id} - Admin: soft delete fish
     */
    public static function delete(int $id): void {
        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE fish SET is_active = 0 WHERE id = ?');
        $stmt->bind_param('i', $id);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to delete fish']);
        }

        respond(200, ['message' => 'Fish deleted successfully']);
    }
}
