// Price formatting utilities for CFD platform
// All prices stored as integers with specified decimals

export const formatPrice = (price: number, decimals: number): string => {
  const divisor = Math.pow(10, decimals);
  return (price / divisor).toFixed(Math.min(decimals, 6));
};

export const parsePrice = (price: string, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(parseFloat(price) * multiplier);
};

export const formatUSD = (amount: number, decimals: number = 2): string => {
  const divisor = Math.pow(10, decimals);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount / divisor);
};

export const formatPercentage = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

export const calculateSpread = (buyPrice: number, sellPrice: number, decimals: number): number => {
  const divisor = Math.pow(10, decimals);
  const buy = buyPrice / divisor;
  const sell = sellPrice / divisor;
  return ((buy - sell) / sell) * 100;
};

export const calculatePositionSize = (margin: number, leverage: number): number => {
  return margin * leverage;
};

export const calculateLiquidationPrice = (
  openPrice: number, 
  leverage: number, 
  positionType: 'buy' | 'sell',
  decimals: number
): number => {
  const price = openPrice / Math.pow(10, decimals);
  const maintenanceMargin = 0.05; // 5% maintenance margin
  
  if (positionType === 'buy') {
    return price * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return price * (1 + (1 / leverage) - maintenanceMargin);
  }
};

export const calculatePnL = (
  openPrice: number,
  closePrice: number,
  positionType: 'buy' | 'sell',
  margin: number,
  leverage: number,
  decimals: number
): number => {
  const open = openPrice / Math.pow(10, decimals);
  const close = closePrice / Math.pow(10, decimals);
  const positionSize = margin * leverage;
  
  if (positionType === 'buy') {
    return ((close - open) / open) * positionSize;
  } else {
    return ((open - close) / open) * positionSize;
  }
};

export const getAssetIcon = (symbol: string): string => {
  const icons: Record<string, string> = {
    'BTC': '/assets/btc.svg',
    'ETH': '/assets/eth.svg',
    'SOL': '/assets/sol.svg',
    'USDC': '/assets/usdc.svg'
  };
  return icons[symbol] || '/assets/default.svg';
};
