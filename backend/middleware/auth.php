<?php
// backend/middleware/auth.php

/**
 * Require valid JWT - returns decoded user payload
 */
function requireAuth(): array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        respond(401, ['error' => 'Authentication required']);
    }

    $token = substr($authHeader, 7);
    $payload = JWT::decode($token);

    if (!$payload) {
        respond(401, ['error' => 'Invalid or expired token']);
    }

    return $payload;
}

/**
 * Require a specific role
 */
function requireRole(array $user, string $role): void {
    if ($user['role'] !== $role) {
        respond(403, ['error' => 'Forbidden: insufficient permissions']);
    }
}
