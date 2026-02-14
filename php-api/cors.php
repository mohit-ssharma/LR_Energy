<?php
// CORS Handler - Headers are set by .htaccess
// This file handles OPTIONS preflight in PHP as backup

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for JSON responses
header('Content-Type: application/json; charset=UTF-8');
