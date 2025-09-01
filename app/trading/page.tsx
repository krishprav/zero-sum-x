"use client";

import { useEffect, useState } from 'react';
import { useTradingStore } from '../../src/store/tradingStore';
import TradingChart from '../../src/components/TradingChart';
import { TradingPanel } from '../../src/components/TradingPanel';
import { binanceService } from '../../src/services/mockDataService';
import { Asset, PriceUpdate } from '../../src/types/trading';
import './trading.scss';

export default function TradingPage() {
  const {
    selectedAsset,
    setAssets
  } = useTradingStore();

  const [assets, setAssetsState] = useState<Asset[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize assets from Binance service
    const initialAssets = binanceService.getAssets();
    setAssetsState(initialAssets);
    setAssets(initialAssets);

    // Subscribe to real-time price updates
    const handlePriceUpdate = (updates: PriceUpdate[]) => {
      setAssetsState(prevAssets => {
        return prevAssets.map(asset => {
          const update = updates.find(u => u.symbol === asset.symbol);
          if (update) {
            // Calculate current price as average of buy and sell
            const currentPrice = Math.round((update.buyPrice + update.sellPrice) / 2);
            return {
              ...asset,
              buyPrice: update.buyPrice,
              sellPrice: update.sellPrice,
              currentPrice: currentPrice
            };
          }
          return asset;
        });
      });
    };

    binanceService.subscribeToPriceUpdates(handlePriceUpdate);

    // Check connection status
    const checkConnection = () => {
      setIsConnected(binanceService.isConnected());
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => {
      binanceService.unsubscribeFromPriceUpdates(handlePriceUpdate);
      clearInterval(interval);
    };
  }, [setAssets]);

  // Get current asset data
  const currentAsset = assets.find(asset => asset.symbol === selectedAsset) || assets[0];

  if (!currentAsset) {
    return (
      <div className="tradingAppWrapper">
        <div className="loadingState">
          <div className="loadingSpinner"></div>
          <p>Connecting to Binance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tradingAppWrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="logo">
              <div className="logoIcon">Z</div>
              <span className="logo-text">Zero-Sum-X</span>
            </div>
          </div>
          <div className="navbar-nav">
            <button className="nav-link">Home</button>
            <button className="nav-link active">Dashboard</button>
          </div>
          <div className="navbar-actions">
            <button className="connectWalletButton">Connect Wallet</button>
          </div>
        </div>
      </nav>

      <div className="tradingLayoutWrapper">
        {/* Trading Header */}
        <div className="tradingHeader">
          <div className="priceSection">
            <div className="symbolContainerDesktop">
              <div className="symbolIcon">
                <span className="symbolText">
                  {selectedAsset === 'BTC' && '₿'}
                  {selectedAsset === 'ETH' && 'Ξ'}
                  {selectedAsset === 'SOL' && '◎'}
                  {selectedAsset === 'ADA' && '₳'}
                  {selectedAsset === 'DOT' && '●'}
                  {selectedAsset === 'LINK' && '🔗'}
                  {selectedAsset === 'MATIC' && '🔷'}
                  {selectedAsset === 'UNI' && '🦄'}
                  {selectedAsset === 'BNB' && '🟡'}
                  {selectedAsset === 'XRP' && '💎'}
                  {selectedAsset === 'LTC' && 'Ł'}
                  {selectedAsset === 'BCH' && '₿'}
                  {selectedAsset === 'EOS' && 'ε'}
                  {selectedAsset === 'TRX' && 'T'}
                  {selectedAsset === 'FIL' && '📁'}
                  {selectedAsset === 'AVAX' && '❄️'}
                  {selectedAsset === 'ATOM' && '⚛️'}
                  {selectedAsset === 'NEO' && '🟢'}
                  {selectedAsset === 'FTM' && '👻'}
                  {selectedAsset === 'ALGO' && '🔷'}
                  {selectedAsset === 'AAPL' && '🍎'}
                  {selectedAsset === 'MSFT' && '🪟'}
                  {selectedAsset === 'GOOGL' && '🔍'}
                  {selectedAsset === 'AMZN' && '📦'}
                  {selectedAsset === 'TSLA' && '🚗'}
                  {selectedAsset === 'NVDA' && '🎮'}
                  {selectedAsset === 'META' && '📘'}
                  {selectedAsset === 'NFLX' && '🎬'}
                  {selectedAsset === 'EURUSD' && '€'}
                  {selectedAsset === 'GBPUSD' && '£'}
                  {selectedAsset === 'USDJPY' && '¥'}
                  {selectedAsset === 'USDCAD' && 'C$'}
                  {selectedAsset === 'USDCHF' && 'CHF'}
                  {selectedAsset === 'GOLD' && '🥇'}
                  {selectedAsset === 'SILVER' && '🥈'}
                  {selectedAsset === 'OIL' && '🛢️'}
                  {!['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'UNI', 'BNB', 'XRP', 'LTC', 'BCH', 'EOS', 'TRX', 'FIL', 'AVAX', 'ATOM', 'NEO', 'FTM', 'ALGO', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'USDCHF', 'GOLD', 'SILVER', 'OIL'].includes(selectedAsset) && '💱'}
                </span>
              </div>
              <div className="symbolInfoDesktop">
                <div className="selectedAssetDisplay">
                  <span className="assetName">
                    {selectedAsset === 'BTC' && 'Bitcoin Perpetual'}
                    {selectedAsset === 'ETH' && 'Ethereum Perpetual'}
                    {selectedAsset === 'SOL' && 'Solana Perpetual'}
                    {selectedAsset === 'ADA' && 'Cardano Perpetual'}
                    {selectedAsset === 'DOT' && 'Polkadot Perpetual'}
                    {selectedAsset === 'LINK' && 'Chainlink Perpetual'}
                    {selectedAsset === 'MATIC' && 'Polygon Perpetual'}
                    {selectedAsset === 'UNI' && 'Uniswap Perpetual'}
                    {selectedAsset === 'BNB' && 'Binance Coin Perpetual'}
                    {selectedAsset === 'XRP' && 'Ripple Perpetual'}
                    {selectedAsset === 'LTC' && 'Litecoin Perpetual'}
                    {selectedAsset === 'BCH' && 'Bitcoin Cash Perpetual'}
                    {selectedAsset === 'EOS' && 'EOS Perpetual'}
                    {selectedAsset === 'TRX' && 'TRON Perpetual'}
                    {selectedAsset === 'FIL' && 'Filecoin Perpetual'}
                    {selectedAsset === 'AVAX' && 'Avalanche Perpetual'}
                    {selectedAsset === 'ATOM' && 'Cosmos Perpetual'}
                    {selectedAsset === 'NEO' && 'Neo Perpetual'}
                    {selectedAsset === 'FTM' && 'Fantom Perpetual'}
                    {selectedAsset === 'ALGO' && 'Algorand Perpetual'}
                    {selectedAsset === 'AAPL' && 'Apple Inc Stock'}
                    {selectedAsset === 'MSFT' && 'Microsoft Stock'}
                    {selectedAsset === 'GOOGL' && 'Alphabet Inc Stock'}
                    {selectedAsset === 'AMZN' && 'Amazon Stock'}
                    {selectedAsset === 'TSLA' && 'Tesla Stock'}
                    {selectedAsset === 'NVDA' && 'NVIDIA Stock'}
                    {selectedAsset === 'META' && 'Meta Platforms Stock'}
                    {selectedAsset === 'NFLX' && 'Netflix Stock'}
                    {selectedAsset === 'EURUSD' && 'EUR/USD Forex'}
                    {selectedAsset === 'GBPUSD' && 'GBP/USD Forex'}
                    {selectedAsset === 'USDJPY' && 'USD/JPY Forex'}
                    {selectedAsset === 'USDCAD' && 'USD/CAD Forex'}
                    {selectedAsset === 'USDCHF' && 'USD/CHF Forex'}
                    {selectedAsset === 'GOLD' && 'Gold Commodity'}
                    {selectedAsset === 'SILVER' && 'Silver Commodity'}
                    {selectedAsset === 'OIL' && 'Crude Oil Commodity'}
                    {!['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'UNI', 'BNB', 'XRP', 'LTC', 'BCH', 'EOS', 'TRX', 'FIL', 'AVAX', 'ATOM', 'NEO', 'FTM', 'ALGO', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'USDCHF', 'GOLD', 'SILVER', 'OIL'].includes(selectedAsset) && 'Other Asset'}
                  </span>
                  <span className="assetSymbol">{selectedAsset}/USD</span>
                </div>
                <div className="dropdownArrow">▼</div>
                <select 
                  className="symbolDropdown"
                  value={selectedAsset}
                  onChange={(e) => useTradingStore.getState().setSelectedAsset(e.target.value)}
                >
                  <optgroup label="Crypto - Major">
                    <option value="BTC">Bitcoin Perpetual BTC/USD</option>
                    <option value="ETH">Ethereum Perpetual ETH/USD</option>
                    <option value="SOL">Solana Perpetual SOL/USD</option>
                    <option value="ADA">Cardano Perpetual ADA/USD</option>
                    <option value="DOT">Polkadot Perpetual DOT/USD</option>
                    <option value="LINK">Chainlink Perpetual LINK/USD</option>
                    <option value="MATIC">Polygon Perpetual MATIC/USD</option>
                    <option value="UNI">Uniswap Perpetual UNI/USD</option>
                    <option value="BNB">Binance Coin Perpetual BNB/USD</option>
                    <option value="XRP">Ripple Perpetual XRP/USD</option>
                    <option value="LTC">Litecoin Perpetual LTC/USD</option>
                    <option value="BCH">Bitcoin Cash Perpetual BCH/USD</option>
                    <option value="EOS">EOS Perpetual EOS/USD</option>
                    <option value="TRX">TRON Perpetual TRX/USD</option>
                    <option value="FIL">Filecoin Perpetual FIL/USD</option>
                    <option value="AVAX">Avalanche Perpetual AVAX/USD</option>
                    <option value="ATOM">Cosmos Perpetual ATOM/USD</option>
                    <option value="NEO">Neo Perpetual NEO/USD</option>
                    <option value="FTM">Fantom Perpetual FTM/USD</option>
                    <option value="ALGO">Algorand Perpetual ALGO/USD</option>
                  </optgroup>
                  <optgroup label="Stocks - US Tech">
                    <option value="AAPL">Apple Inc AAPL/USD</option>
                    <option value="MSFT">Microsoft MSFT/USD</option>
                    <option value="GOOGL">Alphabet Inc GOOGL/USD</option>
                    <option value="AMZN">Amazon AMZN/USD</option>
                    <option value="TSLA">Tesla TSLA/USD</option>
                    <option value="NVDA">NVIDIA NVDA/USD</option>
                    <option value="META">Meta Platforms META/USD</option>
                    <option value="NFLX">Netflix NFLX/USD</option>
                  </optgroup>
                  <optgroup label="Forex - Major Pairs">
                    <option value="EURUSD">EUR/USD Forex</option>
                    <option value="GBPUSD">GBP/USD Forex</option>
                    <option value="USDJPY">USD/JPY Forex</option>
                    <option value="USDCAD">USD/CAD Forex</option>
                    <option value="USDCHF">USD/CHF Forex</option>
                  </optgroup>
                  <optgroup label="Commodities">
                    <option value="GOLD">Gold GOLD/USD</option>
                    <option value="SILVER">Silver SILVER/USD</option>
                    <option value="OIL">Crude Oil OIL/USD</option>
                  </optgroup>
                </select>
              </div>
            </div>
            
            <div className="priceInfoDesktop">
              <div className="currentPrice">
                ${currentAsset ? (currentAsset.currentPrice / 1000000).toFixed(2) : '0.00'}
              </div>
              <div className="priceChange">
                {currentAsset && currentAsset.change24h > 0 ? '+' : ''}
                {currentAsset ? currentAsset.change24h.toFixed(2) : '0.00'}%
              </div>
            </div>
          </div>
          
          <div className="statsSectionTradingDesktop">
            <div className="statItem">
              <span className="statLabel">24H High</span>
              <span className="statValue">
                ${currentAsset ? (currentAsset.high24h / 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">24H Low</span>
              <span className="statValue">
                ${currentAsset ? (currentAsset.low24h / 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Buy Price</span>
              <span className="statValue">
                ${currentAsset ? (currentAsset.buyPrice / 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Sell Price</span>
              <span className="statValue">
                ${currentAsset ? (currentAsset.sellPrice / 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Status</span>
              <span className="statValue">
                {isConnected ? '🟢 Live' : '🟡 Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="MidComponentWrapper">
          <TradingChart />
          <div className="OrderPlacingColumn">
            <TradingPanel />
          </div>
        </div>

        {/* Bottom Ticker */}
        <div className="positionsComponent">
          <div className="tabsContainer">
            <div className="tabsList">
              <button className="tabButton active">Positions</button>
              <button className="tabButton">Funding History</button>
            </div>
          </div>
          {/* Price Ticker */}
          <div className="priceTicker">
            <div className="tickerContent">
              {assets.map((asset) => (
                <div key={asset.symbol} className="tickerItem">
                  <span className="tickerSymbol">{asset.symbol}</span>
                  <span className="tickerPrice">
                    ${(asset.currentPrice / 1000000).toFixed(2)}
                  </span>
                  <span className={`tickerChange ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
