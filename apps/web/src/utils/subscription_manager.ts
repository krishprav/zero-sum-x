import { WS_URL } from './constants';
import type { Trade, SYMBOL } from '../types/trading';

type SubscriptionCallback = (trade: Trade) => void;

class SignalingManager {
  private static instance: SignalingManager;
  private ws: WebSocket | null = null;
  private subscribers: Map<SYMBOL, Set<SubscriptionCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  private constructor() {
    this.connect();
  }

  public static getInstance(): SignalingManager {
    if (!SignalingManager.instance) {
      SignalingManager.instance = new SignalingManager();
    }
    return SignalingManager.instance;
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        // Resubscribe to all active subscriptions
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.symbol && data.bidPrice && data.askPrice) {
            const trade: Trade = {
              symbol: data.symbol,
              bidPrice: data.bidPrice,
              askPrice: data.askPrice,
              time: data.time || Date.now()
            };
            this.notifySubscribers(trade);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private resubscribeAll() {
    for (const symbol of this.subscribers.keys()) {
      this.subscribeToSymbol(symbol);
    }
  }

  private subscribeToSymbol(symbol: SYMBOL) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        symbol: symbol
      }));
    }
  }

  private unsubscribeFromSymbol(symbol: SYMBOL) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "UNSUBSCRIBE",
        symbol: symbol
      }));
    }
  }

  private notifySubscribers(trade: Trade) {
    const symbolSubscribers = this.subscribers.get(trade.symbol as SYMBOL);
    if (symbolSubscribers) {
      symbolSubscribers.forEach(callback => {
        try {
          callback(trade);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }

  public watch(symbol: SYMBOL, callback: SubscriptionCallback): () => void {
    // Add callback to subscribers
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    // Subscribe to WebSocket channel if this is the first subscriber
    if (this.subscribers.get(symbol)!.size === 1) {
      this.subscribeToSymbol(symbol);
    }

    // Return unsubscribe function
    return () => {
      const symbolSubscribers = this.subscribers.get(symbol);
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback);

        // Unsubscribe from WebSocket channel if no more subscribers
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol);
          this.unsubscribeFromSymbol(symbol);
        }
      }
    };
  }

  public getActiveSubscriptions(): SYMBOL[] {
    return Array.from(this.subscribers.keys());
  }

  public getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.reconnectAttempts = 0;
  }
}

export const Signalingmanager = SignalingManager;
