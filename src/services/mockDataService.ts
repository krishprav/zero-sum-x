import { Asset, PriceUpdate } from '../types/trading';

class BinanceWebSocketService {
  private ws: WebSocket | null = null;
  private isConnectedFlag = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private priceUpdateCallbacks: ((updates: PriceUpdate[]) => void)[] = [];

  // Supported trading pairs - All available markets
  private supportedSymbols = [
    // Crypto - Major pairs
    'btcusdt', 'ethusdt', 'solusdt', 'adausdt', 'dotusdt', 
    'linkusdt', 'maticusdt', 'uniusdt', 'bnbusdt', 'xrpusdt',
    'ltcusdt', 'bchusdt', 'eosusdt', 'trxusdt', 'filusdt',
    'avaxusdt', 'atomusdt', 'neousdt', 'ftmusdt', 'algousdt',
    'vetusdt', 'icpusdt', 'aptusdt', 'arbusdt', 'opusdt',
    'suiusdt', 'aptusdt', 'manta', 'jupusdt', 'pepeusdt',
    'dogeusdt', 'shibusdt', 'flokiusdt', 'bonkusdt', 'wifusdt',
    
    // Crypto - DeFi & Gaming
    'aaveusdt', 'compusdt', 'mkrusdt', 'snxusdt', 'yfiusdt',
    'sushiusdt', '1inchusdt', 'crvusdt', 'balusdt', 'renusdt',
    'enjusdt', 'sandusdt', 'manausdt', 'axsusdt', 'galausdt',
    'chzusdt', 'hotusdt', 'batusdt', 'zilusdt', 'nulsdt',
    
    // Crypto - Layer 1 & 2
    'nearusdt', 'celousdt', 'hbarusdt', 'tezosusdt', 'xtzusdt',
    'wavesusdt', 'zecusdt', 'dashusdt', 'monerusdt', 'xmrusdt',
    'etcusdt', 'bchusdt', 'bsvusdt', 'xecusdt', 'xdcusdt',
    
    // Stocks - US Tech (using crypto pairs as proxies)
    'aaplusdt', 'msftusdt', 'googlusdt', 'amznusdt', 'tslausdt',
    'nvdausdt', 'metausdt', 'nflxusdt', 'adbeusdt', 'orclusdt',
    'csco', 'intcusdt', 'qcomusdt', 'amdusdt', 'avgo',
    
    // Forex - Major Pairs (using crypto pairs as proxies)
    'eurusdt', 'gbpusdt', 'usdjpy', 'usdcad', 'usdchf',
    'audusdt', 'nzdusdt', 'usdsgd', 'usdhkd', 'usdkrw',
    
    // Commodities (using crypto pairs as proxies)
    'goldusdt', 'silverusdt', 'oilusdt', 'copperusdt', 'palladiumusdt',
    'platinumusdt', 'naturalgasusdt', 'wheatusdt', 'cornusdt', 'soybeanusdt'
  ];

  constructor() {
    this.connect();
  }

