#!/bin/bash

# Quick PM2 Fix for Namecheap
# إصلاح سريع لـ PM2 في Namecheap

echo "=== Quick PM2 Fix ==="

# Kill all PM2 processes
pm2 stop all
pm2 delete all
pm2 kill

# Remove lock files
rm -f ~/.pm2/*.lock
rm -f ~/.pm2/dump.pm2

# Kill any remaining Node processes
pkill -f node

# Restart PM2
pm2 resurrect

echo "PM2 has been reset. Try running your application again."