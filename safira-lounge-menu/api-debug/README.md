# Safira Lounge API - Debug Version

This is a debug version of the Safira Lounge API designed to investigate database schema issues and troubleshoot the categories functionality.

## Debug Features

### Enhanced Error Reporting
- Detailed error messages with stack traces
- Database connection debugging
- Query execution details
- Column structure analysis

### Debug Endpoints

#### Database Investigation
- `GET /debug` - Overview of database structure
- `GET /debug/tables` - All table structures
- `GET /debug/categories` - Detailed categories table analysis
- `GET /debug/products` - Detailed products table analysis
- `GET /debug/sample-data` - Sample data from all tables
- `GET /debug/test-query` - Test categories query execution

#### Standard Endpoints (with debugging)
- `GET /categories` - List all categories (enhanced with debug info)
- `POST /categories` - Create category (enhanced with debug info)
- `GET /categories/{id}` - Get specific category (enhanced with debug info)
- `PUT /categories/{id}` - Update category (enhanced with debug info)
- `DELETE /categories/{id}` - Delete category (enhanced with debug info)

#### Health Check
- `GET /health` - API health with database info

## Usage

1. **Deploy to server** in a separate directory (e.g., `/api-debug/`)
2. **Test database connection**: `GET /health`
3. **Investigate schema**: `GET /debug/categories`
4. **Test queries**: `GET /debug/test-query`
5. **Sample data**: `GET /debug/sample-data`

## Key Investigation Areas

1. **Column Names**: Check what columns actually exist in the categories table
2. **Data Types**: Verify JSON encoding/decoding of multilingual fields
3. **Query Execution**: Test if the exact API queries work
4. **Sample Data**: See actual data structure and values

## Security Notes

This debug version includes:
- Enhanced error reporting (should be disabled in production)
- Database structure exposure (for debugging only)
- Detailed query information (debugging only)

**Do not use this in production** - it exposes sensitive database information.

## Deployment

Upload the entire `api-debug` folder to your server and access via:
- `http://test.safira-lounge.de/api-debug/debug/categories`
- `http://test.safira-lounge.de/api-debug/health`
- `http://test.safira-lounge.de/api-debug/categories`