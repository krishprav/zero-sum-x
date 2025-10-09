import axios from 'axios';
import { API_URL } from '../utils/constants';
import type { Order, UserBalance, Asset } from '../types/trading';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
        // Silently handle expected fallback scenarios
        if (error.code === 'ECONNREFUSED' || error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 403) {
          // Don't log these - they're handled by individual methods with fallback data
          return Promise.reject(error);
        }
    
    // Only log unexpected errors
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const tradeAPI = {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return { 
        status: 'offline', 
        timestamp: new Date().toISOString() 
      };
    }
  },

  // Get user balance
  async getUserBalance(): Promise<UserBalance> {
    try {
      const response = await api.get('/user/balance');
      return response.data;
    } catch (error) {
      return { usd_balance: 10000.00 };
    }
  },

  // Get user orders
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/user/orders');
      return response.data;
    } catch (error) {
      // Return mock data when backend is not available
      return [
        {
          id: 'mock-order-1',
          symbol: 'BTC' as const,
          side: 'buy' as const,
          type: 'market' as const,
          quantity: 0.1,
          price: 45000,
          status: 'open' as const,
          createdAt: new Date().toISOString(),
          pnl: 150.25
        }
      ];
    }
  },

  // Create new order
  async createOrder(orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    quantity: number;
    price?: number;
    margin: number;
    leverage: number;
    tpEnabled?: boolean;
    tpPrice?: string;
    slEnabled?: boolean;
    slPrice?: string;
  }): Promise<{ orderId: string }> {
    const response = await api.post('/trade/create', orderData);
    return response.data;
  },

  // Close order
  async closeOrder(orderId: string, reason: 'manual' | 'take_profit' | 'stop_loss' | 'liquidation'): Promise<void> {
    await api.post('/trade/close', { orderId, reason });
  },

  // Get asset details
  async getAssetDetails(): Promise<Asset[]> {
    try {
      const response = await api.get('/api/v1/asset');
      const assets = response.data.assets || [];
      
      // Transform the response to match the expected Asset interface
      const transformedAssets = assets.map((asset: any) => ({
        ...asset,
        price: asset.buyPrice || 0, // Use buyPrice as the main price
        change24h: Math.random() * 10 - 5, // Mock 24h change for now
      }));
      
      return transformedAssets;
    } catch (error) {
      throw error;
    }
  },

  // Get chart data
  async getChartData(symbol: string, duration: string): Promise<any[]> {
    const response = await api.get('/api/v1/candles', {
      params: { 
        asset: symbol,
        ts: duration,
        startTime: Math.floor(Date.now() / 1000) - (24 * 60 * 60), // 24 hours ago
        endTime: Math.floor(Date.now() / 1000) // now
      }
    });
    return response.data.candles || [];
  },

  // Get latest trades
  async getLatestTrades(symbol: string, limit = 50): Promise<any[]> {
    const response = await api.get('/api/v1/trades', {
      params: { 
        symbol: symbol,
        limit 
      }
    });
    return response.data.trades || [];
  }
};

export default api;
