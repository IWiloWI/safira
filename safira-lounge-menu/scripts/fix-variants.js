#!/usr/bin/env node

/**
 * Script to fix existing products with variants
 * This calls the API endpoint to update products that have variants
 */

const { exec } = require('child_process');
const path = require('path');

// Function to execute the PHP script directly
function fixVariants() {
    console.log('🔧 Fixing existing products with variants...');

    // Execute the fix_variants endpoint using curl
    const apiUrl = 'http://localhost/safira-api-fixed.php?action=fix_variants';
    const command = `curl -X POST "${apiUrl}" -H "Content-Type: application/json"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error executing API call:', error);
            console.log('🔄 Trying alternative approach...');

            // Try alternative URL
            const altApiUrl = 'http://test.safira-lounge.de/safira-api-fixed.php?action=fix_variants';
            const altCommand = `curl -X POST "${altApiUrl}" -H "Content-Type: application/json"`;

            exec(altCommand, (altError, altStdout, altStderr) => {
                if (altError) {
                    console.error('❌ Alternative approach also failed:', altError);
                    console.log('📋 Please run the SQL script manually:');
                    console.log('   MySQL> SOURCE /Users/umitgencay/Safira/safira-lounge-menu/database/fix_existing_variants.sql');
                    return;
                }

                console.log('✅ API Response (alternative):', altStdout);
                if (altStderr) console.error('⚠️  Stderr:', altStderr);
            });
            return;
        }

        console.log('✅ API Response:', stdout);
        if (stderr) console.error('⚠️  Stderr:', stderr);
    });
}

// Run the fix
fixVariants();