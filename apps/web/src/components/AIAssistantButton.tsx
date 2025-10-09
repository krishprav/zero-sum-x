'use client';

import { useState } from 'react';
import AIChatbot from './AIChatbot';
import { Trade, SYMBOL } from '../types/trading';

interface AIAssistantButtonProps {
  symbol: SYMBOL;
  currentPrice: Trade | null;
  userPositions?: Array<{
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    currentPnL: number;
  }>;
}

export default function AIAssistantButton({ 
  symbol, 
  currentPrice, 
  userPositions = [] 
}: AIAssistantButtonProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center group backdrop-blur-sm"
      >
        {/* AI Icon */}
        <div className="relative">
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          AI Trading Assistant
          <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-4 border-l-black/80 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>

        {/* Notification Badge (optional - can be used for new features) */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </button>

      {/* AI Chatbot Modal */}
      <AIChatbot
        symbol={symbol}
        currentPrice={currentPrice}
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userPositions={userPositions}
      />
    </>
  );
}
