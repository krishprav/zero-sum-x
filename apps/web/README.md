# Zero Sum X Trading Platform

A modern trading platform built with Next.js, featuring real-time price updates, interactive charts, and comprehensive trading functionality.

## Features

- **Real-time Trading**: Live price updates via WebSocket connection
- **Interactive Charts**: Candlestick charts with multiple timeframes
- **Order Management**: Buy/sell orders with market and limit types
- **Risk Management**: Take profit and stop loss functionality
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: Secure login system with protected routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Running backend services (price_poller, ws, server)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Update the environment variables in `.env.local`:
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

- Email: `demo@example.com`
- Password: `password`

## Architecture

### Components

- **Chart**: Interactive candlestick charts using lightweight-charts
- **BuySell**: Trading panel for placing orders
- **Orders**: Order management and history
- **PriceDisplay**: Real-time price information
- **ProtectedRoute**: Authentication wrapper

### Services

- **WebSocket Service**: Real-time price updates
- **API Service**: Trading operations and data fetching
- **Auth Context**: Authentication state management

### Key Features

1. **Real-time Price Updates**: WebSocket connection to receive live market data
2. **Order Placement**: Support for market and limit orders with leverage
3. **Risk Management**: Take profit and stop loss orders
4. **Responsive Design**: Optimized for desktop and mobile devices
5. **Authentication**: Secure login with protected routes

## API Integration

The frontend integrates with the following backend services:

- **WebSocket Service** (`ws://localhost:8080`): Real-time price updates
- **REST API** (`http://localhost:3001`): Trading operations and data

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Chart.tsx       # Trading chart
│   ├── BuySell.tsx    # Order placement
│   ├── Orders.tsx     # Order management
│   └── PriceDisplay.tsx # Price information
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication
├── services/           # External services
│   ├── api.ts         # REST API client
│   └── websocket.ts   # WebSocket client
├── types/              # TypeScript types
│   └── trading.ts     # Trading interfaces
└── utils/              # Utility functions
    ├── constants.ts   # App constants
    └── utils.ts       # Helper functions
```

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel**: Recommended for easy deployment
- **Netlify**: Alternative platform
- **Docker**: Containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.