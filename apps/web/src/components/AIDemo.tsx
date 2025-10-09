'use client';

import { useState } from 'react';
import { geminiService } from '../services/gemini';
import { newsService, NewsArticle } from '../services/news';
import { SYMBOL } from '../types/trading';

interface AIDemoProps {
  symbol: SYMBOL;
  currentPrice: number;
}

export default function AIDemo({ symbol, currentPrice }: AIDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [demoResponse, setDemoResponse] = useState<string>('');
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [showNews, setShowNews] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const runDemo = async () => {
    setIsLoading(true);
    setDemoResponse('');
    
    try {
      // Simulate AI analysis
      const demoAnalysis = `
🤖 **AI Trading Assistant Demo**

**Current Market Analysis for ${symbol}:**
- Price: $${currentPrice.toLocaleString()}
- Trend: ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'}
- Volatility: ${(Math.random() * 10 + 5).toFixed(1)}%

**Key Insights:**
• Market sentiment is ${Math.random() > 0.5 ? 'positive' : 'mixed'}
• Technical indicators suggest ${Math.random() > 0.5 ? 'upward' : 'sideways'} momentum
• Volume analysis shows ${Math.random() > 0.5 ? 'increased' : 'normal'} trading activity

**Trading Considerations:**
• Risk Level: ${Math.random() > 0.5 ? 'Medium' : 'High'}
• Support Level: $${(currentPrice * 0.95).toLocaleString()}
• Resistance Level: $${(currentPrice * 1.05).toLocaleString()}

**Recommendations:**
${Math.random() > 0.5 ? 
  '• Consider taking long positions on pullbacks\n• Set stop-loss at support level\n• Monitor volume for confirmation' :
  '• Wait for clearer market direction\n• Consider hedging strategies\n• Monitor news flow closely'
}

⚠️ **Disclaimer:** This is demo data for educational purposes. Always do your own research and never invest more than you can afford to lose.
      `;
      
      // Simulate typing effect
      for (let i = 0; i < demoAnalysis.length; i++) {
        setDemoResponse(demoAnalysis.slice(0, i + 1));
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
    } catch (error) {
      setDemoResponse('Error running demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewsDemo = async () => {
    setIsLoading(true);
    try {
      const news = await newsService.getLatestNews(symbol, 5);
      setNewsData(news);
      setShowNews(true);
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dock-container rounded-3xl p-6" style={{
      background: `
        linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01), rgba(255,255,255,0.005)),
        linear-gradient(45deg, rgba(255,255,255,0.01), transparent)
      `,
      backdropFilter: 'blur(80px) saturate(200%) brightness(120%)',
      boxShadow: `
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 10px 30px rgba(0, 0, 0, 0.15),
        0 0 0 0.5px rgba(255,255,255,0.05),
        inset 0 1px 0 rgba(255,255,255,0.03),
        inset 0 -1px 0 rgba(255,255,255,0.01)
      `,
      border: '0.5px solid rgba(255,255,255,0.05)'
    }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-xl">AI Trading Assistant</h3>
          <p className="text-neutral-400 text-sm">Powered by Gemini AI with News Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo Controls */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-lg">Demo Features</h4>
          
          <button
            onClick={runDemo}
            disabled={isLoading}
            className="w-full p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-2xl text-blue-400 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isLoading ? 'Running Analysis...' : 'Run AI Analysis Demo'}
          </button>

          <button
            onClick={loadNewsDemo}
            disabled={isLoading}
            className="w-full p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-2xl text-green-400 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {isLoading ? 'Loading News...' : 'Load News Analysis'}
          </button>

          <button
            onClick={async () => {
              setIsLoading(true);
              setConnectionStatus('Testing connection...');
              const isConnected = await geminiService.testConnection();
              setConnectionStatus(isConnected ? '✅ Connection successful!' : '❌ Connection failed. Check console for details.');
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-2xl text-purple-400 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isLoading ? 'Testing...' : 'Test AI Connection'}
          </button>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h5 className="text-white font-medium mb-2">Features Include:</h5>
            <ul className="text-neutral-300 text-sm space-y-1">
              <li>• Real-time market analysis</li>
              <li>• News sentiment evaluation</li>
              <li>• Trading recommendations</li>
              <li>• Risk assessment</li>
              <li>• Portfolio integration</li>
            </ul>
          </div>
        </div>

        {/* Demo Results */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-lg">Demo Results</h4>
          
          {demoResponse && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-h-96 overflow-y-auto">
              <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                {demoResponse}
              </pre>
            </div>
          )}

          {showNews && newsData.length > 0 && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-h-96 overflow-y-auto">
              <h5 className="text-white font-medium mb-3">Latest News:</h5>
              <div className="space-y-3">
                {newsData.map((article) => (
                  <div key={article.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <h6 className="text-white font-medium text-sm mb-1">{article.title}</h6>
                    <p className="text-neutral-400 text-xs mb-2">{article.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-xs">{article.source}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        article.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        article.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-neutral-500/20 text-neutral-400'
                      }`}>
                        {article.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connectionStatus && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
              <h5 className="text-white font-medium mb-2">Connection Status:</h5>
              <p className="text-sm text-neutral-300">{connectionStatus}</p>
            </div>
          )}

          {!demoResponse && !showNews && !connectionStatus && (
            <div className="p-8 text-center text-neutral-400">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <p>Click the demo buttons to see AI features in action!</p>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
        <h5 className="text-blue-400 font-medium mb-2">🚀 To Enable Full AI Features:</h5>
        <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
          <li>Get a Gemini API key from Google AI Studio</li>
          <li>Add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file</li>
          <li>Restart the development server</li>
          <li>Click the floating AI button in the trading interface!</li>
        </ol>
      </div>
    </div>
  );
}
