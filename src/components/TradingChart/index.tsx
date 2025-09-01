"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTradingStore } from '../../store/tradingStore';
import { binanceService } from '../../services/mockDataService';
import { Candle, PriceUpdate, TimeFrame } from '../../types/trading';
import './tradingChart.scss';

const TradingChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { timeFrame, setTimeFrame, selectedAsset } = useTradingStore();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mouse event handlers for drag and zoom
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // Handle hover for candlestick highlighting
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      // const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      // Find hovered candlestick
      const padding = 60;
      const chartWidth = canvas.width - 2 * padding;
      const xScale = chartWidth / (candles.length - 1);
      
      const candleIndex = Math.round((x - padding) / xScale);
      if (candleIndex >= 0 && candleIndex < candles.length) {
        setHoveredCandle(candles[candleIndex]);
      } else {
        setHoveredCandle(null);
      }
    }
  }, [isDragging, dragStart, panOffset, zoomLevel, candles]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel * zoomFactor));
    
    // Zoom towards mouse position
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomRatio = newZoom / zoomLevel;
      setPanOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * zoomRatio,
        y: mouseY - (mouseY - prev.y) * zoomRatio
      }));
    }
    
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  const handleDoubleClick = useCallback(() => {
    // Reset zoom and pan
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    
    // Handle candlestick selection
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    // const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const xScale = chartWidth / (candles.length - 1);
    
    const candleIndex = Math.round((x - padding) / xScale);
    if (candleIndex >= 0 && candleIndex < candles.length) {
      setSelectedCandle(candles[candleIndex]);
    } else {
      setSelectedCandle(null);
    }
  }, [isDragging, panOffset, zoomLevel, candles]);

  // Timeframe options
  const timeFrameOptions = [
    { value: '1m' as const, label: '1M' },
    { value: '5m' as const, label: '5M' },
    { value: '30m' as const, label: '30M' },
    { value: '1h' as const, label: '1H' },
    { value: '1d' as const, label: '1D' },
    { value: '3d' as const, label: '3D' },
    { value: '7d' as const, label: '7D' },
    { value: '30d' as const, label: '30D' },
    { value: '90d' as const, label: '90D' }
  ];

  // Generate realistic candlestick data based on timeframe
  const generateCandlestickData = useCallback((timeframe: string, assetSymbol: string): Candle[] => {
    const candles: Candle[] = [];
    let basePrice = 100;
    let volatility = 0.03;

    // Adjust base price and volatility based on asset symbol
    switch (assetSymbol) {
      // Crypto - Major pairs
      case 'BTC':
        basePrice = 108000;
        volatility = 0.008; // Much reduced volatility for stability
        break;
      case 'ETH':
        basePrice = 3200;
        volatility = 0.01; // Much reduced volatility for stability
        break;
      case 'SOL':
        basePrice = 210;
        volatility = 0.015; // Much reduced volatility for stability
        break;
      case 'ADA':
        basePrice = 0.45;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'DOT':
        basePrice = 6.8;
        volatility = 0.015; // Much reduced volatility for stability
        break;
      case 'LINK':
        basePrice = 15.5;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'MATIC':
        basePrice = 0.89;
        volatility = 0.02; // Much reduced volatility for stability
        break;
      case 'UNI':
        basePrice = 12.3;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'BNB':
        basePrice = 580;
        volatility = 0.012; // Much reduced volatility for stability
        break;
      case 'XRP':
        basePrice = 0.52;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'LTC':
        basePrice = 85;
        volatility = 0.012; // Much reduced volatility for stability
        break;
      case 'BCH':
        basePrice = 420;
        volatility = 0.012; // Much reduced volatility for stability
        break;
      case 'EOS':
        basePrice = 0.75;
        volatility = 0.02; // Much reduced volatility for stability
        break;
      case 'TRX':
        basePrice = 0.12;
        volatility = 0.025; // Much reduced volatility for stability
        break;
      case 'FIL':
        basePrice = 8.5;
        volatility = 0.025; // Much reduced volatility for stability
        break;
      case 'AVAX':
        basePrice = 35;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'ATOM':
        basePrice = 12.5;
        volatility = 0.015; // Much reduced volatility for stability
        break;
      case 'NEO':
        basePrice = 18;
        volatility = 0.02; // Much reduced volatility for stability
        break;
      case 'FTM':
        basePrice = 0.45;
        volatility = 0.03; // Much reduced volatility for stability
        break;
      case 'ALGO':
        basePrice = 0.25;
        volatility = 0.025; // Much reduced volatility for stability
        break;
      
      // Stocks - US Tech
      case 'AAPL':
        basePrice = 178;
        volatility = 0.008; // Much reduced volatility for stability
        break;
      case 'MSFT':
        basePrice = 345;
        volatility = 0.01; // Much reduced volatility for stability
        break;
      case 'GOOGL':
        basePrice = 167;
        volatility = 0.012; // Much reduced volatility for stability
        break;
      case 'AMZN':
        basePrice = 145;
        volatility = 0.01; // Much reduced volatility for stability
        break;
      case 'TSLA':
        basePrice = 234;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      case 'NVDA':
        basePrice = 456;
        volatility = 0.02; // Much reduced volatility for stability
        break;
      case 'META':
        basePrice = 456;
        volatility = 0.012; // Much reduced volatility for stability
        break;
      case 'NFLX':
        basePrice = 567;
        volatility = 0.018; // Much reduced volatility for stability
        break;
      
      // Forex - Major Pairs
      case 'EURUSD':
        basePrice = 1.085;
        volatility = 0.004; // Much reduced volatility for stability
        break;
      case 'GBPUSD':
        basePrice = 1.267;
        volatility = 0.006; // Much reduced volatility for stability
        break;
      case 'USDJPY':
        basePrice = 149.8;
        volatility = 0.005; // Much reduced volatility for stability
        break;
      case 'USDCAD':
        basePrice = 1.35;
        volatility = 0.001; // Much reduced volatility for stability
        break;
      case 'USDCHF':
        basePrice = 0.89;
        volatility = 0.002; // Much reduced volatility for stability
        break;
      
      // Commodities
      case 'GOLD':
        basePrice = 2150;
        volatility = 0.002; // Much reduced volatility for stability
        break;
      case 'SILVER':
        basePrice = 24.5;
        volatility = 0.006; // Much reduced volatility for stability
        break;
      case 'OIL':
        basePrice = 78.5;
        volatility = 0.01; // Much reduced volatility for stability
        break;
      
      default:
        basePrice = 100;
        volatility = 0.012; // Much reduced volatility for stability
    }

    // Adjust data points and time multiplier based on timeframe
    let dataPoints = 100;
    let timeMultiplier = 1;

    // Adjust data points and time multiplier based on timeframe
    switch (timeframe) {
      case '1m':
        dataPoints = 60; // Reduced from 1440 to 60 for stability
        timeMultiplier = 1 * 60 * 1000;
        break;
      case '5m':
        dataPoints = 288; // 24 hours in 5-minute intervals
        timeMultiplier = 5 * 60 * 1000;
        break;
      case '30m':
        dataPoints = 48; // 24 hours in 30-minute intervals
        timeMultiplier = 30 * 60 * 1000;
        break;
      case '1h':
        dataPoints = 24; // 24 hours in 1-hour intervals
        timeMultiplier = 60 * 60 * 1000;
        break;
      case '1d':
        dataPoints = 30; // 30 days
        timeMultiplier = 24 * 60 * 60 * 1000;
        break;
      case '3d':
        dataPoints = 30; // 90 days
        timeMultiplier = 3 * 24 * 60 * 60 * 1000;
        break;
      case '7d':
        dataPoints = 52; // 52 weeks
        timeMultiplier = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        dataPoints = 12; // 12 months
        timeMultiplier = 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        dataPoints = 4; // 4 quarters
        timeMultiplier = 90 * 24 * 60 * 60 * 1000;
        break;
      default:
        dataPoints = 100;
        timeMultiplier = 60 * 60 * 1000;
    }

    let currentPrice = basePrice;
    const now = Date.now();

    for (let i = 0; i < dataPoints; i++) {
      const time = now - (dataPoints - i) * timeMultiplier;
      
      // Generate more stable price movement with reduced volatility
      const change = (Math.random() - 0.5) * volatility * currentPrice * 0.3; // Reduced by 70%
      const open = currentPrice;
      const close = Math.max(currentPrice * 0.98, Math.min(currentPrice * 1.02, currentPrice + change)); // Limit price movement to ±2%
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.2; // Reduced high/low range by 60%
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.2; // Reduced high/low range by 60%

      candles.push({
        timestamp: time,
        open: Math.round(open * 1000000), // Convert to integer with 6 decimals
        high: Math.round(high * 1000000),
        low: Math.round(low * 1000000),
        close: Math.round(close * 1000000), // Use actual close price
        volume: Math.round(Math.random() * 1000000), // Mock volume
        decimal: 6
      });

      currentPrice = close;
    }

    return candles;
  }, []);

  // Debounced refresh function to prevent rapid updates
  const debouncedRefresh = useCallback(() => {
    const timeoutId = setTimeout(() => {
      const newCandles = generateCandlestickData(timeFrame.value, selectedAsset);
      setCandles(newCandles);
    }, 5000); // Wait 5 seconds before refreshing (increased from 1 second)

    return () => clearTimeout(timeoutId);
  }, [timeFrame, selectedAsset, generateCandlestickData]);

  // Draw the candlestick chart
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply pan and zoom transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // Calculate chart dimensions
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Find price range
    const prices = candles.flatMap(candle => [
      candle.open / 1000000,
      candle.high / 1000000,
      candle.low / 1000000,
      candle.close / 1000000
    ]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.1;

    // Price scale
    const yScale = chartHeight / (priceRange + 2 * pricePadding);
    const xScale = chartWidth / (candles.length - 1);

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 6; i++) {
      const x = padding + (i * chartWidth) / 6;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines (price)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartHeight) / 4;
      const price = maxPrice + pricePadding - (i * (priceRange + 2 * pricePadding)) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Draw price labels
      ctx.fillStyle = '#888';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding - 10, y + 4);
    }

    // Draw candlesticks
    candles.forEach((candle, index) => {
      const x = padding + index * xScale;
      const open = candle.open / 1000000;
      const high = candle.high / 1000000;
      const low = candle.low / 1000000;
      const close = candle.close / 1000000;
      
      const isGreen = close >= open;
      const color = isGreen ? '#26a69a' : '#ef5350'; // Green for bullish, red for bearish (pooka-finance colors)
      
      // Calculate Y positions
      const openY = padding + (maxPrice + pricePadding - open) * yScale;
      const closeY = padding + (maxPrice + pricePadding - close) * yScale;
      const highY = padding + (maxPrice + pricePadding - high) * yScale;
      const lowY = padding + (maxPrice + pricePadding - low) * yScale;
      
      const candleWidth = Math.max(2, xScale * 0.8);
      const wickWidth = 1;
      
      // Draw wick (high to low)
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Draw candlestick body
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      if (bodyHeight > 0) {
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
      } else {
        // Doji - just a line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, openY);
        ctx.lineTo(x + candleWidth / 2, openY);
        ctx.stroke();
      }
      
      // Highlight hovered and selected candlesticks
      if (hoveredCandle === candle) {
        ctx.strokeStyle = '#26a69a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - candleWidth / 2 - 2, bodyY - 2, candleWidth + 4, bodyHeight + 4);
      }
      
      if (selectedCandle === candle) {
        ctx.strokeStyle = '#26a69a';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - candleWidth / 2 - 3, bodyY - 3, candleWidth + 6, bodyHeight + 6);
      }
    });

    // Restore transformations
    ctx.restore();

    // Draw time labels on X-axis with proper dates
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Calculate date labels based on timeframe
    const getDateLabels = () => {
      const labels = [];
      const now = new Date();
      
      switch (timeFrame.value) {
        case '1m':
          // Show hours for 1m timeframe (last 24 hours)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000); // 4-hour intervals
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          }
          break;
        case '5m':
          // Show hours for 5m timeframe (last 24 hours)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000); // 4-hour intervals
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          }
          break;
        case '30m':
          // Show hours for 30m timeframe (last 24 hours)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000); // 4-hour intervals
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          }
          break;
        case '1h':
          // Show dates with hours for 1h timeframe (last 24 hours)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000); // 4-hour intervals
            const isToday = time.toDateString() === now.toDateString();
            const isYesterday = time.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
            
            if (isToday) {
              labels.push(`Today ${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
            } else if (isYesterday) {
              labels.push(`Yesterday ${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
            } else {
              labels.push(time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }));
            }
          }
          break;
        case '1d':
          // Show dates for 1d timeframe (last 30 days)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 5 * 24 * 60 * 60 * 1000); // 5-day intervals
            const isToday = time.toDateString() === now.toDateString();
            const isYesterday = time.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
            
            if (isToday) {
              labels.push('Today');
            } else if (isYesterday) {
              labels.push('Yesterday');
            } else {
              labels.push(time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
          }
          break;
        case '3d':
          // Show dates for 3d timeframe (last 90 days)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 15 * 24 * 60 * 60 * 1000); // 15-day intervals
            labels.push(time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          }
          break;
        case '7d':
          // Show dates for 7d timeframe (last 52 weeks)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 7 * 24 * 60 * 60 * 1000); // 7-day intervals
            labels.push(time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          }
          break;
        case '30d':
          // Show months for 30d timeframe (last 12 months)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 30 * 24 * 60 * 60 * 1000); // 30-day intervals
            labels.push(time.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
          }
          break;
        case '90d':
          // Show months for 90d timeframe (last 4 quarters)
          for (let i = 0; i <= 6; i++) {
            const time = new Date(now.getTime() - (6 - i) * 90 * 24 * 60 * 60 * 1000); // 90-day intervals
            labels.push(time.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
          }
          break;
        default:
          // Default to simple labels
          labels.push('1m', '5m', '30m', '1h', '1d', '3d', '7d', '30d', '90d');
      }
      
      return labels;
    };
    
    const dateLabels = getDateLabels();
    dateLabels.forEach((label, index) => {
      const x = padding + (index * chartWidth) / (dateLabels.length - 1);
      ctx.fillText(label, x, height - padding + 20);
    });

    // Draw last update info
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Last Update: ${lastUpdate.toLocaleTimeString()}`, padding, height - 20);
    
    // Draw hover info
    if (hoveredCandle) {
      const open = hoveredCandle.open / 1000000;
      const high = hoveredCandle.high / 1000000;
      const low = hoveredCandle.low / 1000000;
      const close = hoveredCandle.close / 1000000;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(10, 10, 200, 100);
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`O: ${open.toFixed(2)}`, 20, 30);
      ctx.fillText(`H: ${high.toFixed(2)}`, 20, 50);
      ctx.fillText(`L: ${low.toFixed(2)}`, 20, 70);
      ctx.fillText(`C: ${close.toFixed(2)}`, 20, 90);
    }
  }, [lastUpdate, timeFrame.value, candles, hoveredCandle, selectedCandle, panOffset, zoomLevel]);

  // Initialize chart and subscribe to real-time updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 400;
    }

    // Generate initial data
    const initialData = generateCandlestickData(timeFrame.value, selectedAsset);
    setCandles(initialData);

    // Subscribe to real-time price updates with debounced refresh
    const handlePriceUpdate = (updates: PriceUpdate[]) => {
      if (updates.length > 0) {
        setLastUpdate(new Date());
        // Use debounced refresh to prevent constant chart movement
        debouncedRefresh();
      }
    };

    binanceService.subscribeToPriceUpdates(handlePriceUpdate);

    // Connect to Binance if not already connected
    if (!binanceService.isConnected()) {
      binanceService.connect();
    }

    return () => {
      binanceService.unsubscribeFromPriceUpdates(handlePriceUpdate);
    };
  }, [selectedAsset, generateCandlestickData, debouncedRefresh]);

  // Update chart when timeframe changes
  useEffect(() => {
    const newCandles = generateCandlestickData(timeFrame.value, selectedAsset);
    setCandles(newCandles);
  }, [timeFrame.value, selectedAsset, generateCandlestickData]);

  // Draw chart when candles change
  useEffect(() => {
    if (canvasRef.current && candles.length > 0) {
      drawChart();
    }
  }, [candles, drawChart]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
        if (candles.length > 0) {
          drawChart();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [candles, drawChart]);

  const handleTimeFrameChange = (newTimeFrame: { value: string; label: string }) => {
    setTimeFrame({
      value: newTimeFrame.value as TimeFrame,
      label: newTimeFrame.label
    });
  };

  return (
    <div className="tradingChart">
      <div className="chartHeader">
        <div className="chartInfo">
          <div className="assetInfo">
            <h2 className="assetTitle">{selectedAsset}</h2>
            <div className="assetPrice">
              {candles.length > 0 && (
                <span className="currentPrice">
                  ${(candles[candles.length - 1].close / 1000000).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="timeframeSelector">
          <div className="timeframeHeader">
            <h3 className="timeframeTitle">Timeframe</h3>
            <div className="timeframeCurrent">
              Current: <span className="timeframeCurrentValue">{timeFrame.label}</span>
            </div>
          </div>
          <div className="timeframeButtons">
            {timeFrameOptions.map((option) => (
              <button
                key={option.value}
                className={`timeframeButton ${timeFrame.value === option.value ? 'active' : ''}`}
                onClick={() => handleTimeFrameChange(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="chartArea">
        {candles.length === 0 ? (
          <div className="chartLoading">
            <div className="loadingSpinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : (
        <canvas 
          ref={canvasRef} 
          className="chartCanvas" 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onClick={handleClick}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        )}
          </div>
      
      <div className="chartControls">
        <p>Drag to pan • Scroll to zoom • Double-click to reset</p>
        {lastUpdate && (
          <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default TradingChart;

