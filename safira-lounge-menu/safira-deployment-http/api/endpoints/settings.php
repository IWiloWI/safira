<?php
/**
 * Settings API Endpoint
 * Handles application settings
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getSettings($dbh);
        break;

    case 'PUT':
        updateSettings($dbh);
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get application settings
 */
function getSettings($dbh) {
    try {
        // Try to get settings from database
        $query = "SELECT * FROM settings LIMIT 1";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $settings = $stmt->fetch();

        if ($settings) {
            $result = [
                'restaurantName' => json_decode($settings['restaurant_name'] ?? '{}'),
                'address' => json_decode($settings['address'] ?? '{}'),
                'phone' => $settings['phone'] ?? '',
                'email' => $settings['email'] ?? '',
                'openingHours' => json_decode($settings['opening_hours'] ?? '{}'),
                'socialMedia' => json_decode($settings['social_media'] ?? '{}'),
                'theme' => json_decode($settings['theme'] ?? '{}'),
                'language' => $settings['language'] ?? 'de'
            ];
        } else {
            // Default settings if none exist
            $result = [
                'restaurantName' => [
                    'de' => 'Safira Lounge',
                    'en' => 'Safira Lounge',
                    'da' => 'Safira Lounge'
                ],
                'address' => [
                    'de' => 'Flensburg, Deutschland',
                    'en' => 'Flensburg, Germany',
                    'da' => 'Flensborg, Tyskland'
                ],
                'phone' => '+49 461 123456',
                'email' => 'info@safira-lounge.de',
                'openingHours' => [
                    'monday' => '18:00-02:00',
                    'tuesday' => '18:00-02:00',
                    'wednesday' => '18:00-02:00',
                    'thursday' => '18:00-02:00',
                    'friday' => '18:00-03:00',
                    'saturday' => '18:00-03:00',
                    'sunday' => '18:00-02:00'
                ],
                'socialMedia' => [
                    'instagram' => '@safira_lounge',
                    'facebook' => 'SafiraLounge',
                    'website' => 'https://safira-lounge.de'
                ],
                'theme' => [
                    'primaryColor' => '#FF41FB',
                    'secondaryColor' => '#000000',
                    'backgroundVideo' => true
                ],
                'language' => 'de'
            ];
        }

        sendJson($result);

    } catch (PDOException $e) {
        error_log("Database error in getSettings: " . $e->getMessage());
        sendError('Failed to fetch settings', 500);
    }
}

/**
 * Update application settings
 */
function updateSettings($dbh) {
    // Check authentication
    require_once 'auth.php';
    requireAuth();

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    try {
        // Check if settings exist
        $checkQuery = "SELECT id FROM settings LIMIT 1";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute();
        $exists = $stmt->fetch();

        if ($exists) {
            // Update existing settings
            $query = "UPDATE settings SET
                      restaurant_name = COALESCE(?, restaurant_name),
                      address = COALESCE(?, address),
                      phone = COALESCE(?, phone),
                      email = COALESCE(?, email),
                      opening_hours = COALESCE(?, opening_hours),
                      social_media = COALESCE(?, social_media),
                      theme = COALESCE(?, theme),
                      language = COALESCE(?, language),
                      updated_at = NOW()
                      WHERE id = ?";

            $stmt = $dbh->prepare($query);
            $stmt->execute([
                isset($input['restaurantName']) ? json_encode($input['restaurantName']) : null,
                isset($input['address']) ? json_encode($input['address']) : null,
                $input['phone'] ?? null,
                $input['email'] ?? null,
                isset($input['openingHours']) ? json_encode($input['openingHours']) : null,
                isset($input['socialMedia']) ? json_encode($input['socialMedia']) : null,
                isset($input['theme']) ? json_encode($input['theme']) : null,
                $input['language'] ?? null,
                $exists['id']
            ]);
        } else {
            // Insert new settings
            $query = "INSERT INTO settings (
                        restaurant_name, address, phone, email,
                        opening_hours, social_media, theme, language,
                        created_at, updated_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            $stmt = $dbh->prepare($query);
            $stmt->execute([
                json_encode($input['restaurantName'] ?? []),
                json_encode($input['address'] ?? []),
                $input['phone'] ?? '',
                $input['email'] ?? '',
                json_encode($input['openingHours'] ?? []),
                json_encode($input['socialMedia'] ?? []),
                json_encode($input['theme'] ?? []),
                $input['language'] ?? 'de'
            ]);
        }

        sendJson(['message' => 'Settings updated successfully']);

    } catch (PDOException $e) {
        error_log("Database error in updateSettings: " . $e->getMessage());
        sendError('Failed to update settings', 500);
    }
}
?>