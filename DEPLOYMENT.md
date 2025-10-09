# 🚀 Zero Sum X - Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose
- Git
- Node.js 18+ (for development)
- pnpm (recommended package manager)

## 🏃‍♂️ Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd zero_sum_x

# Copy environment variables
cp env.example .env
# Edit .env with your actual values
```

### 2. Development Mode
```bash
# Start all services
docker-compose up -d redis timescale

# Wait for services to be healthy
docker-compose ps

# Start development servers
pnpm install
pnpm run dev
```

### 3. Production Deployment
```bash
# Start production stack
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:8080
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_USER=trading_user
DB_PASSWORD=secure_password
DB_NAME=trades_db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key

# API
NEXT_PUBLIC_API_URL=http://localhost:5000
PORT=5000

# Trading
SYMBOLS=BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT
```

## 📊 Performance Optimizations

### Database Setup
```bash
# Run database optimizations
docker exec timescale-production psql -U trading_user -d trades_db -f /docker-entrypoint-initdb.d/optimizations.sql
```

### Monitoring Setup
- Prometheus metrics: `/metrics` endpoints
- Grafana dashboards: Pre-configured for trading metrics
- Health checks: `/health` endpoints

## 🔒 Security Considerations

- Change default passwords
- Use strong JWT secrets
- Configure SSL certificates for production
- Set up proper firewall rules
- Enable rate limiting

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 5000, 8080 are available
2. **Database connection**: Verify DATABASE_URL in .env
3. **Redis connection**: Check REDIS_URL configuration
4. **Memory issues**: Increase Docker memory limits

### Logs
```bash
# View logs
docker-compose logs -f [service-name]

# Check service health
docker-compose ps
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (Nginx included)
- Scale backend services: `docker-compose up -d --scale backend=3`
- Redis clustering (configured in production)

### Vertical Scaling
- Increase Docker memory limits
- Optimize database connection pools
- Tune TimescaleDB parameters

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```
