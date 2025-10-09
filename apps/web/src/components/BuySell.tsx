"use client";

import { useState, useEffect, useMemo } from "react";
import { Trade, Order } from '../types/trading';
import { tradeAPI } from '../services/api';
import { toDisplayPrice, toInternalPrice, toDisplayUSD, toInternalUSD, calculatePnlCents } from '../utils/utils';
import { PADDING } from '../utils/constants';

interface BuySellProps {
  symbol: string;
  currentPrice: Trade | null;
  onOrderPlaced: (order: Order) => void;
}

export default function BuySell({ symbol, currentPrice, onOrderPlaced }: BuySellProps) {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [margin, setMargin] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tpEnabled, setTpEnabled] = useState<boolean>(false);
  const [slEnabled, setSlEnabled] = useState<boolean>(false);
  const [tpPrice, setTpPrice] = useState<string>("");
  const [slPrice, setSlPrice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(500000);

  const getLogoPath = (symbol: string) => {
    const logoMap: { [key: string]: string } = {
      'BTC': '/assets/btc.svg',
      'ETH': '/assets/eth.svg',
      'SOL': '/assets/solana.svg',
      'DOGE': '/assets/doge.svg',
      'USDC': '/assets/usdc.svg',
    };
    return logoMap[symbol] || '/assets/btc.svg';
  };

  useEffect(() => {
    const getUserBalance = async () => {
      try {
        const response = await tradeAPI.getUserBalance();
        if (response && response.usd_balance) {
          setUserBalance(response.usd_balance);
        }
      } catch (err) {
        // Silently handle error - fallback data is used
      }
    };

    getUserBalance();
    const balanceIntervalId = setInterval(getUserBalance, 10000);

    return () => {
      clearInterval(balanceIntervalId);
    };
  }, []);

  const estimatedTpPnlInCents = useMemo(() => {
    if (!tpEnabled || !tpPrice || Number(tpPrice) <= 0 || !currentPrice) return 0;

    const openPriceForCalc = activeTab === "buy" 
      ? toInternalPrice(currentPrice.askPrice) 
      : toInternalPrice(currentPrice.bidPrice);
    const closePriceForCalc = toInternalPrice(Number(tpPrice));
    const marginForCalc = margin * 100;

    return calculatePnlCents({
      side: activeTab,
      openPrice: openPriceForCalc,
      closePrice: closePriceForCalc,
      marginCents: marginForCalc,
      leverage: leverage,
    });
  }, [tpEnabled, tpPrice, activeTab, currentPrice, margin, leverage]);

  const estimatedSlPnlInCents = useMemo(() => {
    if (!slEnabled || !slPrice || Number(slPrice) <= 0 || !currentPrice) return 0;

    const openPriceForCalc = activeTab === "buy" 
      ? toInternalPrice(currentPrice.askPrice) 
      : toInternalPrice(currentPrice.bidPrice);
    const closePriceForCalc = toInternalPrice(Number(slPrice));
    const marginForCalc = margin * 100;

    return calculatePnlCents({
      side: activeTab,
      openPrice: openPriceForCalc,
      closePrice: closePriceForCalc,
      marginCents: marginForCalc,
      leverage: leverage,
    });
  }, [slEnabled, slPrice, activeTab, currentPrice, margin, leverage]);

  const handleSubmitTrade = async () => {
    if (margin <= 0) {
      setError("Margin must be greater than 0");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (margin > toDisplayUSD(userBalance)) {
      setError("Insufficient balance");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const orderData = {
        symbol,
        side: activeTab,
        type: orderType,
        quantity: 1,
        price: orderType === 'limit' ? parseFloat(tpPrice || '0') : undefined,
        margin: toInternalUSD(margin),
        leverage,
        tpEnabled,
        tpPrice: tpEnabled ? tpPrice : undefined,
        slEnabled,
        slPrice: slEnabled ? slPrice : undefined,
      };

      const result = await tradeAPI.createOrder(orderData);

      if (result.orderId) {
        setSuccess(`Order placed successfully!`);
        setTimeout(() => setSuccess(""), 3000);

        const balanceResponse = await tradeAPI.getUserBalance();
        if (balanceResponse && balanceResponse.usd_balance) {
          setUserBalance(balanceResponse.usd_balance);
        }

        onOrderPlaced({
          id: result.orderId,
          symbol: symbol as any,
          side: activeTab,
          type: orderType,
          quantity: 1,
          price: orderType === 'limit' ? parseFloat(tpPrice || '0') : (activeTab === 'buy' ? currentPrice?.askPrice || 0 : currentPrice?.bidPrice || 0),
          status: 'open',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("Failed to place order");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const askPrice = currentPrice ? toDisplayPrice(currentPrice.askPrice) : 0;
  const bidPrice = currentPrice ? toDisplayPrice(currentPrice.bidPrice) : 0;

  return (
        <aside
          className="bg-slate-900 w-full rounded-2xl text-white h-full flex flex-col border border-slate-700"
          aria-label="Trade ticket"
        >
      <div className="flex rounded-2xl overflow-hidden relative z-10">
        <button
          onClick={() => setActiveTab("buy")}
          className={`flex-1 py-2 text-center font-bold text-sm dock-focus transition-all duration-200 ${
            activeTab === "buy" 
              ? "text-white bg-white/15 border-white/20" 
              : "text-white/70 hover:text-white hover:bg-white/8"
          } rounded-l-2xl text-premium`}
        >
          Buy {symbol}
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`flex-1 py-2 text-center font-bold text-sm dock-focus transition-all duration-200 ${
            activeTab === "sell" 
              ? "text-white bg-white/15 border-white/20" 
              : "text-white/70 hover:text-white hover:bg-white/8"
          } rounded-r-2xl text-premium`}
        >
          Sell {symbol}
        </button>
      </div>

      <div className={`${PADDING.container.sm} flex-1 overflow-y-auto`}>
            <header className="mb-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white text-premium">
                  {activeTab === "buy" ? "Buy Order" : "Sell Order"}
                </h2>
                  <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-2xl border border-green-500/30  font-semibold">
                    DEMO
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl border border-white/20 bg-white/10  px-4 py-1.5 text-xs text-white font-medium ">
                    {orderType === "market" ? "Market" : "Limit"}
                  </span>
                  <div className="text-right">
                    <div className="text-white/70 text-xs">Demo Balance:</div>
                    <div className="text-white font-bold text-sm">
                      ${toDisplayUSD(userBalance).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              <div className={`flex items-center ${PADDING.gap.sm} ${PADDING.component.sm} rounded-2xl border border-white/8  relative overflow-hidden`} style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)',
                transform: 'translateZ(0)'
              }}>
                <div className="h-8 w-8 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={getLogoPath(symbol)} 
                    alt={`${symbol} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-lg font-bold text-white text-premium">
                    {symbol}
                  </div>
                  <div className="text-sm text-white/70 font-medium">{symbol}/USDT</div>
                </div>
              </div>
        </header>

            <section className={`grid grid-cols-2 ${PADDING.gap.md} mt-2`} aria-label="Prices">
              <div className={`rounded-2xl border border-white/8 ${PADDING.component.sm} relative overflow-hidden `} style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,0,0,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)',
                transform: 'translateZ(0)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Sell Price</div>
                  <div className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-2xl font-semibold border border-red-500/30 " style={{ backgroundColor: 'rgba(255,0,0,0.2)', color: '#ff0000', borderColor: 'rgba(255,0,0,0.3)' }}>
                    SELL
                  </div>
                </div>
                <div className="mt-2 text-base font-bold text-white flex items-center text-premium">
                  <span className="text-sm mr-1">$</span>
                  {bidPrice.toFixed(2)}
                </div>
                <div className="absolute w-1 h-full bg-red-500/40 left-0 top-0 " style={{ backgroundColor: '#ff0000' }}></div>
              </div>
              <div className={`rounded-2xl border border-white/8 ${PADDING.component.sm} relative overflow-hidden `} style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(0,255,0,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)',
                transform: 'translateZ(0)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Buy Price</div>
                  <div className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-2xl font-semibold border border-green-500/30 " style={{ backgroundColor: 'rgba(0,255,0,0.2)', color: '#00ff00', borderColor: 'rgba(0,255,0,0.3)' }}>
                    BUY
                  </div>
                </div>
                <div className="mt-2 text-base font-bold text-white flex items-center text-premium">
                  <span className="text-sm mr-1">$</span>
                  {askPrice.toFixed(2)}
                </div>
                <div className="absolute w-1 h-full bg-green-500/40 left-0 top-0 " style={{ backgroundColor: '#00ff00' }}></div>
              </div>
            </section>

        <section className="mt-4" aria-label="Risk indicator">
          <div className={`border border-white/8 rounded-2xl ${PADDING.component.sm}  relative overflow-hidden`} style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)'
          }}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/70"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span className="text-white/70">Risk Level</span>
              </div>
              <span className="font-medium text-green-400 bg-green-500/20 px-3 py-1 rounded-2xl text-xs border border-green-500/30 " style={{ color: '#00ff00', backgroundColor: 'rgba(0,255,0,0.2)', borderColor: 'rgba(0,255,0,0.3)' }}>
                LOW
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-2xl bg-white/10 overflow-hidden ">
              <div
                className="h-2 rounded-2xl bg-green-500/60 "
                style={{ width: "25%", backgroundColor: '#00ff00' }}
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        <section className="mt-2" aria-label="Order type">
          <div className={`border border-white/8 rounded-2xl ${PADDING.component.sm}  relative overflow-hidden`} style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 font-medium text-sm">Order Type</span>
            </div>
            <div className={`flex items-center ${PADDING.gap.sm}`}>
              <button
                type="button"
                className={`keycap flex-1 rounded-2xl border ${
                  orderType === "market"
                    ? activeTab === "buy" 
                      ? "keycap--green border-green-500/30 bg-green-500/10 text-white "
                      : "keycap--red border-red-500/30 bg-red-500/10 text-white "
                    : "border-white/20 text-white/70 bg-white/5"
                } py-3 px-4 text-sm font-semibold`}
                onClick={() => setOrderType("market")}
                disabled={isSubmitting}
                style={{
                  background: orderType === "market" 
                    ? activeTab === "buy" 
                      ? 'linear-gradient(135deg, rgba(0,255,0,0.2), rgba(0,255,0,0.05))'
                      : 'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,0,0,0.05))'
                    : 'transparent'
                }}
              >
                Market
              </button>
              <button
                type="button"
                className={`keycap flex-1 rounded-2xl border ${
                  orderType === "limit"
                    ? activeTab === "buy" 
                      ? "keycap--green border-green-500/30 bg-green-500/10 text-white "
                      : "keycap--red border-red-500/30 bg-red-500/10 text-white "
                    : "border-white/20 text-white/70 bg-white/5"
                } py-3 px-4 text-sm font-semibold`}
                onClick={() => setOrderType("limit")}
                disabled={isSubmitting}
                style={{
                  background: orderType === "limit" 
                    ? activeTab === "buy" 
                      ? 'linear-gradient(135deg, rgba(0,255,0,0.2), rgba(0,255,0,0.05))'
                      : 'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,0,0,0.05))'
                    : 'transparent'
                }}
              >
                Limit
              </button>
            </div>
          </div>
        </section>

        <section className={`mt-3 border border-white/8 rounded-2xl ${PADDING.component.xs}  relative overflow-hidden`} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), ',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/60"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <label htmlFor="margin" className="text-xs text-white/60">
                Trading Margin
              </label>
            </div>
            <span className="text-[10px] text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded-2xl border border-neutral-700/50">
              ${margin} USD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease margin"
              className="rounded-2xl border border-white/5 px-3 py-1.5 text-xs text-white/80 bg-white/2  "
              onClick={() => setMargin((prev) => Math.max(10, prev - 10))}
              disabled={isSubmitting}
            >
              −
            </button>
            <div className="w-full relative">
              <div className="absolute left-0 top-0 h-full px-2 flex items-center">
                <span className="text-xs text-white/50">$</span>
              </div>
              <input
                id="margin"
                name="margin"
                type="number"
                min={10}
                step={10}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-neutral-700/50 bg-neutral-800/50  pl-6 pr-2 py-1.5 text-xs outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <button
              type="button"
              aria-label="Increase margin"
              className="rounded-2xl border border-white/5 px-3 py-1.5 text-xs text-white/80 bg-white/2  "
              onClick={() => setMargin((prev) => prev + 10)}
              disabled={isSubmitting}
            >
              +
            </button>
          </div>

          <div className="mt-2 h-1 w-full bg-[#263136] rounded-2xl overflow-hidden ">
            <div
              className="h-full bg-white/20 shadow-lg shadow-white/10"
              style={{
                width: `${Math.min(100, (margin / toDisplayUSD(userBalance)) * 100)}%`,
              }}
            ></div>
          </div>
        </section>

        <section className={`mt-3 border border-white/8 rounded-2xl ${PADDING.component.xs}  relative overflow-hidden`} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), ',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/60"
              >
                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                <polygon points="12 15 17 21 7 21 12 15"></polygon>
              </svg>
              <label className="text-xs text-white/60">Leverage</label>
            </div>
            <div className="flex items-center">
              <div className="text-xs text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded-2xl mr-1 border border-neutral-700/50">
                <span className="text-white/70 font-medium">{leverage}x</span>
              </div>
              <div className="text-[10px] text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded-2xl border border-neutral-700/50">
                ${(margin * leverage).toLocaleString("en-US")}
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-5 ${PADDING.gap.sm}`}>
            {[1, 2, 5, 10, 20].map((lev) => (
              <button
                key={lev}
                type="button"
                className={`rounded-2xl border relative overflow-hidden ${
                  leverage === lev
                    ? "border-white/20 bg-white/15 text-white shadow-lg shadow-black/10"
                    : "border-white/5 text-white/70 bg-white/2"
                } px-3 py-2 text-xs`}
                onClick={() => setLeverage(lev)}
                disabled={isSubmitting}
              >
                {leverage === lev && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/30 shadow-lg shadow-white/10"></div>
                )}
                {lev}x
              </button>
            ))}
          </div>
        </section>

        <div className="mt-3 space-y-2">
          <div className="border border-white/8 rounded-2xl p-2  relative overflow-hidden" style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)'
          }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/60"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <label htmlFor="tp-toggle" className="text-xs text-white/60">
                  Take Profit
                </label>
                <span className="bg-neutral-800/50 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded-2xl border border-neutral-700/50">
                  Recommended
                </span>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="tp-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={tpEnabled}
                    onChange={(e) => setTpEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-2xl peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 after:border after:rounded-2xl after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-white/20"></div>
                </label>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 h-full px-2 flex items-center">
                <span className="text-xs text-white/50">$</span>
              </div>
              <input
                id="tp-price"
                name="tp"
                type="number"
                step="0.01"
                placeholder="Target Price"
                disabled={!tpEnabled}
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                className={`
                  w-full rounded-2xl border border-neutral-700/50 bg-neutral-800/50  pl-6 pr-2 py-1.5 text-xs outline-none 
                  ${
                    tpEnabled
                      ? "focus:border-white/20 transition-colors"
                      : "opacity-50"
                  }
                `}
              />
            </div>

            {tpEnabled && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="text-[10px] text-white/50">
                      Est. Profit:
                    </div>
                  </div>
                  <div
                    className={`text-[10px] px-1.5 py-0.5 rounded-2xl border border-neutral-700/50 ${
                      estimatedTpPnlInCents > 0
                        ? "text-neutral-400 bg-neutral-800/50"
                        : "text-neutral-400 bg-neutral-800/50"
                    }`}
                  >
                    {estimatedTpPnlInCents >= 0 ? "+$" : "-$"}
                    {toDisplayUSD(Math.abs(estimatedTpPnlInCents)).toFixed(2)}
                  </div>
                </div>
                <div className="text-[10px] text-white/40">
                  Target: ${tpPrice} | Current: $
                  {activeTab === "buy" ? askPrice.toFixed(2) : bidPrice.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="border border-white/8 rounded-2xl p-2  relative overflow-hidden" style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005), rgba(255,255,255,0.002)),
                  linear-gradient(45deg, rgba(255,255,255,0.005), transparent)
                `,
                boxShadow: `
                  0 8px 30px rgba(0, 0, 0, 0.2),
                  0 4px 15px rgba(0, 0, 0, 0.1),
                  0 0 0 0.5px rgba(255,255,255,0.03),
,
                  inset 0 -1px 0 rgba(255,255,255,0.005)
                `,
                border: '0.5px solid rgba(255,255,255,0.03)'
          }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/60"
                >
                  <path d="M10 16l-6-6 6-6"></path>
                  <path d="M20 21v-7a4 4 0 0 0-4-4H5"></path>
                </svg>
                <label htmlFor="sl-toggle" className="text-xs text-white/60">
                  Stop Loss
                </label>
                <span className="bg-neutral-800/50 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded-2xl border border-neutral-700/50">
                  Risk Protection
                </span>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="sl-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={slEnabled}
                    onChange={(e) => setSlEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-2xl peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 after:border after:rounded-2xl after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-white/20"></div>
                </label>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 h-full px-2 flex items-center">
                <span className="text-xs text-white/50">$</span>
              </div>
              <input
                id="sl-price"
                name="sl"
                type="number"
                step="0.01"
                placeholder="Stop Price"
                disabled={!slEnabled}
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                className={`
                  w-full rounded-2xl border border-neutral-700/50 bg-neutral-800/50  pl-6 pr-2 py-1.5 text-xs outline-none 
                  ${
                    slEnabled
                      ? "focus:border-white/20 transition-colors"
                      : "opacity-50"
                  }
                `}
              />
            </div>

            {slEnabled && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="text-[10px] text-white/50">Est. Loss:</div>
                  </div>
                  <div
                    className={`text-[10px] px-1.5 py-0.5 rounded-2xl border border-neutral-700/50 ${
                      estimatedSlPnlInCents < 0
                        ? "text-neutral-400 bg-neutral-800/50"
                        : "text-neutral-400 bg-neutral-800/50"
                    }`}
                  >
                    {estimatedSlPnlInCents > 0 ? "+$" : "-$"}
                    {toDisplayUSD(Math.abs(estimatedSlPnlInCents)).toFixed(2)}
                  </div>
                </div>
                <div className="text-[10px] text-white/40">
                  Stop: ${slPrice} | Current: $
                  {activeTab === "buy" ? askPrice.toFixed(2) : bidPrice.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-2 p-1 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl text-neutral-400 text-[10px]">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-2 p-1 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl text-neutral-400 text-[10px]">
            {success}
          </div>
        )}

        <button
          className={`keycap mt-2 w-full rounded-2xl py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden ${
            activeTab === "buy"
              ? "keycap--green text-white border border-white/30"
              : "keycap--red text-white border border-white/30"
          } ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
          aria-label={
            activeTab === "buy" ? "Place buy order" : "Place sell order"
          }
          onClick={handleSubmitTrade}
          disabled={isSubmitting}
          style={{
            background: activeTab === "buy" 
              ? 'linear-gradient(135deg, rgba(0,255,0,0.3), rgba(0,255,0,0.1))'
              : 'linear-gradient(135deg, rgba(255,0,0,0.3), rgba(255,0,0,0.1))',
            boxShadow: activeTab === "buy" 
              ? '0 4px 12px rgba(0,255,0,0.2), 0 0 0 1px rgba(0,255,0,0.1)'
              : '0 4px 12px rgba(255,0,0,0.2), 0 0 0 1px rgba(255,0,0,0.1)'
          }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              {activeTab === "buy" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5"></path>
                  <path d="M5 12l7 7 7-7"></path>
                </svg>
              )}
              <span>
                {activeTab === "buy" ? "Buy" : "Sell"} {symbol}
              </span>
            </>
          )}
        </button>

        <div className="mt-2 p-1.5 rounded-2xl border border-white/3 shadow-lg shadow-black/15" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), ',
          border: '0.5px solid rgba(255,255,255,0.03)'
        }}>
          <div className="flex items-center gap-1.5 justify-center">
            {orderType === "market" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            )}
            <p className="text-center text-[10px] text-white/70" style={{ fontFamily: 'SF Pro Display, sans-serif' }}>
              {orderType === "market"
                ? "Instant execution at market price."
                : "Order will trigger when price meets condition."}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}