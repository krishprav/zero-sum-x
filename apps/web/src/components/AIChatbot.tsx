'use client';

import { useState, useEffect, useRef } from 'react';
import { geminiService, ChatMessage, MarketContext } from '../services/gemini';
import { Trade, SYMBOL } from '../types/trading';
import { PADDING } from '../utils/constants';

interface AIChatbotProps {
  symbol: SYMBOL;
  currentPrice: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  userPositions?: Array<{
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    currentPnL: number;
  }>;
}

export default function AIChatbot({ 
  symbol, 
  currentPrice, 
  isOpen, 
  onClose, 
  userPositions = [] 
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update market context when props change
  useEffect(() => {
    if (currentPrice) {
      const marketContext: MarketContext = {
        currentSymbol: symbol,
        currentPrice: currentPrice.bidPrice / 10000, // Convert from internal format
        priceChange24h: Math.random() * 10 - 5, // Mock 24h change for now
        marketTrend: Math.random() > 0.5 ? 'bullish' : 'bearish',
        userPositions
      };
      geminiService.setMarketContext(marketContext);
    }
  }, [symbol, currentPrice, userPositions]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await geminiService.sendMessage(message);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      // Handle error silently - fallback response is used
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'news') {
      // Use the enhanced news analysis directly
      setIsLoading(true);
      setIsTyping(true);
      
      try {
        const response = await geminiService.analyzeMarketNews(symbol);
        setMessages(prev => [...prev, response]);
      } catch (error) {
        // Handle error silently - fallback response is used
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error analyzing the news. Please try again.',
          timestamp: new Date(),
          type: 'news-summary'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
      return;
    }

    let message = '';
    switch (action) {
      case 'analyze':
        message = `Analyze the current market situation for ${symbol}. What are the key factors I should consider?`;
        break;
      case 'predict':
        message = `Based on current market conditions, what's your outlook for ${symbol} in the short term?`;
        break;
      case 'advice':
        message = `What trading advice do you have for someone looking at ${symbol} right now?`;
        break;
    }
    if (message) {
      await handleSendMessage(message);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'market-analysis':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'news-summary':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'trading-advice':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="dock-container w-full max-w-4xl h-[80vh] flex flex-col rounded-3xl overflow-hidden" style={{
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Trading Assistant</h2>
              <p className="text-neutral-400 text-sm">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            {[
              { 
                key: 'analyze', 
                label: 'Market Analysis', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                key: 'news', 
                label: 'Latest News', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                )
              },
              { 
                key: 'predict', 
                label: 'Price Prediction', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { 
                key: 'advice', 
                label: 'Trading Advice', 
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              }
            ].map((action) => (
              <button
                key={action.key}
                onClick={() => handleQuickAction(action.key)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-neutral-400 py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to AI Trading Assistant</h3>
              <p className="text-sm">Ask me about market analysis, news, or trading strategies!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-green-600'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <div className="text-white text-sm">{getMessageTypeIcon(message.type)}</div>
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <div className={`text-sm ${
                      message.role === 'user' ? 'text-blue-100' : 'text-white'
                    } whitespace-pre-wrap`}>
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-300' : 'text-neutral-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder="Ask about market analysis, news, or trading strategies..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:opacity-50 text-white rounded-2xl font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
