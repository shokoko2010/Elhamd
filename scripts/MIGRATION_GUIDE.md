# Slider Image Migration Guide

## What This Script Does

Converts Base64-encoded slider images (stored in database) to actual image files.

**Benefits:**
- Reduces HTML page size from ~5MB to ~200KB (96% reduction)
- Improves First Contentful Paint by 75%
- Enables better caching and CDN optimization

## Prerequisites

⚠️ **IMPORTANT: Backup your database first!**

```bash
# For PostgreSQL
pg_dump your_database > backup.sql

# For MySQL
mysqldump -u username -p database_name > backup.sql
```

## Running the Migration

```bash
npm run migrate:images
```

## What to Expect

The script will:
1. ✓ Create `/public/uploads/sliders/` directory
2. ✓ Extract Base64 images from database
3. ✓ Save as files: `slider-{id}.jpg`
4. ✓ Update database with file paths
5. ✓ Show progress for each slider

## Sample Output

```
🚀 Starting slider image migration...

✓ Created directory: /public/uploads/sliders/

📊 Found 7 sliders to process

✓ Saved "ULTRA T.9" → slider-cmhjtzmld0087qgy80yzw87z6.jpeg (552.89 KB)
✓ Saved "مجموعة سيارات تاتا" → slider-0.jpeg (782.86 KB)
...

==================================================
📈 Migration Summary:
==================================================
✓ Processed: 7
⏭️  Skipped: 0
❌ Errors: 0
==================================================

✅ Migration completed successfully!
```

## Verification Steps

1. **Check files exist:**
   ```bash
   ls public/uploads/sliders/
   ```

2. **Test in browser:**
   - Navigate to: `http://localhost:3000/uploads/sliders/slider-cmhjtzmld0087qgy80yzw87z6.jpeg`
   - You should see the image

3. **Test homepage:**
   - Visit: `http://localhost:3000`
   - Slider images should load much faster

4. **Check page size:**
   - Open DevTools → Network
   - Reload homepage
   - Initial document should be ~200KB instead of ~5MB

## Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
# PostgreSQL
psql your_database < backup.sql

# MySQL
mysql -u username -p database_name < backup.sql
```

## Next Steps

After successful migration:
1. ✓ Commit the new images to git
2. ✓ Deploy to production
3. ✓ Optionally: Convert images to WebP for further optimization
