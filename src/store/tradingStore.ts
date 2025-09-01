import { create } from 'zustand';
import { Asset, Candle, Trade, TimeFrameOption } from '../types/trading';

interface TradingStore {
  // Selected asset and trading parameters
  selectedAsset: string;
  leverage: number;
  positionType: 'buy' | 'sell';
  margin: string;
  timeFrame: TimeFrameOption;
  
  // Market data
  assets: Asset[];
  currentCandles: Candle[];
  userBalance: number;
  
  // Trading state
  openTrades: Trade[];
  closedTrades: Trade[];
  
  // Actions
  setSelectedAsset: (asset: string) => void;
  setLeverage: (leverage: number) => void;
  setPositionType: (type: 'buy' | 'sell') => void;
  setMargin: (margin: string) => void;
  setTimeFrame: (timeFrame: TimeFrameOption) => void;
  setAssets: (assets: Asset[]) => void;
  setCurrentCandles: (candles: Candle[]) => void;
  setUserBalance: (balance: number) => void;
  setOpenTrades: (trades: Trade[]) => void;
  setClosedTrades: (trades: Trade[]) => void;
  addOpenTrade: (trade: Trade) => void;
  closeTrade: (orderId: string, closePrice: number, pnl: number) => void;
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  // Initial state
  selectedAsset: 'BTC',
  leverage: 1,
  positionType: 'buy',
  margin: '0',
  timeFrame: { value: '1m', label: '1M' },
  
  assets: [],
  currentCandles: [],
  userBalance: 500000, // $5000.00 with 2 decimals
  
  openTrades: [],
  closedTrades: [],
  
  // Actions
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setLeverage: (leverage) => set({ leverage }),
  setPositionType: (type) => set({ positionType: type }),
  setMargin: (margin) => set({ margin }),
  setTimeFrame: (timeFrame) => set({ timeFrame }),
  setAssets: (assets) => set({ assets }),
  setCurrentCandles: (candles) => set({ currentCandles: candles }),
  setUserBalance: (balance) => set({ userBalance: balance }),
  setOpenTrades: (trades) => set({ openTrades: trades }),
  setClosedTrades: (trades) => set({ closedTrades: trades }),
  
  addOpenTrade: (trade) => {
    const { openTrades } = get();
    set({ openTrades: [...openTrades, trade] });
  },
  
  closeTrade: (orderId, closePrice, pnl) => {
    const { openTrades, closedTrades } = get();
    const tradeIndex = openTrades.findIndex(t => t.orderId === orderId);
    
    if (tradeIndex !== -1) {
      const trade = openTrades[tradeIndex];
      const closedTrade: Trade = {
        ...trade,
        status: 'closed',
        closePrice,
        pnl
      };
      
      const newOpenTrades = openTrades.filter(t => t.orderId !== orderId);
      set({ 
        openTrades: newOpenTrades,
        closedTrades: [...closedTrades, closedTrade]
      });
    }
  }
}));
