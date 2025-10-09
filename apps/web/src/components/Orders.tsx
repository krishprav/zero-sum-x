'use client';

import { useState, useEffect } from 'react';
import { Order } from '../types/trading';
import { tradeAPI } from '../services/api';
import { toDisplayPrice, toDisplayUSD } from '../utils/utils';
import { PADDING } from '../utils/constants';

interface OrdersProps {
  onOrderClosed: (orderId: string) => void;
}

export default function Orders({ onOrderClosed }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const userOrders = await tradeAPI.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      // Silently handle error - fallback data is used
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseOrder = async (orderId: string) => {
    try {
      await tradeAPI.closeOrder(orderId, 'manual');
      setOrders(orders.filter(order => order.id !== orderId));
      onOrderClosed(orderId);
    } catch (error) {
      // Handle error silently - fallback data is used
      alert('Failed to close order. Please try again.');
    }
  };

  const openOrders = orders.filter(order => order.status === 'open');
  const historyOrders = orders.filter(order => order.status !== 'open');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPnl = (pnl?: number) => {
    if (pnl === undefined) return '-';
    const displayPnl = toDisplayUSD(pnl);
    return (
      <span className={displayPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
        {displayPnl >= 0 ? '+' : ''}${displayPnl.toFixed(2)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-900 border border-slate-700 rounded-3xl ${PADDING.container.lg}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
        </div>
      </div>
    );
  }

  return (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden h-full w-full flex flex-col relative">
      <div className={`flex items-center justify-between ${PADDING.container.sm} border-b border-white/10`}>
        <div>
          <h2 className="text-base font-bold text-white text-premium">Orders</h2>
          <div className="text-sm text-neutral-400 font-medium">
            Trading History
          </div>
        </div>
      </div>
      <div className={`${PADDING.container.sm} flex-1 overflow-y-auto`}>
        <div className={`flex ${PADDING.gap.md} mb-2`}>
          <button
            onClick={() => setActiveTab('open')}
            className={`keycap keycap--subtle flex-1 py-1.5 px-3 rounded-l-2xl font-semibold text-sm ${
              activeTab === 'open'
                ? 'bg-white/10 text-white border border-white/20 '
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Open ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`keycap keycap--subtle flex-1 py-1.5 px-3 rounded-r-2xl font-semibold text-sm ${
              activeTab === 'history'
                ? 'bg-white/10 text-white border border-white/20 '
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            History ({historyOrders.length})
          </button>
        </div>

        <div className={`space-y-${PADDING.gap.sm}`}>
          {(activeTab === 'open' ? openOrders : historyOrders).map((order) => (
                <div key={order.id} className={`bg-white/2  border border-white/5 rounded-2xl ${PADDING.component.sm} `} style={{
                  background: `
                    linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                    linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                  `,
                  backdropFilter: 'blur(40px) saturate(150%)',
                  boxShadow: `
                    0 8px 30px rgba(0, 0, 0, 0.2),
                    0 4px 15px rgba(0, 0, 0, 0.1),
                    0 0 0 0.5px rgba(255,255,255,0.03),
                    inset 0 1px 0 rgba(255,255,255,0.02),
                    inset 0 -1px 0 rgba(255,255,255,0.005)
                  `,
                  border: '0.5px solid rgba(255,255,255,0.03)',
                  transform: 'translateZ(0)'
                }}>
              <div className={`flex items-center justify-between mb-4`}>
                <div className={`flex items-center ${PADDING.gap.sm}`}>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                    order.side === 'buy'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 '
                      : 'bg-red-500/20 text-red-400 border border-red-500/30 '
                  }`}>
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-white font-bold text-sm text-premium">{order.symbol}</span>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                    order.status === 'open'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 '
                      : order.status === 'filled'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 '
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 '
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                {order.status === 'open' && (
                  <button
                    onClick={() => handleCloseOrder(order.id)}
                    className="keycap px-4 py-2 bg-white/10 text-white text-sm rounded-xl   border border-white/20 font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 ${PADDING.gap.md} text-sm`}>
                <div>
                  <span className="text-neutral-400 text-xs font-medium">Quantity:</span>
                  <div className="text-white font-bold text-premium">{order.quantity}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-medium">Price:</span>
                  <div className="text-white font-bold text-premium">${toDisplayPrice(order.price).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-medium">Type:</span>
                  <div className="text-white font-bold text-premium">{order.type}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-medium">PnL:</span>
                  <div className="font-bold text-premium">{formatPnl(order.pnl)}</div>
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t border-neutral-700`}>
                <span className="text-neutral-400 text-sm">
                  Created: {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          ))}

              {(activeTab === 'open' ? openOrders : historyOrders).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-neutral-800/50 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neutral-400"
                    >
                      <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
                    </svg>
                  </div>
                  <div className="text-neutral-300 text-lg font-medium mb-2">
                    No {activeTab === 'open' ? 'open' : 'historical'} orders
                  </div>
                  <div className="text-neutral-500 text-sm max-w-xs mx-auto">
                    {activeTab === 'open'
                      ? 'Start trading by placing your first order using the buy/sell panel'
                      : 'Your completed orders will appear here once you start trading'
                    }
                  </div>
                  {activeTab === 'open' && (
                    <div className="mt-4">
                      <div className={`inline-flex items-center ${PADDING.gap.sm} ${PADDING.component.sm} bg-white/5 border border-white/10 rounded-2xl text-white text-sm  `}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14"></path>
                          <path d="M19 12l-7-7-7 7"></path>
                        </svg>
                        Place your first order
                      </div>
                    </div>
                  )}
                </div>
              )}
        </div>
      </div>
    </div>
  );
}