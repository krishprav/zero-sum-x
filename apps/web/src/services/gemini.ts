import { GoogleGenerativeAI } from '@google/generative-ai';
import { newsService, NewsArticle, NewsAnalysis } from './news';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';


const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'market-analysis' | 'news-summary' | 'trading-advice';
  metadata?: {
    symbol?: string;
    confidence?: number;
    sources?: string[];
  };
}

export interface MarketContext {
  currentSymbol: string;
  currentPrice: number;
  priceChange24h: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  userPositions?: Array<{
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    currentPnL: number;
  }>;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  private conversationHistory: ChatMessage[] = [];
  private marketContext: MarketContext | null = null;

  async testConnection(): Promise<boolean> {
    if (!API_KEY) {
      return false;
    }

    try {
      const result = await this.model.generateContent('Hello, respond with "API working"');
      const response = await result.response;
      response.text();
      return true;
    } catch (error) {
      return false;
    }
  }

  setMarketContext(context: MarketContext) {
    this.marketContext = context;
  }

  getMarketContext(): MarketContext | null {
    return this.marketContext;
  }

  addToHistory(message: ChatMessage) {
    this.conversationHistory.push(message);
    // Keep only last 20 messages to manage context length
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  private buildSystemPrompt(): string {
    const context = this.marketContext;
    let systemPrompt = `You are an AI trading assistant for Zero Sum X, a cryptocurrency trading platform. You provide intelligent market analysis, news insights, and trading guidance.

CORE CAPABILITIES:
- Real-time market analysis and price predictions
- News analysis and sentiment evaluation
- Trading strategy recommendations
- Risk management advice
- Technical analysis insights
- Market trend identification

RESPONSE GUIDELINES:
- Always provide clear, actionable insights
- Include risk disclaimers for trading advice
- Use professional but accessible language
- Support responses with data when available
- Be concise but comprehensive

CURRENT MARKET CONTEXT:`;

    if (context) {
      systemPrompt += `
- Active Symbol: ${context.currentSymbol}
- Current Price: $${context.currentPrice}
- 24h Change: ${context.priceChange24h > 0 ? '+' : ''}${context.priceChange24h}%
- Market Trend: ${context.marketTrend}`;

      if (context.userPositions && context.userPositions.length > 0) {
        systemPrompt += `\n- User Positions: ${context.userPositions.map(p => 
          `${p.symbol} ${p.side} ${p.size} (PnL: ${p.currentPnL > 0 ? '+' : ''}$${p.currentPnL})`
        ).join(', ')}`;
      }
    }

    systemPrompt += `

IMPORTANT DISCLAIMERS:
- Always remind users that trading involves risk
- Past performance doesn't guarantee future results
- Users should never invest more than they can afford to lose
- This is educational content, not financial advice

Respond naturally and helpfully to user queries about trading, market analysis, news, and general crypto topics.`;

    return systemPrompt;
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    if (!API_KEY) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Gemini AI is not configured. Please add your API key to enable AI features.',
        timestamp: new Date(),
        type: 'text'
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const historyText = this.conversationHistory
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyText}\n\nUser: ${userMessage}\nAssistant:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: content.trim(),
        timestamp: new Date(),
        type: this.determineMessageType(userMessage, content)
      };

