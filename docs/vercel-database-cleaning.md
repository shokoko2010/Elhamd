# Vercel Database Cleaning

This document explains the automatic database cleaning feature that runs during Vercel builds.

## Overview

When you build your Next.js application on Vercel, the database is automatically cleaned before the build process starts. This ensures a fresh database state for each deployment.

## How It Works

### 1. Detection
The system detects Vercel builds through environment variables:
- `VERCEL=1` (Vercel environment)
- `VERCEL_ENV=production` (Production deployment)
- `NEXT_BUILD_CLEAN_DB=true` (Manual trigger)

### 2. Process Flow
1. **Build Initiated** → Vercel starts the build process
2. **Environment Check** → Script verifies it's running on Vercel
3. **Database Connection** → Tests database connectivity
4. **Table Discovery** → Identifies all user tables
5. **Data Cleaning** → Removes all data while preserving schema
6. **Optimization** → Resets auto-increment counters and vacuums
7. **Build Continues** → Next.js build proceeds with clean database

### 3. Safety Features
- **Environment Detection**: Only runs on Vercel, never in local development
- **Schema Preservation**: Only removes data, keeps table structure
- **Error Handling**: Continues build even if cleaning fails
- **Detailed Logging**: Comprehensive logs for debugging

## Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "build": "npm run clean-db && next build",
    "clean-db": "tsx scripts/clean-database.ts"
  }
}
```

### Next.js Configuration
The `next.config.ts` includes build hooks that:
- Detect Vercel environment
- Set environment variables
- Log cleaning process

### Vercel Configuration
The application uses Vercel's default Next.js configuration with:
- Environment variables for build control
- Automatic database cleaning on Vercel builds
- No custom `vercel.json` needed (uses defaults)

## Manual Control

### Force Database Cleaning
You can force database cleaning by setting:
```bash
NEXT_BUILD_CLEAN_DB=true npm run build
```

### Skip Database Cleaning
To skip cleaning during a Vercel build:
```bash
VERCEL_CLEAN_DB=false vercel --prod
```

## Database Support

### SQLite (Default)
- Full support with all features
- Foreign key constraint handling
- Auto-increment reset
- Database vacuuming

### PostgreSQL
- Basic support (data cleaning only)
- Ignores SQLite-specific operations
- Preserves schema and constraints

## Logging

The script provides detailed logs:
- 🧹 Start of cleaning process
- 🔌 Database connection status
- 📋 Tables discovered
- 🗑️ Cleaning progress per table
- ✅ Success/failure status
- ⏱️ Total duration
- 📊 Summary statistics

## Error Handling

### Non-Critical Errors
- Table cleaning failures are logged but don't stop the build
- Database optimization errors are handled gracefully
- Connection issues are retried automatically

### Critical Errors
- Database connection failures will stop the process
- Invalid SQL queries will terminate cleaning
- Permission errors will be logged and fail fast

## Security

### Environment Isolation
- Only runs in Vercel environment
- No access to local databases
- Secure database connection handling

### Data Protection
- Only removes data, never schema
- Preserves migration history
- Maintains user permissions structure

## Troubleshooting

### Common Issues

#### 1. "Database cleaning not required"
**Cause**: Not running in Vercel environment
**Solution**: Set `NEXT_BUILD_CLEAN_DB=true` manually

#### 2. "Could not clean table"
**Cause**: Permission issues or table constraints
**Solution**: Check database permissions and foreign keys

#### 3. "Database connection failed"
**Cause**: Invalid database URL or network issues
**Solution**: Verify `DATABASE_URL` environment variable

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=clean-db npm run build
```

## Performance Impact

### Build Time
- Additional 30-60 seconds for large databases
- Minimal impact for small/empty databases
- Runs in parallel with other build steps

### Database Size
- Reduces database size significantly
- Improves post-deployment performance
- Removes stale or corrupted data

## Best Practices

### 1. Regular Deployments
- Clean database ensures fresh state
- Removes accumulated test data
- Prevents data corruption issues

### 2. Monitoring
- Check Vercel build logs for cleaning status
- Monitor build time increases
- Track database size changes

### 3. Backups
- Ensure important data is backed up
- Use staging environment for testing
- Document data restoration procedures

## File Structure

```
project/
├── scripts/
│   └── clean-database.ts    # Main cleaning script
├── docs/
│   └── vercel-database-cleaning.md  # This documentation
├── next.config.ts           # Next.js configuration with build hooks
└── package.json            # Build scripts
```

## Support

For issues or questions about the database cleaning feature:
1. Check Vercel build logs
2. Review this documentation
3. Verify environment variables
4. Test database connectivity manually