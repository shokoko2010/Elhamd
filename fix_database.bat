@echo off
echo ===========================================
echo Fixing Database Sync Issues...
echo ===========================================
echo.
echo 1. Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo Error generating client. Make sure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Pushing Schema Changes to Database...
echo (This updates the live database with new tables)
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo Error pushing to database.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===========================================
echo SUCCESS! The database is now updated.
echo The 500 error on the live site should be gone.
echo ===========================================
pause
