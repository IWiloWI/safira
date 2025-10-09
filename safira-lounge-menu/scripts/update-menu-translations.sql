-- Update menu contents with multilingual translations
-- Run this SQL in your database

-- Single Menü (ID: 174)
UPDATE products SET package_items = '[{"id":"item_1760046055387","description_de":"1x Shisha","description_en":"1x Hookah","description_da":"1x Vandpibe","description_tr":"1x Nargile"},{"id":"item_1760046055388","description_de":"1x Cocktail/Mocktail","description_en":"1x Cocktail/Mocktail","description_da":"1x Cocktail/Mocktail","description_tr":"1x Kokteyl/Mocktail"}]' WHERE id = 174;

-- Duo Menü (ID: 167)
UPDATE products SET package_items = '[{"id":"item_1759399109514","description_de":"2x Shisha","description_en":"2x Hookah","description_da":"2x Vandpibe","description_tr":"2x Nargile"},{"id":"item_1759399120002","description_de":"2x Getränke nach Wahl","description_en":"2x Drinks of your choice","description_da":"2x Drikkevarer efter eget valg","description_tr":"2x İstediğiniz içecekler"},{"id":"item_1759399146164","description_de":"Nachos oder Snack Box","description_en":"Nachos or Snack Box","description_da":"Nachos eller Snack Box","description_tr":"Nachos veya Atıştırmalık Kutusu"}]' WHERE id = 167;

-- Party Menü (ID: 175)
UPDATE products SET package_items = '[{"id":"item_1760046056387","description_de":"2x Shisha","description_en":"2x Hookah","description_da":"2x Vandpibe","description_tr":"2x Nargile"},{"id":"item_1760046056388","description_de":"1x Flasche (Vodka, Jack Daniels, Gin)","description_en":"1x Bottle (Vodka, Jack Daniels, Gin)","description_da":"1x Flaske (Vodka, Jack Daniels, Gin)","description_tr":"1x Şişe (Vodka, Jack Daniels, Gin)"},{"id":"item_1760046056389","description_de":"1x Nachos oder Snack Box","description_en":"1x Nachos or Snack Box","description_da":"1x Nachos eller Snack Box","description_tr":"1x Nachos veya Atıştırmalık Kutusu"}]' WHERE id = 175;
