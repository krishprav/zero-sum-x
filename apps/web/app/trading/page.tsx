'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Chart from '../../src/components/Chart';
import BuySell from '../../src/components/BuySell';
import Orders from '../../src/components/Orders';
import MarketOverview from '../../src/components/MarketOverview';
import TradingDashboard from '../../src/components/TradingDashboard';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import AIAssistantButton from '../../src/components/AIAssistantButton';
import AIDemo from '../../src/components/AIDemo';
import { useAuth } from '../../src/contexts/AuthContext';
import { Trade, Order, SYMBOL } from '../../src/types/trading';
import { tradeAPI } from '../../src/services/api';
import { wsService } from '../../src/services/websocket';
import { PADDING } from '../../src/utils/constants';

function TradingPageContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get('symbol') as SYMBOL || 'BTC';
  const { user, logout } = useAuth();

  const [selectedSymbol, setSelectedSymbol] = useState<SYMBOL>(symbolParam);
  const [currentPrice, setCurrentPrice] = useState<Trade | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [userPositions, setUserPositions] = useState<Array<{
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    currentPnL: number;
  }>>([]);
  const [showAIDemo, setShowAIDemo] = useState(false);

  useEffect(() => {
    // Subscribe to price updates using the new subscription manager
    const handlePriceUpdate = (trade: Trade) => {
      if (trade.symbol === selectedSymbol) {
        setCurrentPrice(trade);
      }
    };

    const unsubscribe = wsService.subscribe(selectedSymbol, handlePriceUpdate);

    // Fetch initial data
    fetchInitialData();

    return () => {
      unsubscribe();
    };
  }, [selectedSymbol, selectedTimeframe]);

  const generateMockChartData = (symbol: string, timeframe: string) => {
    const now = Math.floor(Date.now() / 1000);
    const interval = timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : timeframe === '15m' ? 900 : timeframe === '1h' ? 3600 : timeframe === '4h' ? 14400 : 86400;
    const data = [];
    
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3000 : symbol === 'SOL' ? 240 : symbol === 'DOGE' ? 0.08 : symbol === 'USDC' ? 1 : 240;
    let currentPrice = basePrice;
    
    // Generate continuous data points with proper time intervals
    for (let i = 100; i >= 0; i--) {
      const time = now - (i * interval);
      
      // Create more realistic price movements with trend continuity
      const trend = (Math.random() - 0.5) * 0.008; // ±0.4% trend
      const volatility = (Math.random() - 0.5) * 0.004; // ±0.2% volatility
      const priceChange = currentPrice * (trend + volatility);
      
      const open = currentPrice;
      const close = currentPrice + priceChange;
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      
      data.push({
        time,
        open: Math.round(open * 10000), // Convert to internal price format
        high: Math.round(high * 10000),
        low: Math.round(low * 10000),
        close: Math.round(close * 10000),
        volume: Math.floor(Math.random() * 1000000)
      });
      
      // Update current price for next iteration (close becomes next open)
      currentPrice = close;
    }
    
    return data;
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      // Try to fetch real chart data first
      try {
        const chartData = await tradeAPI.getChartData(selectedSymbol, selectedTimeframe);
        if (chartData && chartData.length > 0) {
          setChartData(chartData);
        } else {
          throw new Error('No data from API');
        }
      } catch (apiError) {
        const mockData = generateMockChartData(selectedSymbol, selectedTimeframe);
        setChartData(mockData);
      }

      // Try to get latest trades for current price
      try {
        const latestTrades = await tradeAPI.getLatestTrades(selectedSymbol, 1);
        if (latestTrades.length > 0) {
          const latestTrade = latestTrades[0];
          setCurrentPrice({
            symbol: selectedSymbol,
            bidPrice: latestTrade.bidPrice,
            askPrice: latestTrade.askPrice,
            time: latestTrade.timestamp,
          });
        } else {
          const basePrice = selectedSymbol === 'BTC' ? 45000 : selectedSymbol === 'ETH' ? 3000 : selectedSymbol === 'SOL' ? 240 : selectedSymbol === 'DOGE' ? 0.08 : selectedSymbol === 'USDC' ? 1 : 240;
          setCurrentPrice({
            symbol: selectedSymbol,
            bidPrice: Math.round(basePrice * 0.999 * 10000),
            askPrice: Math.round(basePrice * 1.001 * 10000),
            time: Date.now(),
          });
        }
      } catch (priceError) {
        const basePrice = selectedSymbol === 'BTC' ? 45000 : selectedSymbol === 'ETH' ? 3000 : selectedSymbol === 'SOL' ? 240 : selectedSymbol === 'DOGE' ? 0.08 : selectedSymbol === 'USDC' ? 1 : 240;
        setCurrentPrice({
          symbol: selectedSymbol,
          bidPrice: Math.round(basePrice * 0.999 * 10000),
          askPrice: Math.round(basePrice * 1.001 * 10000),
          time: Date.now(),
        });
      }
    } catch (error) {
      // Handle error silently - fallback data is already set
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderPlaced = (order: Order) => {
    // Update user positions when order is placed
    if (currentPrice) {
      const newPosition = {
        symbol: order.symbol,
        side: order.side === 'buy' ? 'long' as const : 'short' as const,
        size: order.quantity,
        entryPrice: currentPrice.bidPrice / 10000, // Convert from internal format
        currentPnL: 0 // Will be calculated in real-time
      };
      setUserPositions(prev => [...prev.filter(pos => pos.symbol !== order.symbol), newPosition]);
    }
  };

  const handleOrderClosed = (orderId: string) => {
    // Update user positions when order is closed
    setUserPositions(prev => prev.filter(pos => pos.symbol !== selectedSymbol));
  };

  const handleTimeframeChange = async (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    try {
      const chartData = await tradeAPI.getChartData(selectedSymbol, timeframe);
      if (chartData && chartData.length > 0) {
        setChartData(chartData);
      } else {
        throw new Error('No data from API');
      }
    } catch (error) {
      const mockData = generateMockChartData(selectedSymbol, timeframe);
      setChartData(mockData);
    }
  };

  const symbols: SYMBOL[] = ['BTC', 'ETH', 'SOL', 'DOGE', 'USDC'];

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-slate-950 ${PADDING.container.sm}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden flex flex-col font-mono">
      {/* Background */}
      <div className="fixed inset-0 bg-slate-950">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(115,115,115,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(115,115,115,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

        <div className={`relative z-10 w-full h-full flex flex-col ${PADDING.container.sm}`}>
          {/* New Trading Dashboard */}
          <div className="relative z-10 mb-2">
            <TradingDashboard
              symbol={selectedSymbol}
              currentPrice={currentPrice}
              onSymbolChange={setSelectedSymbol}
              userEmail={user?.email}
              onLogout={logout}
            />
          </div>


         <div className={`flex-grow grid grid-cols-1 lg:grid-cols-12 ${PADDING.gap.md} min-h-[300px]`}>
          <div className="lg:col-span-2 order-2 lg:order-1 overflow-auto relative z-0">
           <div className={`bg-slate-900 rounded-3xl border border-slate-700 ${PADDING.container.sm} h-full`}>
              <h3 className={`text-neutral-50 text-sm font-medium mb-2 flex justify-between items-center`}>
                <span>Market Data</span>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">Live</span>
              </h3>
              <MarketOverview
                onSymbolSelect={setSelectedSymbol}
                selectedSymbol={selectedSymbol}
              />
            </div>
          </div>

            <div className={`lg:col-span-10 order-1 lg:order-2 flex flex-col xl:flex-row ${PADDING.gap.md}`}>
              <div className={`w-full xl:w-3/4 flex flex-col ${PADDING.gap.md}`}>
              <div className="h-[65%] flex flex-col">
                <Chart
                  symbol={selectedSymbol}
                  data={chartData}
                  height={400}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={handleTimeframeChange}
                />
              </div>

              <div className="h-[35%]">
                <Orders onOrderClosed={handleOrderClosed} />
              </div>
            </div>

              <div className="w-full xl:w-1/4 flex flex-col gap-4">
              <BuySell
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                onOrderPlaced={handleOrderPlaced}
              />
              
              {/* AI Demo Toggle */}
              <button
                onClick={() => setShowAIDemo(!showAIDemo)}
                className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 font-medium transition-colors hover:bg-blue-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {showAIDemo ? 'Hide' : 'Show'} AI Demo
              </button>
            </div>
          </div>
        </div>

        {/* AI Demo Section */}
        {showAIDemo && (
          <div className="mt-6">
            <AIDemo 
              symbol={selectedSymbol}
              currentPrice={currentPrice ? currentPrice.bidPrice / 10000 : 0}
            />
          </div>
        )}

        {/* AI Assistant Button */}
        <AIAssistantButton
          symbol={selectedSymbol}
          currentPrice={currentPrice}
          userPositions={userPositions}
        />
      </div>
    </div>
  );
}

export default function TradingPage() {
  return (
    <ProtectedRoute>
      <TradingPageContent />
    </ProtectedRoute>
  );
}