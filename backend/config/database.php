<?php
// backend/config/database.php

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'guppy_shop');

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($this->connection->connect_error) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed: ' . $this->connection->connect_error]));
        }
        $this->connection->set_charset('utf8mb4');
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): mysqli {
        return $this->connection;
    }

    public function query(string $sql): mysqli_result|bool {
        return $this->connection->query($sql);
    }

    public function prepare(string $sql): mysqli_stmt|false {
        return $this->connection->prepare($sql);
    }

    public function escape(string $value): string {
        return $this->connection->real_escape_string($value);
    }

    public function lastInsertId(): int {
        return $this->connection->insert_id;
    }
}
