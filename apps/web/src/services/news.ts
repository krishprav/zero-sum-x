// News service for fetching cryptocurrency and market news
// This is a mock service - in production, you would integrate with real news APIs

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  relevanceScore: number;
}

export interface NewsAnalysis {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  keyThemes: string[];
  marketImpact: 'high' | 'medium' | 'low';
  confidence: number;
  summary: string;
}

class NewsService {
  private readonly NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
  private readonly CRYPTO_NEWS_API_KEY = process.env.NEXT_PUBLIC_CRYPTO_NEWS_API_KEY || '';

  // Mock news data for demonstration
  private mockNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
      summary: 'Bitcoin surged to new record levels as major corporations announce cryptocurrency integration plans.',
      content: 'Bitcoin has reached unprecedented heights as institutional investors continue to show strong interest in digital assets...',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      url: 'https://coindesk.com/bitcoin-ath-institutional-adoption',
      sentiment: 'positive',
      tags: ['bitcoin', 'institutional', 'adoption', 'price'],
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'Ethereum Network Upgrade Shows Promising Results',
      summary: 'The latest Ethereum network improvements demonstrate enhanced scalability and reduced transaction costs.',
      content: 'Ethereum\'s recent network upgrades have shown significant improvements in transaction throughput and gas efficiency...',
      source: 'Ethereum Foundation',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      url: 'https://ethereum.org/network-upgrade-results',
      sentiment: 'positive',
      tags: ['ethereum', 'upgrade', 'scalability', 'gas'],
      relevanceScore: 0.88
    },
    {
      id: '3',
      title: 'Regulatory Uncertainty Affects Crypto Markets',
      summary: 'Recent regulatory announcements create mixed reactions across cryptocurrency markets.',
      content: 'New regulatory proposals have created uncertainty in cryptocurrency markets, with mixed reactions from industry leaders...',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      url: 'https://reuters.com/crypto-regulatory-uncertainty',
      sentiment: 'negative',
      tags: ['regulation', 'policy', 'uncertainty', 'markets'],
      relevanceScore: 0.82
    },
    {
      id: '4',
      title: 'DeFi Protocols Show Strong Growth in Q4',
      summary: 'Decentralized finance protocols continue to attract significant capital and user adoption.',
      content: 'Decentralized finance platforms have shown remarkable growth in the fourth quarter, with total value locked reaching new heights...',
      source: 'DeFi Pulse',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      url: 'https://defipulse.com/q4-growth-report',
      sentiment: 'positive',
      tags: ['defi', 'growth', 'tvl', 'adoption'],
      relevanceScore: 0.76
    },
    {
      id: '5',
      title: 'Solana Ecosystem Expands with New Partnerships',
      summary: 'Multiple major partnerships announced for the Solana blockchain ecosystem.',
      content: 'Solana has announced several strategic partnerships that will expand its ecosystem and utility...',
      source: 'Solana Labs',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      url: 'https://solana.com/ecosystem-expansion',
      sentiment: 'positive',
      tags: ['solana', 'partnerships', 'ecosystem', 'blockchain'],
      relevanceScore: 0.71
    }
  ];

  async getLatestNews(symbol?: string, limit: number = 10): Promise<NewsArticle[]> {
    try {
      // In production, you would call real news APIs here
      // For now, return filtered mock data
      let filteredNews = this.mockNews;
      
      if (symbol) {
        const symbolLower = symbol.toLowerCase();
        filteredNews = this.mockNews.filter(article => 
          article.tags.some(tag => tag.toLowerCase().includes(symbolLower)) ||
          article.title.toLowerCase().includes(symbolLower)
        );
      }

      // Sort by relevance and recency
      return filteredNews
        .sort((a, b) => {
          const relevanceDiff = b.relevanceScore - a.relevanceScore;
          if (Math.abs(relevanceDiff) < 0.1) {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          }
          return relevanceDiff;
        })
        .slice(0, limit);

    } catch (error) {
      // Handle error silently - fallback data is used
      return [];
    }
  }

  async analyzeNewsSentiment(symbol?: string): Promise<NewsAnalysis> {
    try {
      const news = await this.getLatestNews(symbol, 20);
      
      if (news.length === 0) {
        return {
          overallSentiment: 'neutral',
          keyThemes: [],
          marketImpact: 'low',
          confidence: 0,
          summary: 'No recent news available for analysis.'
        };
      }

      // Analyze sentiment
      const sentiments = news.map(article => article.sentiment);
      const positiveCount = sentiments.filter(s => s === 'positive').length;
      const negativeCount = sentiments.filter(s => s === 'negative').length;
      const neutralCount = sentiments.filter(s => s === 'neutral').length;

      let overallSentiment: NewsAnalysis['overallSentiment'];
      let confidence: number;

      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        overallSentiment = 'bullish';
        confidence = positiveCount / news.length;
      } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        overallSentiment = 'bearish';
        confidence = negativeCount / news.length;
      } else {
        overallSentiment = 'neutral';
        confidence = Math.max(positiveCount, negativeCount, neutralCount) / news.length;
      }

      // Extract key themes
      const allTags = news.flatMap(article => article.tags);
      const tagFrequency = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const keyThemes = Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Determine market impact
      const avgRelevance = news.reduce((sum, article) => sum + article.relevanceScore, 0) / news.length;
      const marketImpact: NewsAnalysis['marketImpact'] = 
        avgRelevance > 0.8 ? 'high' : avgRelevance > 0.6 ? 'medium' : 'low';

      // Generate summary
      const summary = this.generateNewsSummary(news, overallSentiment, keyThemes);

      return {
        overallSentiment,
        keyThemes,
        marketImpact,
        confidence,
        summary
      };

    } catch (error) {
      // Handle error silently - fallback data is used
      return {
        overallSentiment: 'neutral',
        keyThemes: [],
        marketImpact: 'low',
        confidence: 0,
        summary: 'Unable to analyze news sentiment at this time.'
      };
    }
  }

  private generateNewsSummary(news: NewsArticle[], sentiment: NewsAnalysis['overallSentiment'], themes: string[]): string {
    const recentNews = news.slice(0, 3);
    const themesText = themes.slice(0, 3).join(', ');
    
    let sentimentText = '';
    switch (sentiment) {
      case 'bullish':
        sentimentText = 'positive sentiment';
        break;
      case 'bearish':
        sentimentText = 'negative sentiment';
        break;
      default:
        sentimentText = 'mixed sentiment';
    }

    const summary = `Recent market news shows ${sentimentText} with key themes including ${themesText}. ` +
      `Top stories: ${recentNews.map(n => n.title).join('; ')}. ` +
      `This news flow may impact short-term price movements and market sentiment.`;

    return summary;
  }

  // Method to integrate with real news APIs (for future implementation)
  private async fetchFromNewsAPI(symbol?: string): Promise<NewsArticle[]> {
    // Example implementation for NewsAPI.org
    if (this.NEWS_API_KEY) {
      const query = symbol ? `${symbol} cryptocurrency OR bitcoin OR ethereum` : 'cryptocurrency bitcoin ethereum';
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.NEWS_API_KEY}&sortBy=publishedAt&pageSize=20`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data.articles.map((article: any) => ({
          id: article.url,
          title: article.title,
          summary: article.description || '',
          content: article.content || '',
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          sentiment: 'neutral' as const, // Would need sentiment analysis
          tags: this.extractTags(article.title + ' ' + article.description),
          relevanceScore: this.calculateRelevance(article, symbol)
        }));
      } catch (error) {
        // Handle error silently - fallback data is used
        return [];
      }
    }
    
    return [];
  }

  private extractTags(text: string): string[] {
    const cryptoTerms = ['bitcoin', 'ethereum', 'solana', 'defi', 'nft', 'blockchain', 'crypto', 'trading'];
    const tags: string[] = [];
    
    cryptoTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        tags.push(term);
      }
    });
    
    return tags;
  }

  private calculateRelevance(article: any, symbol?: string): number {
    let score = 0.5; // Base relevance
    
    if (symbol) {
      const symbolLower = symbol.toLowerCase();
      const text = (article.title + ' ' + article.description).toLowerCase();
      
      if (text.includes(symbolLower)) {
        score += 0.3;
      }
    }
    
    // Boost for major crypto terms
    const majorTerms = ['bitcoin', 'ethereum', 'crypto', 'blockchain'];
    const text = (article.title + ' ' + article.description).toLowerCase();
    majorTerms.forEach(term => {
      if (text.includes(term)) {
        score += 0.1;
      }
    });
    
    return Math.min(score, 1.0);
  }
}

export const newsService = new NewsService();
