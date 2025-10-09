#!/usr/bin/env node

/**
 * Script to translate menu contents to all languages
 */

const translations = {
  // Single Menü translations
  'single_menu': {
    'de': [
      '1x Shisha',
      '1x Cocktail/Mocktail'
    ],
    'en': [
      '1x Hookah',
      '1x Cocktail/Mocktail'
    ],
    'da': [
      '1x Vandpibe',
      '1x Cocktail/Mocktail'
    ],
    'tr': [
      '1x Nargile',
      '1x Kokteyl/Mocktail'
    ]
  },

  // Duo Menü translations (already has structure, just needs values)
  'duo_menu': {
    items: [
      {
        id: 'item_1759399109514',
        de: '2x Shisha',
        en: '2x Hookah',
        da: '2x Vandpibe',
        tr: '2x Nargile'
      },
      {
        id: 'item_1759399120002',
        de: '2x Getränke nach Wahl',
        en: '2x Drinks of your choice',
        da: '2x Drikkevarer efter eget valg',
        tr: '2x İstediğiniz içecekler'
      },
      {
        id: 'item_1759399146164',
        de: 'Nachos oder Snack Box',
        en: 'Nachos or Snack Box',
        da: 'Nachos eller Snack Box',
        tr: 'Nachos veya Atıştırmalık Kutusu'
      }
    ]
  },

  // Party Menü translations
  'party_menu': {
    'de': [
      '2x Shisha',
      '1x Flasche (Vodka, Jack Daniels, Gin)',
      '1x Nachos oder Snack Box'
    ],
    'en': [
      '2x Hookah',
      '1x Bottle (Vodka, Jack Daniels, Gin)',
      '1x Nachos or Snack Box'
    ],
    'da': [
      '2x Vandpibe',
      '1x Flaske (Vodka, Jack Daniels, Gin)',
      '1x Nachos eller Snack Box'
    ],
    'tr': [
      '2x Nargile',
      '1x Şişe (Vodka, Jack Daniels, Gin)',
      '1x Nachos veya Atıştırmalık Kutusu'
    ]
  }
};

// Generate JSON for Duo Menü (already has correct structure)
const duoMenuJson = translations.duo_menu.items.map(item => ({
  id: item.id,
  description_de: item.de,
  description_en: item.en,
  description_da: item.da,
  description_tr: item.tr
}));

console.log('\n=== TRANSLATION DATA FOR MENU CONTENTS ===\n');

console.log('Single Menü (ID: 174):');
console.log('German:', translations.single_menu.de.join('\n'));
console.log('\nEnglish:', translations.single_menu.en.join('\n'));
console.log('\nDanish:', translations.single_menu.da.join('\n'));
console.log('\nTurkish:', translations.single_menu.tr.join('\n'));

console.log('\n\n---\n\nDuo Menü (ID: 167) - Already JSON format:');
console.log(JSON.stringify(duoMenuJson, null, 2));

console.log('\n\n---\n\nParty Menü (ID: 175):');
console.log('German:', translations.party_menu.de.join('\n'));
console.log('\nEnglish:', translations.party_menu.en.join('\n'));
console.log('\nDanish:', translations.party_menu.da.join('\n'));
console.log('\nTurkish:', translations.party_menu.tr.join('\n'));

console.log('\n\n=== SQL UPDATE STATEMENTS ===\n');

// For Single Menü - convert to JSON format like Duo
const singleMenuJson = translations.single_menu.de.map((_, index) => ({
  id: `item_${Date.now() + index}`,
  description_de: translations.single_menu.de[index],
  description_en: translations.single_menu.en[index],
  description_da: translations.single_menu.da[index],
  description_tr: translations.single_menu.tr[index]
}));

// For Party Menü - convert to JSON format
const partyMenuJson = translations.party_menu.de.map((_, index) => ({
  id: `item_${Date.now() + 1000 + index}`,
  description_de: translations.party_menu.de[index],
  description_en: translations.party_menu.en[index],
  description_da: translations.party_menu.da[index],
  description_tr: translations.party_menu.tr[index]
}));

console.log(`UPDATE products SET package_items = '${JSON.stringify(singleMenuJson)}' WHERE id = 174;`);
console.log(`\nUPDATE products SET package_items = '${JSON.stringify(duoMenuJson)}' WHERE id = 167;`);
console.log(`\nUPDATE products SET package_items = '${JSON.stringify(partyMenuJson)}' WHERE id = 175;`);

console.log('\n\n✅ Translation data generated successfully!\n');
