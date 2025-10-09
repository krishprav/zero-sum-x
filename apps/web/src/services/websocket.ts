import { Signalingmanager } from '../utils/subscription_manager';
import type { Trade, SYMBOL } from '../types/trading';

class WebSocketService {
  private signalingManager = Signalingmanager.getInstance();

  connect() {
    // Connection is handled by the signaling manager singleton
    // This method is kept for backward compatibility
  }

  subscribe(symbol: SYMBOL, callback: (trade: Trade) => void) {
    return this.signalingManager.watch(symbol, callback);
  }

  unsubscribe(symbol: SYMBOL, callback: (trade: Trade) => void) {
    // The signaling manager handles cleanup automatically
    // This method is kept for backward compatibility
  }

  disconnect() {
    this.signalingManager.disconnect();
  }

  isConnected(): boolean {
    return this.signalingManager.isConnected();
  }

  getActiveSubscriptions(): SYMBOL[] {
    return this.signalingManager.getActiveSubscriptions();
  }
}

export const wsService = new WebSocketService();
