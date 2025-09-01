"use client";

import React, { useState, useEffect } from "react";
import { useTradingStore } from "../../store/tradingStore";
import { calculatePositionSize, calculateLiquidationPrice } from "../../utils/priceUtils";
import "./tradingPanel.scss";

export const TradingPanel: React.FC = () => {
  const {
    leverage,
    positionType,
    margin,
    userBalance,
    setLeverage,
    setPositionType,
    setMargin,
    addOpenTrade
  } = useTradingStore();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [estimatedPositionSize, setEstimatedPositionSize] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState(0);

  const leverageOptions = [1, 2, 3];

  // Calculate estimated values when margin or leverage changes
  useEffect(() => {
    const marginValue = parseFloat(margin) || 0;
    const positionSize = calculatePositionSize(marginValue, leverage);
    setEstimatedPositionSize(positionSize);

    // Mock liquidation price calculation (in production, this would use real asset price)
    const mockAssetPrice = 100000000; // $100.00 with 6 decimals
    const liqPrice = calculateLiquidationPrice(mockAssetPrice, leverage, positionType, 6);
    setLiquidationPrice(liqPrice);
  }, [margin, leverage, positionType]);

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setMargin(value);
    }
  };

  const handleMaxMargin = () => {
    setMargin((userBalance / 100).toString()); // Convert from integer to decimal
  };

  const handleLeverageSelect = (selectedLeverage: number) => {
    setLeverage(selectedLeverage);
  };

  const handleTrade = () => {
    const marginValue = parseFloat(margin);
    if (marginValue <= 0 || marginValue > userBalance / 100) {
      alert('Invalid margin amount');
      return;
    }

    // Create mock trade (in production, this would call your API)
    const mockTrade = {
      orderId: `order_${Date.now()}`,
      type: positionType,
      margin: Math.round(marginValue * 100), // Convert to integer with 2 decimals
      leverage,
      openPrice: 100000000, // Mock price, in production use real asset price
      status: 'open' as const,
      timestamp: Date.now()
    };

    addOpenTrade(mockTrade);
    alert(`Order placed successfully! Order ID: ${mockTrade.orderId}`);
  };

  const tradingFee = parseFloat(margin) * 0.01; // 1% trading fee

  const handleSelect = (option: string) => {
    if (option === "Deposit") {
      setActiveTab(1);
    } else {
      setActiveTab(1);
    }
    setShowDropdown(false);
  };

  return (
    <div className="orderComponent">
      <div className="tabContainer">
        <div className="MarketTab">
          <button
            className={!activeTab ? "activeLong" : "inActiveBtn"}
            onClick={() => setActiveTab(0)}
          >
            Market
          </button>
          <div className="dropdownWrapper">
            <button
              className={activeTab ? "activeLong" : "inActiveBtn"}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              More
            </button>

            {showDropdown && (
              <div className="dropdownMenu">
                <div onClick={() => handleSelect("Deposit")}>Deposit</div>
                <div onClick={() => handleSelect("Withdraw")}>Withdraw</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 0 ? (
        <div className="orderForm">
          <div className="formRow">
            <label className="formLabel">You Pay</label>
            <div className="availableBalance">
              <span>Balance: 0.0000</span>
            </div>
          </div>

          <div className="inputContainer">
            <input
              type="text"
              value={margin}
              onChange={handleMarginChange}
              className="orderInput"
              placeholder="0"
            />
            <button
              className="maxButton"
              onClick={handleMaxMargin}
            >
              MAX
            </button>
          </div>

          <div className="leverageSection">
            <label className="formLabel">Select Leverage upto 3X</label>
            <div className="leverageContainer">
              <div className="leverageProgressBar">
                <div className="leverageProgressLine"></div>
                <div
                  className="leverageProgressFill"
                  style={{
                    width: `${((leverage - 1) / 2) * 100}%`,
                  }}
                ></div>
                {leverageOptions.map((option) => (
                  <div
                    key={option}
                    className={`leverageDot ${leverage === option ? "active" : ""} ${leverage >= option ? "filled" : ""}`}
                    onClick={() => handleLeverageSelect(option)}
                  />
                ))}
              </div>
              <div className="leverageLabels">
                {leverageOptions.map((option) => (
                  <span
                    key={option}
                    className={`leverageLabel ${leverage === option ? "active" : ""}`}
                    onClick={() => handleLeverageSelect(option)}
                  >
                    {option}x
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="orderDetails">
            <div className="detailRow">
              <span className="detailLabel">Est. Position Size</span>
              <span className="detailValue">
                <span className="usdcLogoTradingPanel">$</span>
                {estimatedPositionSize.toFixed(4)}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Liq. Price</span>
              <span className="detailValue">
                <span className="usdcLogoTradingPanel">$</span>
                {(liquidationPrice / 1000000).toFixed(4)}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Trading Fee (1%)</span>
              <span className="detailValue">
                <span className="usdcLogoTradingPanel">$</span>
                {tradingFee.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="PositionTab">
            <button
              className={positionType === 'buy' ? "activeLong" : "long"}
              onClick={() => setPositionType('buy')}
            >
              Long
            </button>
            <button
              className={positionType === 'sell' ? "activeShort" : "short"}
              onClick={() => setPositionType('sell')}
            >
              Short
            </button>
          </div>

          <button
            onClick={handleTrade}
            className="connectWalletButton"
          >
            Open {positionType === 'buy' ? 'Long' : 'Short'} Position
          </button>
        </div>
      ) : (
        <div className="DepositComponent">
          <div className="tabContainer" style={{ marginBottom: 0 }}>
            <div className="MarketTab">
              <button className="activeLong">Deposit</button>
              <button className="inActiveBtn">Withdraw</button>
            </div>
          </div>
          <div className="formRow">
            <label className="formLabel">You Pay</label>
            <div className="availableBalance">
              <span>Balance: 0.0000</span>
            </div>
          </div>

          <div className="inputContainer">
            <input
              type="text"
              value={margin}
              onChange={handleMarginChange}
              className="orderInput"
              placeholder="0"
            />
            <button
              className="maxButton"
              onClick={handleMaxMargin}
            >
              MAX
            </button>
          </div>

          <button className="connectWalletButton">
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
