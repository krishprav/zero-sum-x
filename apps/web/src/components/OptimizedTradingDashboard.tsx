'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Trade, SYMBOL } from '../types/trading';
import { toDisplayPrice } from '../utils/utils';
import { PADDING } from '../utils/constants';
import Skeleton from './ui/Skeleton';
import WalletButton from './WalletButton';
import { 
  useDebounced, 
  useThrottled, 
  useMemoizedCalculation,
  usePerformanceMonitor,
  useBatchedUpdates 
} from '../hooks/usePerformanceOptimization';

interface OptimizedTradingDashboardProps {
  symbol: SYMBOL;
  currentPrice: Trade | null;
  onSymbolChange: (symbol: SYMBOL) => void;
  userEmail?: string;
  onLogout?: () => void;
}

// Memoized logo component to prevent unnecessary re-renders
const SymbolLogo = React.memo(({ symbol }: { symbol: string }) => {
  const logoMap: { [key: string]: string } = {
    'BTC': '/assets/btc.svg',
    'ETH': '/assets/eth.svg',
    'SOL': '/assets/solana.svg',
    'DOGE': '/assets/doge.svg',
    'USDC': '/assets/usdc.svg',
  };

  return (
    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white/10">
      <img 
        src={logoMap[symbol] || '/assets/btc.svg'} 
        alt={`${symbol} logo`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
});

SymbolLogo.displayName = 'SymbolLogo';

// Memoized price display component
const PriceDisplay = React.memo(({ 
  price, 
  change, 
  isPositive 
}: { 
  price: number; 
  change: number; 
  isPositive: boolean; 
}) => (
  <div className="transition-all duration-300 min-w-0">
    <div className="text-4xl font-bold text-white mb-2 tracking-tight truncate text-premium-lg">
      ${price.toLocaleString('en-US', { 
        minimumFractionDigits: 3, 
        maximumFractionDigits: 3 
      })}
    </div>
    <div className={`text-sm font-semibold transition-colors duration-300 flex items-center gap-2 ${
      isPositive ? 'text-green-400' : 'text-red-400'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        isPositive ? 'bg-green-400' : 'bg-red-400'
      }`}></span>
      {isPositive ? '+' : ''}{change.toFixed(3)}%
    </div>
  </div>
));

PriceDisplay.displayName = 'PriceDisplay';

export default function OptimizedTradingDashboard({ 
  symbol, 
  currentPrice, 
  onSymbolChange, 
  userEmail, 
  onLogout 
}: OptimizedTradingDashboardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  usePerformanceMonitor('TradingDashboard');

  // Debounced symbol change to prevent rapid API calls
  const debouncedSymbolChange = useDebounced(symbol, 300);

  // Throttled price updates to prevent excessive re-renders
  const throttledPrice = useThrottled(currentPrice, 100);

  // Memoized calculations for expensive operations
  const currentPriceDisplay = useMemoizedCalculation(
    throttledPrice,
    (price) => price ? toDisplayPrice(price.bidPrice) : 0,
    [throttledPrice]
  );

  const symbols: SYMBOL[] = useMemo(() => ['BTC', 'ETH', 'SOL', 'DOGE', 'USDC'], []);

  // Memoized 24H data calculation
  const price24H = useMemoizedCalculation(
    symbol,
    (sym: SYMBOL) => {
      const data = {
        'BTC': { high: 117972.291, low: 113345.926, change: -1.074 },
        'ETH': { high: 3972.291, low: 3334.926, change: 2.145 },
        'SOL': { high: 272.291, low: 234.926, change: -0.874 },
        'DOGE': { high: 0.089, low: 0.075, change: 1.234 },
        'USDC': { high: 1.001, low: 0.999, change: 0.001 },
      };
      return data[sym] || data['BTC'];
    },
    [symbol]
  );

  // Batch updates for better performance
  const batchUpdate = useBatchedUpdates();

  // Optimized loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      batchUpdate(() => {
        setIsLoading(false);
      });
    }, 800); // Reduced from 1000ms

    return () => clearTimeout(timer);
  }, [symbol, batchUpdate]);

  // Optimized click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, handleClickOutside]);

  // Memoized dropdown items to prevent re-renders
  const dropdownItems = useMemo(() => 
    symbols.map((sym) => (
      <button
        key={sym}
        onClick={() => {
          onSymbolChange(sym);
          setIsDropdownOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left rounded-2xl mx-2 my-1 transition-all duration-200 ${
          symbol === sym 
            ? 'bg-white/5 border border-white/10 shadow-lg shadow-black/10' 
            : 'hover:bg-white/3'
        }`}
      >
        <SymbolLogo symbol={sym} />
        <span className="text-white font-medium">{sym}/USD</span>
      </button>
    )),
    [symbols, symbol, onSymbolChange]
  );

  // Loading skeleton with optimized structure
  if (isLoading) {
    return (
      <div className={`bg-white/1 backdrop-blur-3xl border border-white/5 rounded-3xl ${PADDING.container.md} shadow-2xl shadow-black/20`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${PADDING.gap.lg}`}>
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-40" />
          </div>
          <div className={`flex items-center ${PADDING.gap.xl}`}>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className={`dock-container edge-shadow rounded-3xl ${PADDING.container.md} relative overflow-hidden`}>
      {/* Optimized background effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-6 left-6 w-20 h-20 bg-gradient-radial from-white/4 via-white/1 to-transparent rounded-full blur-[4px]"></div>
        <div className="absolute top-8 left-8 w-4 h-4 bg-white/6 rounded-full blur-[2px]"></div>
        <div className="absolute top-12 right-12 w-16 h-16 bg-gradient-radial from-white/3 via-white/0.5 to-transparent rounded-full blur-[4px]"></div>
        <div className="absolute top-14 right-14 w-3 h-3 bg-white/5 rounded-full blur-[2px]"></div>
        <div className="absolute bottom-10 left-12 w-24 h-24 bg-gradient-radial from-white/2 via-white/0.3 to-transparent rounded-full blur-[4px]"></div>
        <div className="absolute bottom-12 left-14 w-5 h-5 bg-white/4 rounded-full blur-[2px]"></div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/8 rounded-full"></div>
        <div className="absolute bottom-24 right-16 w-2 h-2 bg-white/6 rounded-full"></div>
        <div className="absolute top-32 right-24 w-1.5 h-1.5 bg-white/10 rounded-full"></div>
      </div>

      <div className={`flex flex-col lg:flex-row flex-wrap xl:flex-nowrap items-start lg:items-center justify-between ${PADDING.gap.md} lg:gap-6 xl:gap-8 relative z-10`}>
        {/* Left Section - Symbol Selector and Price */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center ${PADDING.gap.md} sm:${PADDING.gap.lg} w-full lg:w-auto min-w-0 shrink-0`}>
          {/* Optimized Symbol Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-colors duration-200 text-premium"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <SymbolLogo symbol={symbol} />
              <span className="text-white font-semibold text-xs whitespace-nowrap">{symbol}/USD</span>
              <svg
                className={`w-3 h-3 text-white/80 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Optimized Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dock-container absolute top-full left-0 mt-2 w-48 rounded-3xl z-[99999] animate-in slide-in-from-top-2 duration-300">
                {dropdownItems}
              </div>
            )}
          </div>

          {/* Optimized Price Display */}
          <PriceDisplay 
            price={currentPriceDisplay}
            change={price24H.change}
            isPositive={price24H.change >= 0}
          />
        </div>

        {/* Middle Section - 24H Stats */}
        <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center ${PADDING.gap.md} sm:${PADDING.gap.xl} w-full lg:w-auto min-w-0 flex-1`}>
          <div className="text-center group hover:scale-105 transition-all duration-200 p-3 rounded-xl hover:bg-white/5">
            <div className="text-neutral-400 text-xs mb-2 group-hover:text-neutral-300 transition-colors font-medium">24H High</div>
            <div className="text-white font-bold text-sm tracking-tight text-premium">
              ${price24H.high.toLocaleString('en-US', { 
                minimumFractionDigits: 3, 
                maximumFractionDigits: 3 
              })}
            </div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-200 p-3 rounded-xl hover:bg-white/5">
            <div className="text-neutral-400 text-xs mb-2 group-hover:text-neutral-300 transition-colors font-medium">24H Low</div>
            <div className="text-white font-bold text-sm tracking-tight text-premium">
              ${price24H.low.toLocaleString('en-US', { 
                minimumFractionDigits: 3, 
                maximumFractionDigits: 3 
              })}
            </div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-200 p-3 rounded-xl hover:bg-white/5">
            <div className="text-neutral-400 text-xs mb-2 group-hover:text-neutral-300 transition-colors font-medium">Maintenance</div>
            <div className="text-white font-bold text-sm tracking-tight text-premium">5.0%</div>
          </div>
        </div>

        {/* Right Section - User Info and Deposit */}
        <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center ${PADDING.gap.sm} sm:${PADDING.gap.md} w-full lg:w-auto min-w-0 shrink-0`}>
          {/* User Info */}
          {userEmail && (
            <div className="bg-slate-800 border border-slate-600 px-3 py-2.5 rounded-2xl min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-green-400 text-xs font-semibold">Live</span>
                </div>
                <div className="text-right">
                  <div className="text-neutral-300 text-xs font-medium">Welcome back</div>
                  <div className="text-white font-bold text-xs tracking-tight truncate max-w-[200px] sm:max-w-[260px] text-premium">{userEmail}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Wallet Connect Button */}
          <WalletButton />

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-2 text-white rounded-2xl font-semibold transition-colors duration-200 shrink-0 text-premium text-sm"
            >
              Logout
            </button>
          )}

          {/* Deposit Info */}
          <div className="bg-slate-800 border border-slate-600 px-3 py-2.5 rounded-2xl shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-semibold whitespace-nowrap">DEPOSIT:</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-semibold border border-blue-500/30">DEMO</span>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg shadow-white/20">
                <span className="text-white font-bold text-xs">$</span>
              </div>
              <span className="text-white font-bold text-sm tracking-tight whitespace-nowrap text-premium">
                {userBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
