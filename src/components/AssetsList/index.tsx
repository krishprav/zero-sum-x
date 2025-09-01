"use client";

import React from "react";
import { useTradingStore } from "../../store/tradingStore";
import { formatPrice, formatPercentage, calculateSpread } from "../../utils/priceUtils";
import { TrendingUp, TrendingDown } from "lucide-react";

export const AssetsList: React.FC = () => {
  const { assets, selectedAsset, setSelectedAsset } = useTradingStore();

  const handleAssetSelect = (symbol: string) => {
    setSelectedAsset(symbol);
  };

  if (assets.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff'
          }}>Available Assets</h3>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #333',
            borderTop: '4px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#888' }}>Loading assets...</span>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff'
        }}>Available Assets</h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#888',
          marginBottom: '10px'
        }}>
          <span>Price</span>
          <span>24h Change</span>
          <span>Spread</span>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 20px'
      }}>
        {assets.map((asset) => {
          const spread = calculateSpread(asset.buyPrice, asset.sellPrice, asset.decimals);
          const isSelected = selectedAsset === asset.symbol;
          
          return (
            <div
              key={asset.symbol}
              style={{
                background: isSelected ? '#1a1a1a' : '#111',
                border: isSelected ? '1px solid #00ff88' : '1px solid #333',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleAssetSelect(asset.symbol)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {asset.symbol === 'BTC' ? '₿' : asset.symbol === 'ETH' ? 'Ξ' : '◎'}
                  </span>
                </div>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>{asset.name}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#888'
                  }}>{asset.symbol}/USD</div>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Buy:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#00ff88' }}>
                    {formatPrice(asset.buyPrice, asset.decimals)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Sell:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#ff4444' }}>
                    {formatPrice(asset.sellPrice, asset.decimals)}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {asset.change24h >= 0 ? (
                    <TrendingUp style={{ width: '14px', height: '14px', color: '#00ff88' }} />
                  ) : (
                    <TrendingDown style={{ width: '14px', height: '14px', color: '#ff4444' }} />
                  )}
                  <span style={{
                    color: asset.change24h >= 0 ? '#00ff88' : '#ff4444'
                  }}>
                    {formatPercentage(asset.change24h)}
                  </span>
                </div>
                
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{ color: '#888', marginBottom: '2px' }}>Spread</div>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{spread.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
