# Debug API Investigation Plan

## Overview
Created a debug version of the Safira Lounge PHP API to investigate database schema issues causing category creation failures.

## Debug API Features

### Enhanced Error Reporting
- Detailed PDO exception messages
- Query execution logging
- Memory usage tracking
- Column structure analysis

### Debug Endpoints Created

#### 1. Database Investigation (`/debug`)
- **`/debug`** - Database overview and table list
- **`/debug/tables`** - Complete structure of all tables
- **`/debug/categories`** - Detailed categories table analysis
- **`/debug/products`** - Products table structure
- **`/debug/sample-data`** - Sample data from all tables
- **`/debug/test-query`** - Test the exact categories query

#### 2. Enhanced Standard Endpoints
- **`/categories`** - Categories API with debug information
- **`/health`** - Health check with database info

### Key Investigation Areas

1. **Column Name Verification**
   - Check if `name`, `description`, `icon`, `id` columns exist
   - Verify actual column names vs. expected names

2. **Data Type Analysis**
   - Confirm JSON fields are stored as TEXT/JSON
   - Check character encoding (utf8mb4)

3. **Query Execution Testing**
   - Test exact INSERT statements
   - Verify parameter binding
   - Check for constraint violations

4. **Sample Data Structure**
   - See actual data format in database
   - Compare with API expectations

## Deployment Process

### 1. Deploy Debug API
```bash
./deploy-debug-api.sh
```

### 2. Test All Endpoints
```bash
./test-debug-api.sh
```

### 3. Manual Investigation
Access these URLs for detailed analysis:
- `http://test.safira-lounge.de/api-debug/debug/categories`
- `http://test.safira-lounge.de/api-debug/debug/test-query`
- `http://test.safira-lounge.de/api-debug/categories`

## Expected Findings

### Possible Schema Issues
1. **Column Name Mismatch**
   - Database might have different column names
   - Case sensitivity issues (MySQL is case-insensitive, but check)

2. **Data Type Problems**
   - JSON fields might be different type
   - Character encoding issues

3. **Constraint Violations**
   - Primary key conflicts
   - Foreign key constraints
   - NOT NULL constraints

4. **Table Structure Differences**
   - Missing columns
   - Different table name
   - Wrong database/schema

## Debug Information Provided

### Categories Table Analysis
- Column names and types
- Sample data (first 3 records)
- Table constraints
- Index information

### Query Testing
- Execute exact API queries
- Show parameter binding
- Display raw results
- Test JSON encoding/decoding

### Enhanced Category Creation
- Show input validation
- Display table structure before insert
- Verify inserted record
- Provide detailed error information

## Files Created

### Core Debug API
- `/api-debug/config.php` - Enhanced database configuration
- `/api-debug/index.php` - Router with debug endpoints
- `/api-debug/endpoints/debug.php` - Database investigation endpoints
- `/api-debug/endpoints/categories.php` - Enhanced categories API
- `/api-debug/.htaccess` - Apache configuration

### Deployment & Testing
- `deploy-debug-api.sh` - Automated deployment script
- `test-debug-api.sh` - Comprehensive endpoint testing
- `debug-investigation-plan.md` - This investigation guide

## Next Steps

1. **Deploy the debug API**
2. **Run comprehensive tests**
3. **Analyze JSON responses** for schema information
4. **Compare with working API** structure
5. **Identify specific schema mismatch**
6. **Create targeted fix** based on findings
7. **Remove debug API** after investigation

## Security Notes

⚠️ **Important**: This debug API exposes database structure and should be:
- Used only for investigation
- Removed after debugging
- Never deployed to production
- Accessed only by developers

The debug API includes enhanced error reporting and database structure exposure specifically for troubleshooting purposes.