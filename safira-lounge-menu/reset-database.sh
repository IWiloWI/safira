#!/bin/bash

echo "==================================="
echo "SAFIRA DATABASE RESET"
echo "==================================="
echo ""
echo "This script will:"
echo "1. Upload database reset script to server"
echo "2. Execute it to reset the database"
echo "3. Upload the updated API"
echo ""

# Execute database reset remotely
echo "Executing database reset on server..."
curl -X GET "http://test.safira-lounge.de/database-reset.php"

echo ""
echo "Database reset complete!"
echo ""
echo "Please manually upload these files to the server:"
echo "1. database-reset.php -> http://test.safira-lounge.de/database-reset.php"
echo "2. safira-api-fixed.php -> http://test.safira-lounge.de/safira-api-fixed.php"