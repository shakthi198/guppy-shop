<?php
// backend/controllers/UploadController.php

class UploadController {
    private static $uploadDir = __DIR__ . '/../../uploads/fish/';
    private static $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private static $maxSize = 5 * 1024 * 1024; // 5MB

    /**
     * POST /upload - Upload fish image
     */
    public static function uploadImage(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(405, ['error' => 'Method not allowed']);
        }

        if (!isset($_FILES['image'])) {
            respond(400, ['error' => 'No image file provided']);
        }

        $file = $_FILES['image'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            respond(400, ['error' => 'File upload error: ' . $file['error']]);
        }

        if ($file['size'] > self::$maxSize) {
            respond(400, ['error' => 'File too large. Max 5MB allowed']);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::$allowedTypes)) {
            respond(400, ['error' => 'Invalid file type. Only JPEG, PNG, GIF, WebP allowed']);
        }

        // Create upload directory if needed
        if (!is_dir(self::$uploadDir)) {
            mkdir(self::$uploadDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('fish_', true) . '.' . strtolower($ext);
        $destination = self::$uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            respond(500, ['error' => 'Failed to save image']);
        }

        $imageUrl = '/uploads/fish/' . $filename;
        respond(200, ['url' => $imageUrl, 'message' => 'Image uploaded successfully']);
    }
}