      this.addToHistory(assistantMessage);
      return assistantMessage;

    } catch (error) {
      
      // Provide more specific error information
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY') || error.message.includes('API key')) {
          errorMessage = 'API key issue detected. Please check your Gemini API configuration.';
        } else if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('QUOTA_EXCEEDED')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('permission')) {
          errorMessage = 'API permission denied. Please check your API key permissions.';
        } else if (error.message.includes('INVALID_ARGUMENT')) {
          errorMessage = 'Invalid request. Please try rephrasing your question.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      // Provide a fallback response with basic trading insights
      const fallbackResponse = this.getFallbackResponse(userMessage);
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${errorMessage}\n\n${fallbackResponse}`,
        timestamp: new Date(),
        type: 'text'
      };
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
      return `📊 **BTC Market Insights (Fallback)**:
• Bitcoin is currently trading around $45,000-$50,000 range
• Key support levels: $42,000, $40,000
• Key resistance levels: $48,000, $52,000
• Consider monitoring volume and market sentiment
• Always use proper risk management and position sizing`;
    }
    
    if (lowerMessage.includes('analysis') || lowerMessage.includes('outlook')) {
      return `📈 **General Market Analysis (Fallback)**:
• Monitor key technical indicators (RSI, MACD, Moving Averages)
• Watch for breakout patterns and volume confirmation
• Consider market sentiment and news impact
• Always set stop-losses and take-profits
• Never risk more than you can afford to lose`;
    }
    
    if (lowerMessage.includes('news')) {
      return `📰 **Market News (Fallback)**:
• Check CoinDesk, CoinTelegraph, and official crypto news sources
• Monitor regulatory developments and institutional adoption
• Watch for major exchange listings and ETF approvals
• Consider sentiment analysis from social media and forums
• News can significantly impact short-term price movements`;
    }
    
    return `💡 **General Trading Tips (Fallback)**:
• Always do your own research (DYOR)
• Use proper risk management (1-2% risk per trade)
• Consider dollar-cost averaging for long-term positions
• Monitor market volatility and adjust position sizes accordingly
• Keep emotions in check and stick to your trading plan`;
  }

  private determineMessageType(userMessage: string, response: string): ChatMessage['type'] {
    const lowerUser = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();

    if (lowerUser.includes('news') || lowerResponse.includes('news')) {
      return 'news-summary';
    }
    if (lowerUser.includes('analyze') || lowerUser.includes('prediction') || lowerResponse.includes('analysis')) {
      return 'market-analysis';
    }
    if (lowerUser.includes('trade') || lowerUser.includes('buy') || lowerUser.includes('sell') || 
        lowerResponse.includes('trading') || lowerResponse.includes('position')) {
      return 'trading-advice';
    }
    return 'text';
  }

  async analyzeMarketNews(symbol: string): Promise<ChatMessage> {
    try {
      // Get latest news and sentiment analysis
      const [news, analysis] = await Promise.all([
        newsService.getLatestNews(symbol, 5),
        newsService.analyzeNewsSentiment(symbol)
      ]);

      const newsSummary = news.map(article => 
        `• ${article.title} (${article.source}) - ${article.sentiment} sentiment`
      ).join('\n');

      const prompt = `Based on the latest news analysis for ${symbol}:

NEWS SUMMARY:
${newsSummary}

SENTIMENT ANALYSIS:
- Overall Sentiment: ${analysis.overallSentiment}
- Key Themes: ${analysis.keyThemes.join(', ')}
- Market Impact: ${analysis.marketImpact}
- Confidence: ${Math.round(analysis.confidence * 100)}%
- Summary: ${analysis.summary}

Please provide:
1. Key insights from this news flow
2. How this might impact ${symbol} price
3. Trading considerations based on sentiment
4. Risk factors to monitor

Keep the analysis concise but actionable.`;

      return this.sendMessage(prompt);
    } catch (error) {
      // Handle error silently - fallback response is used
      return this.sendMessage(`Analyze the latest market news and sentiment for ${symbol}. What are the key factors affecting the price?`);
    }
  }

  async getTradingInsights(symbol: string): Promise<ChatMessage> {
    const context = this.marketContext;
    const currentPrice = context?.currentPrice || 0;
    const priceChange = context?.priceChange24h || 0;

    const prompt = `Provide trading insights for ${symbol}:
- Current price: $${currentPrice}
- 24h change: ${priceChange > 0 ? '+' : ''}${priceChange}%

Give me:
1. Technical analysis overview
2. Key support/resistance levels
3. Trading recommendations (if any)
4. Risk assessment

Remember to include appropriate disclaimers.`;

    return this.sendMessage(prompt);
  }
}

export const geminiService = new GeminiService();
