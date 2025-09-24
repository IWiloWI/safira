<?php
/**
 * MINIMALER ZUSATZ FÜR SAFIRA-API-FIXED.PHP
 * Füge diesen Code in die switch-Anweisung NACH dem 'delete_product' case hinzu:
 */

case 'create_product':
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['name']) || !isset($input['price'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and price are required']);
            break;
        }

        // Extract multilingual fields
        $name_de = is_array($input['name']) ? ($input['name']['de'] ?? '') : $input['name'];
        $name_en = is_array($input['name']) ? ($input['name']['en'] ?? $name_de) : $name_de;
        $name_tr = is_array($input['name']) ? ($input['name']['tr'] ?? $name_de) : $name_de;
        $name_da = is_array($input['name']) ? ($input['name']['da'] ?? $name_de) : $name_de;

        $desc_de = '';
        $desc_en = '';
        $desc_tr = '';
        $desc_da = '';

        if (isset($input['description']) && is_array($input['description'])) {
            $desc_de = $input['description']['de'] ?? '';
            $desc_en = $input['description']['en'] ?? '';
            $desc_tr = $input['description']['tr'] ?? '';
            $desc_da = $input['description']['da'] ?? '';
        }

        $category_id = $input['category_id'] ?? null;
        $subcategory_id = $input['subcategory_id'] ?? null;
        $price = (float)($input['price'] ?? 0);
        $image_url = $input['image'] ?? $input['imageUrl'] ?? '';
        $available = isset($input['available']) ? (bool)$input['available'] : true;

        // Handle badges
        $badge_new = false;
        $badge_popular = false;
        $badge_limited = false;

        if (isset($input['badges']) && is_array($input['badges'])) {
            $badge_new = (bool)($input['badges']['neu'] ?? false);
            $badge_popular = (bool)($input['badges']['beliebt'] ?? false);
            $badge_limited = (bool)($input['badges']['kurze_zeit'] ?? false);
        }

        $stmt = $dbh->prepare("
            INSERT INTO products (
                category_id, subcategory_id,
                name_de, name_en, name_tr, name_da,
                description_de, description_en, description_tr, description_da,
                price, image_url, available,
                badge_new, badge_popular, badge_limited,
                sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 999)
        ");

        $stmt->execute([
            $category_id, $subcategory_id,
            $name_de, $name_en, $name_tr, $name_da,
            $desc_de, $desc_en, $desc_tr, $desc_da,
            $price, $image_url, $available ? 1 : 0,
            $badge_new ? 1 : 0, $badge_popular ? 1 : 0, $badge_limited ? 1 : 0
        ]);

        $product_id = $dbh->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => [
                'id' => (string)$product_id,
                'name' => [
                    'de' => $name_de,
                    'en' => $name_en,
                    'tr' => $name_tr,
                    'da' => $name_da
                ],
                'description' => [
                    'de' => $desc_de,
                    'en' => $desc_en,
                    'tr' => $desc_tr,
                    'da' => $desc_da
                ],
                'price' => $price,
                'image' => $image_url,
                'available' => $available,
                'badges' => [
                    'neu' => $badge_new,
                    'beliebt' => $badge_popular,
                    'kurze_zeit' => $badge_limited
                ]
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
    }
    break;

// ZUSÄTZLICH: Aktualisiere die available_actions Liste (Zeile 576):
// 'available_actions' => ['test', 'login', 'products', 'subcategories', 'create_subcategory', 'delete_category', 'delete_product', 'update_subcategory', 'create_product', 'settings', 'health']
?>