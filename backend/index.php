<?php
// backend/index.php - Main entry point & router

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/FishController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/NotificationController.php';
require_once __DIR__ . '/controllers/UploadController.php';

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip any base-path prefix - handles guppy_shop, guppy-shop, or direct /backend/
$uri = preg_replace('#^/guppy[_\-]shop/backend#i', '', $uri);
$uri = preg_replace('#^/backend#i', '', $uri);
$uri = preg_replace('#^/api#i', '', $uri);

$parts = array_values(array_filter(explode('/', trim($uri, '/'))));

$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;
$subResource = $parts[2] ?? null;

// Get request body
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Route to controller
try {
    switch ($resource) {
        case 'register':
            AuthController::register($body);
            break;

        case 'login':
            AuthController::login($body);
            break;

        case 'fish':
            if ($method === 'GET' && !$id) {
                FishController::getAll();
            } elseif ($method === 'GET' && $id) {
                FishController::getOne((int)$id);
            } elseif ($method === 'POST') {
                $user = requireAuth();
                requireRole($user, 'admin');
                FishController::create($body);
            } elseif ($method === 'PUT' && $id) {
                $user = requireAuth();
                requireRole($user, 'admin');
                FishController::update((int)$id, $body);
            } elseif ($method === 'DELETE' && $id) {
                $user = requireAuth();
                requireRole($user, 'admin');
                FishController::delete((int)$id);
            } else {
                respond(405, ['error' => 'Method not allowed']);
            }
            break;

        case 'orders':
            $user = requireAuth();
            if ($method === 'POST') {
                OrderController::create($user, $body);
            } elseif ($method === 'GET' && !$id) {
                if ($user['role'] === 'admin') {
                    OrderController::getAll();
                } else {
                    OrderController::getByUser($user['id']);
                }
            } elseif ($method === 'GET' && $id) {
                OrderController::getOne((int)$id, $user);
            } elseif ($method === 'PUT' && $id) {
                requireRole($user, 'admin');
                OrderController::updateStatus((int)$id, $body);
            } else {
                respond(405, ['error' => 'Method not allowed']);
            }
            break;

        case 'notifications':
            $user = requireAuth();
            if ($method === 'GET') {
                NotificationController::getForUser($user);
            } elseif ($method === 'POST' && $id === 'read') {
                NotificationController::markRead($user, $body);
            } elseif ($method === 'POST') {
                requireRole($user, 'admin');
                NotificationController::create($body);
            } else {
                respond(405, ['error' => 'Method not allowed']);
            }
            break;

        case 'upload':
            $user = requireAuth();
            requireRole($user, 'admin');
            UploadController::uploadImage();
            break;

        case 'me':
            $user = requireAuth();
            respond(200, ['user' => $user]);
            break;

        default:
            respond(404, ['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    respond(500, ['error' => $e->getMessage()]);
}

/**
 * Send JSON response
 */
function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
