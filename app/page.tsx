"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./styles.scss";

const LandingPage = () => {
  const [currentVolume, setCurrentVolume] = useState<number>(15168577);
  const [currentUsers, setCurrentUsers] = useState<number>(7272);

  useEffect(() => {
    const volumeInterval = setInterval(() => {
      setCurrentVolume((prev) => prev + Math.floor(Math.random() * 10000));
    }, 3000);

    const usersInterval = setInterval(() => {
      setCurrentUsers((prev) => prev + Math.floor(Math.random() * 10));
    }, 5000);

    return () => {
      clearInterval(volumeInterval);
      clearInterval(usersInterval);
    };
  }, []);

  return (
    <div className="HomeWrapper">
      {/* Navigation */}
      <nav className="navigation">
        <div className="navContainer">
          <div className="navLogo">
            <div className="logoIcon">Z</div>
            <span className="logoText">Zero-Sum-X</span>
          </div>
          <div className="navLinks">
            <a href="#" className="navLink">Markets</a>
            <a href="#" className="navLink">About</a>
            <Link href="/trading" className="launchButton">Launch App</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="heroSection">
        <div className="heroContainer">
          <div className="statusBadge">
            <div className="statusDot"></div>
            Testnet Live
          </div>

          <h1 className="heroTitle">
            The Future of <span className="fireEmoji">CFD Trading</span> is Here
          </h1>

          <p className="heroDescription">
            Experience institutional-grade CFD trading with real-time data, advanced charts, and up to 100x leverage. 
            Trade crypto, stocks, forex, and commodities with professional tools.
          </p>

          <Link href="/trading" className="tradeNowButton">
            Start Trading Now
          </Link>

          <div className="curveContainer">
            <svg className="curveSvg" viewBox="0 0 1200 300" fill="none" preserveAspectRatio="none">
              <path
                d="M0 250 Q300 100 600 150 Q900 200 1200 50"
                stroke="#6366f1"
                strokeWidth="3"
                fill="none"
                className="animatedCurve"
              />
            </svg>
            <div className="curveText">
              <span className="curveTextLine1">Professional Trading</span>
              <span className="curveTextLine2">Zero Complexity</span>
            </div>
          </div>
        </div>

        <div className="floatingIcons">
          <div className="floatingIcon bitcoin">₿</div>
          <div className="floatingIcon ethereum">Ξ</div>
          <div className="floatingIcon solana">◎</div>
          <div className="floatingIcon forex">💱</div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="statsSection">
        <div className="statsContainer">
          <div className="statItem">
            <div className="statLabel">
              Total Trading Volume <span className="betaBadge">Live</span>
            </div>
            <div className="statValue">${currentVolume.toLocaleString()}</div>
          </div>

          <div className="statItem">
            <div className="statLabel">
              Active Traders <span className="betaBadge">Live</span>
            </div>
            <div className="statValue">{currentUsers.toLocaleString()}</div>
          </div>
          
          <div className="statItem">
            <div className="statLabel">
              Available Assets <span className="betaBadge">Live</span>
            </div>
            <div className="statValue">50+</div>
          </div>
        </div>
      </section>

      {/* Crypto Ticker */}
      <section className="cryptoTickerSection">
        <div className="tickerContainer">
          <h2 className="tickerTitle">Popular Trading Pairs</h2>

          <div className="tickerWrapper">
            <div className="ticker">
              {[
                { name: "Dogecoin", symbol: "DOGE", price: 0.1779, change: -0.67 },
                { name: "Bitcoin", symbol: "BTC", price: 105615.63, change: -0.55 },
                { name: "Ethereum", symbol: "ETH", price: 3191.94, change: 0.91 },
                { name: "Solana", symbol: "SOL", price: 186.03, change: 3.75 },
                { name: "Dogecoin", symbol: "DOGE", price: 0.1779, change: -0.67 },
                { name: "Bitcoin", symbol: "BTC", price: 105615.63, change: -0.55 },
                { name: "Ethereum", symbol: "ETH", price: 3191.94, change: 0.91 },
                { name: "Solana", symbol: "SOL", price: 186.03, change: 3.75 }
              ].map((token, index) => (
                <div key={index} className="tokenCard">
                  <div className="tokenIconWrapper">
                    <div className="tokenSymbol">
                      {token.symbol === "BTC" ? "₿" : token.symbol === "ETH" ? "Ξ" : token.symbol === "SOL" ? "◎" : "🐕"}
                    </div>
                  </div>
                  <div className="tokenInfo">
                    <div className="tokenNameRow">
                      <span className="tokenName">{token.name}</span>
                      <span className="tokenSymbol">{token.symbol}</span>
                    </div>
                    <div className="tokenPriceRow">
                      <span className="tokenPrice">${token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      <span className={`tokenChange ${token.change >= 0 ? "positive" : "negative"}`}>
                        {token.change >= 0 ? "+" : ""}
                        {token.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="ctaContainer">
          <h2 className="ctaTitle">Ready to Experience the Future of Trading?</h2>
          <p className="ctaDescription">
            Join thousands of professional traders using our advanced CFD platform. Get access to real-time market data, 
            institutional-grade charts, and powerful trading tools across 50+ assets.
          </p>
          <div className="ctaFeatures">
            <span className="ctaFeature">✓ Up to 100x Leverage</span>
            <span className="ctaFeature">✓ 50+ Trading Pairs</span>
            <span className="ctaFeature">✓ Advanced Charts</span>
          </div>
          <Link href="/trading" className="ctaButton">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footerContainer">
          <div className="footerContent">
            <div className="footerSection">
              <h4 className="footerTitle">Trade Anything on Zero-Sum-X © 2024</h4>
            </div>

            <div className="footerLinks">
              <div className="footerColumn">
                <h5 className="footerColumnTitle">Trading</h5>
                <a href="#" className="footerLink">Markets</a>
                <a href="#" className="footerLink">Charts</a>
                <a href="#" className="footerLink">Orders</a>
                <a href="#" className="footerLink">Leverage</a>
              </div>
              <div className="footerColumn">
                <h5 className="footerColumnTitle">Support</h5>
                <a href="#" className="footerLink">Help Center</a>
                <a href="#" className="footerLink">Contact</a>
                <a href="#" className="footerLink">FAQ</a>
                <a href="#" className="footerLink">Tutorials</a>
              </div>
              <div className="footerColumn">
                <h5 className="footerColumnTitle">Legal</h5>
                <a href="#" className="footerLink">Terms</a>
                <a href="#" className="footerLink">Privacy</a>
                <a href="#" className="footerLink">Risk Disclosure</a>
                <a href="#" className="footerLink">Compliance</a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrolling Footer Ticker */}
        <div className="footerTicker">
          <div className="tickerContent">
            <span className="tickerItem">🚀 CFD Trading Platform</span>
            <span className="tickerItem">📊 Real-time Data</span>
            <span className="tickerItem">📈 Advanced Charts</span>
            <span className="tickerItem">⚡ Up to 100x Leverage</span>
            <span className="tickerItem">💎 50+ Assets</span>
            <span className="tickerItem">🛠️ Professional Tools</span>
            <span className="tickerItem">🏢 Institutional Grade</span>
            <span className="tickerItem">🎯 Zero Complexity</span>
            <span className="tickerItem">🚀 CFD Trading Platform</span>
            <span className="tickerItem">📊 Real-time Data</span>
            <span className="tickerItem">📈 Advanced Charts</span>
            <span className="tickerItem">⚡ Up to 100x Leverage</span>
            <span className="tickerItem">💎 50+ Assets</span>
            <span className="tickerItem">🛠️ Professional Tools</span>
            <span className="tickerItem">🏢 Institutional Grade</span>
            <span className="tickerItem">🎯 Zero Complexity</span>
          </div>
        </div>
        
        <div className="footerBottom">
          <p>&copy; 2024 Zero-Sum-X. All rights reserved. CFD trading involves substantial risk. Past performance does not guarantee future results.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
