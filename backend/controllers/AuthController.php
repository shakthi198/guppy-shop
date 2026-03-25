<?php
// backend/controllers/AuthController.php

class AuthController {
    /**
     * POST /register
     */
    public static function register(array $body): void {
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $phone = trim($body['phone'] ?? '');

        // Validate
        if (!$name || !$email || !$password) {
            respond(400, ['error' => 'Name, email, and password are required']);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(400, ['error' => 'Invalid email format']);
        }
        if (strlen($password) < 6) {
            respond(400, ['error' => 'Password must be at least 6 characters']);
        }

        $db = Database::getInstance();

        // Check if email exists
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            respond(409, ['error' => 'Email already registered']);
        }

        // Hash password and insert
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, "customer")');
        $stmt->bind_param('ssss', $name, $email, $hashedPassword, $phone);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to create account']);
        }

        $userId = $db->lastInsertId();
        $token = JWT::encode(['id' => $userId, 'email' => $email, 'name' => $name, 'role' => 'customer']);

        respond(201, [
            'message' => 'Account created successfully',
            'token' => $token,
            'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer']
        ]);
    }

    /**
     * POST /login
     */
    public static function login(array $body): void {
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            respond(400, ['error' => 'Email and password are required']);
        }

        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            respond(401, ['error' => 'Invalid credentials']);
        }

        $user = $result->fetch_assoc();

        if (!password_verify($password, $user['password'])) {
            respond(401, ['error' => 'Invalid credentials']);
        }

        $token = JWT::encode([
            'id' => (int)$user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]);

        respond(200, [
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    }
}
