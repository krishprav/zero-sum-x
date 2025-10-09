'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi } from 'lightweight-charts';
import { PADDING } from '../utils/constants';

interface ChartProps {
  symbol: string;
  data?: Array<{ time: number; open: number; high: number; low: number; close: number; volume?: number }>;
  height?: number;
  selectedTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  onPriceUpdate?: (prices: { bidPrice: number; askPrice: number }) => void;
}

export default function Chart({
  symbol,
  data = [],
  height = 400,
  selectedTimeframe = '1h',
  onTimeframeChange,
  onPriceUpdate,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      autoSize: false,
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(0,0,0,0)' },
        textColor: 'rgba(255,255,255,0.8)',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 6,
        minBarSpacing: 0.5,
        rightOffset: 5,
        fixLeftEdge: true,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      crosshair: {
        mode: 0,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

      chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({
        width: containerRef.current?.clientWidth || undefined,
        height: containerRef.current?.clientHeight || height,
      });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (data.length > 0) {
      const maxRaw = Math.max(...data.map((d) => d.high));
      const scaleFactor = maxRaw > 1_000_000 ? 10_000 : 1;

      // Sort data by time to ensure continuity
      const sortedData = [...data].sort((a, b) => a.time - b.time);

      // Ensure proper time format for lightweight-charts (Unix timestamp in seconds)
      const formattedData = sortedData.map((d) => {
        let time = d.time;
        // Convert to seconds if in milliseconds
        if (typeof time === 'number' && time > 10_000_000_000) {
          time = Math.floor(time / 1000);
        }
        return {
          time: time as any,
          open: d.open / scaleFactor,
          high: d.high / scaleFactor,
          low: d.low / scaleFactor,
          close: d.close / scaleFactor,
        };
      });

      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  useEffect(() => {
    if (!onPriceUpdate || !data || data.length === 0) return;
    const maxRaw = Math.max(...data.map((d) => d.high));
    const scaleFactor = maxRaw > 1_000_000 ? 10_000 : 1;
    const last = data[data.length - 1]!;
    onPriceUpdate({ bidPrice: last.close / scaleFactor, askPrice: last.close / scaleFactor });
  }, [data, onPriceUpdate]);

      return (
    <div className="w-full h-full">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden h-full w-full flex flex-col relative">
        <div className={`flex items-center justify-between ${PADDING.container.sm} border-b border-white/10`}>
          <div>
            <h2 className="text-lg font-bold text-white text-premium">{symbol}</h2>
            <div className="text-sm text-neutral-400 font-medium">Live Chart</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 border border-slate-600 flex items-center rounded-2xl overflow-hidden">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf, idx, arr) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange?.(tf)}
                  className={`px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    selectedTimeframe === tf ? 'text-white bg-white/15 border-white/20' : 'text-white/70 hover:text-white hover:bg-white/8'
                  } ${idx === 0 ? 'rounded-l-2xl' : idx === arr.length - 1 ? 'rounded-r-2xl' : ''}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-grow min-h-0">
          <div ref={containerRef} className="h-full w-full min-h-[300px]" style={{ minHeight: '300px' }} />
        </div>
      </div>
    </div>
  );
}