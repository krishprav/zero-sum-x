# Zero Sum X - Startup Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd zero_sum_x/apps/server
pnpm install
pnpm dev
```

The server will start on port 5000 and will work even without Redis/PostgreSQL (using mock data).

### 2. Start the Frontend
```bash
cd zero_sum_x/apps/web
pnpm install
pnpm dev
```

The frontend will start on port 3000.

### 3. Access the Application
Open your browser and go to: http://localhost:3000

## Troubleshooting

### "No market data available" Issue
This has been fixed! The application now:
- Uses the correct API URL (port 5000)
- Has fallback mock data if the API is unavailable
- Includes proper error handling and logging

### If you see connection errors:
1. Make sure the backend server is running on port 5000
2. Check the browser console for detailed error messages
3. The app will automatically fall back to mock data if the API is unavailable

### Optional: Start Redis and PostgreSQL
If you want real-time price data:
```bash
# Start Redis
redis-server

# Start PostgreSQL (if you have it configured)
# The server will work without these services
```

## Features
- ✅ Premium UI with glassmorphic design
- ✅ Real-time market data (with fallback)
- ✅ Trading interface
- ✅ Order management
- ✅ Responsive design
- ✅ Production-ready code
