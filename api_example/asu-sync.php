<?php
/**
 * ASU Sync API Endpoint
 * 
 * This is an example PHP endpoint for receiving and processing
 * Atemschutzüberwachung (Breathing Apparatus Monitoring) data from FiveM.
 * 
 * Installation:
 * 1. Place this file on your web server (e.g., /api/asu-sync.php)
 * 2. Configure the API key in Config.ASUSync.APIKey in FiveM
 * 3. Set the URL in Config.ASUSync.APIEndpoint in FiveM
 * 4. Enable ASU sync by setting Config.ASUSync.Enabled = true
 * 
 * Requirements:
 * - PHP 7.4 or higher
 * - MySQL/MariaDB database (optional, for storage)
 * - HTTPS enabled (FiveM requirement)
 */

// ============================================
// CONFIGURATION
// ============================================

// API Key - CHANGE THIS to match your intraRP API key
$VALID_API_KEY = 'CHANGE_ME';

// Database configuration (optional - uncomment to enable)
/*
$DB_HOST = 'localhost';
$DB_NAME = 'your_database';
$DB_USER = 'your_username';
$DB_PASS = 'your_password';
*/

// Log file path (optional - set to null to disable file logging)
$LOG_FILE = __DIR__ . '/asu_sync.log';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Log message to file
 */
function logMessage($message, $level = 'INFO') {
    global $LOG_FILE;
    if ($LOG_FILE) {
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "[$timestamp] [$level] $message\n";
        file_put_contents($LOG_FILE, $logLine, FILE_APPEND);
    }
}

/**
 * Send JSON response
 */
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Validate required fields
 */
function validateProtocol($data) {
    $required = ['missionNumber', 'missionLocation', 'missionDate', 'supervisor'];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            return "Missing required field: $field";
        }
    }
    
    // Check if at least one trupp has data
    $hasTruppData = false;
    for ($i = 1; $i <= 3; $i++) {
        $trupp = $data["trupp$i"] ?? null;
        if ($trupp && !empty($trupp['tf']) && !empty($trupp['tm1'])) {
            $hasTruppData = true;
            break;
        }
    }
    
    if (!$hasTruppData) {
        return "At least one trupp must have TF and TM1 filled";
    }
    
    return null;
}

/**
 * Save protocol to database (example)
 */
function saveToDatabase($protocol) {
    // Uncomment and configure database connection above to use this
    /*
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    
    try {
        $pdo = new PDO(
            "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $stmt = $pdo->prepare("
            INSERT INTO asu_protocols 
            (mission_number, mission_location, mission_date, supervisor, protocol_data, created_at)
            VALUES 
            (:mission_number, :mission_location, :mission_date, :supervisor, :protocol_data, NOW())
        ");
        
        $stmt->execute([
            ':mission_number' => $protocol['missionNumber'],
            ':mission_location' => $protocol['missionLocation'],
            ':mission_date' => $protocol['missionDate'],
            ':supervisor' => $protocol['supervisor'],
            ':protocol_data' => json_encode($protocol)
        ]);
        
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        logMessage("Database error: " . $e->getMessage(), 'ERROR');
        return false;
    }
    */
    
    // For this example, just log to file
    $filename = __DIR__ . '/asu_protocols/' . $protocol['missionNumber'] . '_' . time() . '.json';
    
    // Create directory if it doesn't exist
    $dir = dirname($filename);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    file_put_contents($filename, json_encode($protocol, JSON_PRETTY_PRINT));
    return true;
}

// ============================================
// MAIN SCRIPT
// ============================================

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logMessage("Invalid request method: " . $_SERVER['REQUEST_METHOD'], 'WARNING');
    sendResponse(405, ['error' => 'Method not allowed']);
}

// Get request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    logMessage("Invalid JSON: " . json_last_error_msg(), 'ERROR');
    sendResponse(400, ['error' => 'Invalid JSON']);
}

// Log request
logMessage("Received request from " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

// Validate API key
if (!isset($data['intraRP_API_Key']) || $data['intraRP_API_Key'] !== $VALID_API_KEY) {
    logMessage("Invalid API key", 'WARNING');
    sendResponse(401, ['error' => 'Invalid API Key']);
}

// Check data type
if (!isset($data['type']) || $data['type'] !== 'asu_protocol') {
    logMessage("Invalid data type: " . ($data['type'] ?? 'none'), 'WARNING');
    sendResponse(400, ['error' => 'Invalid data type']);
}

// Get protocol data
$protocol = $data['data'] ?? null;
if (!$protocol) {
    logMessage("Missing protocol data", 'ERROR');
    sendResponse(400, ['error' => 'Missing protocol data']);
}

// Validate protocol
$validationError = validateProtocol($protocol);
if ($validationError) {
    logMessage("Validation error: $validationError", 'WARNING');
    sendResponse(400, ['error' => $validationError]);
}

// Save protocol
logMessage("Processing protocol for mission: " . $protocol['missionNumber']);
$saved = saveToDatabase($protocol);

if ($saved) {
    logMessage("Protocol saved successfully: " . $protocol['missionNumber'], 'SUCCESS');
    sendResponse(200, [
        'success' => true,
        'message' => 'Protocol received and saved',
        'missionNumber' => $protocol['missionNumber']
    ]);
} else {
    logMessage("Failed to save protocol: " . $protocol['missionNumber'], 'ERROR');
    sendResponse(500, ['error' => 'Failed to save protocol']);
}