  connect() {
    try {
      // Connect to Binance WebSocket stream for trade data
      const streamNames = this.supportedSymbols.map(symbol => `${symbol}@trade`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Connected to Binance WebSocket');
        this.isConnectedFlag = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleTradeData(data);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Binance WebSocket connection closed');
        this.isConnectedFlag = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.isConnectedFlag = false;
      };

    } catch (error) {
      console.error('Error connecting to Binance WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleTradeData(data: { e: string; s: string; p: string; q: string; T: number }) {
    if (data.e === 'trade') {
      const symbol = data.s;
      const price = parseFloat(data.p);
      // const quantity = parseFloat(data.q);
      // const timestamp = data.T;

      // Calculate buy/sell prices with 1% spread
      const spread = 0.01; // 1% spread
      const buyPrice = price * (1 + spread / 2); // 0.5% above current price
      const sellPrice = price * (1 - spread / 2); // 0.5% below current price

      const priceUpdate: PriceUpdate = {
        symbol: symbol.replace('USDT', '').toUpperCase(),
        buyPrice: Math.round(buyPrice * 1000000), // Convert to integer with 6 decimals
        sellPrice: Math.round(sellPrice * 1000000),
        decimals: 6
      };

      // Notify all subscribers
      this.priceUpdateCallbacks.forEach(callback => {
        callback([priceUpdate]);
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnectedFlag = false;
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  subscribeToPriceUpdates(callback: (updates: PriceUpdate[]) => void) {
    this.priceUpdateCallbacks.push(callback);
  }

  unsubscribeFromPriceUpdates(callback: (updates: PriceUpdate[]) => void) {
    const index = this.priceUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.priceUpdateCallbacks.splice(index, 1);
    }
  }

  getAssets(): Asset[] {
    return [
      {
        name: "Bitcoin",
        symbol: "BTC",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/btc.svg",
        currentPrice: 108000,
        change24h: 2.5,
        high24h: 110000,
        low24h: 106000
      },
      {
        name: "Ethereum",
        symbol: "ETH",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/eth.svg",
        currentPrice: 3200,
        change24h: 1.8,
        high24h: 3250,
        low24h: 3150
      },
      {
        name: "Solana",
        symbol: "SOL",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/sol.svg",
        currentPrice: 210,
        change24h: 3.2,
        high24h: 215,
        low24h: 205
      },
      {
        name: "Cardano",
        symbol: "ADA",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/ada.svg",
        currentPrice: 0.45,
        change24h: -0.8,
        high24h: 0.46,
        low24h: 0.44
      },
      {
        name: "Polkadot",
        symbol: "DOT",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/dot.svg",
        currentPrice: 6.8,
        change24h: 1.5,
        high24h: 6.9,
        low24h: 6.7
      },
      {
        name: "Chainlink",
        symbol: "LINK",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/link.svg",
        currentPrice: 15.5,
        change24h: 2.1,
        high24h: 15.8,
        low24h: 15.2
      },
      {
        name: "Polygon",
        symbol: "MATIC",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/matic.svg",
        currentPrice: 0.89,
        change24h: -1.2,
        high24h: 0.91,
        low24h: 0.87
      },
      {
        name: "Uniswap",
        symbol: "UNI",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/uni.svg",
        currentPrice: 12.3,
        change24h: 0.9,
        high24h: 12.5,
        low24h: 12.1
      },
      {
        name: "Binance Coin",
        symbol: "BNB",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/bnb.svg",
        currentPrice: 580,
        change24h: 1.3,
        high24h: 585,
        low24h: 575
      },
      {
        name: "Ripple",
        symbol: "XRP",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/xrp.svg",
        currentPrice: 0.52,
        change24h: -0.5,
        high24h: 0.53,
        low24h: 0.51
      },
      {
        name: "Litecoin",
        symbol: "LTC",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/ltc.svg",
        currentPrice: 85,
        change24h: 0.8,
        high24h: 86,
        low24h: 84
      },
      {
        name: "Bitcoin Cash",
        symbol: "BCH",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/bch.svg",
        currentPrice: 420,
        change24h: 1.1,
        high24h: 425,
        low24h: 415
      },
      {
        name: "EOS",
        symbol: "EOS",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/eos.svg",
        currentPrice: 0.75,
        change24h: -0.3,
        high24h: 0.76,
        low24h: 0.74
      },
      {
        name: "TRON",
        symbol: "TRX",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/trx.svg",
        currentPrice: 0.12,
        change24h: 0.7,
        high24h: 0.121,
        low24h: 0.119
      },
      {
        name: "Filecoin",
        symbol: "FIL",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/fil.svg",
        currentPrice: 8.5,
        change24h: 2.4,
        high24h: 8.7,
        low24h: 8.3
      },
      {
        name: "Avalanche",
        symbol: "AVAX",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/avax.svg",
        currentPrice: 35,
        change24h: 1.9,
        high24h: 35.5,
        low24h: 34.5
      },
      {
        name: "Cosmos",
        symbol: "ATOM",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/atom.svg",
        currentPrice: 12.5,
        change24h: 0.6,
        high24h: 12.6,
        low24h: 12.4
      },
      {
        name: "Neo",
        symbol: "NEO",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/neo.svg",
        currentPrice: 18,
        change24h: -0.4,
        high24h: 18.2,
        low24h: 17.8
      },
      {
        name: "Fantom",
        symbol: "FTM",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/ftm.svg",
        currentPrice: 0.45,
        change24h: 1.8,
        high24h: 0.46,
        low24h: 0.44
      },
      {
        name: "Algorand",
        symbol: "ALGO",
        buyPrice: 0,
        sellPrice: 0,
        decimals: 6,
        imageUrl: "/assets/algo.svg",
        currentPrice: 0.25,
        change24h: 0.4,
        high24h: 0.251,
        low24h: 0.249
      }
    ];
  }
}

// Export singleton instance
export const binanceService = new BinanceWebSocketService();
