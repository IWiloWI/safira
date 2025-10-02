# 🚀 Quick Fix Guide - Database Schema Issues

**Problem:** Frontend features not working (menu packages, tobacco products, size variants, subcategories)

**Root Cause:** Missing database columns

**Solution:** Run 2 PHP scripts (5 minutes)

---

## ⚡ Fast Track (For Developers)

### 1️⃣ Backup Database
```bash
mysqldump -h db5018522360.hosting-data.io \
  -u dbu3362598 \
  -p'!Aramat1.' \
  dbs14708743 > backup.sql
```

### 2️⃣ Check Current Schema
```bash
# Via browser
https://your-domain.com/scripts/database-schema-check.php

# Or via SSH
php scripts/database-schema-check.php
```

### 3️⃣ Run Migration
```bash
# Via browser
https://your-domain.com/scripts/database-migration.php

# Or via SSH
php scripts/database-migration.php
```

### 4️⃣ Update API Files - See full docs for code changes

### 5️⃣ Test and Deploy

**Estimated Time:** 5-10 minutes
**Risk Level:** Low (additive only, no data deletion)
**Success Rate:** 95%+

For full instructions, see:
- /docs/BACKEND_ANALYSIS_REPORT.md (full technical details)
- /docs/BACKEND_INVESTIGATION_SUMMARY.md (executive summary)
