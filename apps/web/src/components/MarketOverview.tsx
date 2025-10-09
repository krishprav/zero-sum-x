'use client';

import { useEffect, useState } from 'react';
import { tradeAPI } from '../services/api';
import { Asset, SYMBOL } from '../types/trading';
import { toDisplayPrice } from '../utils/utils';

interface MarketOverviewProps {
  onSymbolSelect: (symbol: SYMBOL) => void;
  selectedSymbol: SYMBOL;
}

export default function MarketOverview({ onSymbolSelect, selectedSymbol }: MarketOverviewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLogoPath = (symbol: string) => {
    const logoMap: { [key: string]: string } = {
      'BTC': '/assets/btc.svg',
      'ETH': '/assets/eth.svg',
      'SOL': '/assets/solana.svg',
      'DOGE': '/assets/doge.svg',
      'USDC': '/assets/usdc.svg',
    };
    return logoMap[symbol] || '/assets/btc.svg';
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        
        // Test health check first
        try {
          const health = await tradeAPI.healthCheck();
        } catch (healthError) {
          throw healthError;
        }
        
        const fetchedAssets = await tradeAPI.getAssetDetails();
        setAssets(fetchedAssets);
      } catch (error) {
        // Handle error silently - fallback data is used
        // Fallback to mock data if API fails
        const mockAssets = [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            imageUrl: '/assets/btc.svg',
            price: 45000,
            change24h: 2.5
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            imageUrl: '/assets/eth.svg',
            price: 3200,
            change24h: -1.2
          },
          {
            symbol: 'SOL',
            name: 'Solana',
            imageUrl: '/assets/solana.svg',
            price: 180,
            change24h: 5.8
          },
          {
            symbol: 'DOGE',
            name: 'Dogecoin',
            imageUrl: '/assets/doge.svg',
            price: 0.08,
            change24h: 3.2
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            imageUrl: '/assets/usdc.svg',
            price: 1.00,
            change24h: 0.01
          }
        ];
        setAssets(mockAssets);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-neutral-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-neutral-700 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-neutral-700 rounded w-16 mb-1"></div>
                <div className="h-3 bg-neutral-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-lg shadow-black/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <div className="text-neutral-300 text-sm font-medium mb-1">
          No market data available
        </div>
        <div className="text-neutral-500 text-xs">
          Market data will appear here once available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <button
          key={asset.symbol}
          onClick={() => onSymbolSelect(asset.symbol as SYMBOL)}
          className={`keycap keycap--subtle w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
            selectedSymbol === asset.symbol
              ? "bg-white/15 text-white border border-white/30 "
              : "text-neutral-50 hover:bg-white/10 hover:border-white/20 "
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white/10">
              <img 
                src={getLogoPath(asset.symbol)} 
                alt={`${asset.symbol} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm text-premium">{asset.symbol}</div>
              <div className="text-neutral-400 text-xs font-medium">{asset.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm text-premium">${toDisplayPrice(asset.price).toFixed(2)}</div>
            <div
              className={`text-xs font-semibold flex items-center gap-1 ${
                asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${asset.change24h >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {asset.change24h >= 0 ? '+' : ''}
              {asset.change24h.toFixed(2)}%
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}