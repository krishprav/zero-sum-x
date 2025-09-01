import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zero-Sum-X | Professional CFD Trading Platform",
  description: "Trade Bitcoin, Ethereum, Solana and more with up to 100x leverage. Professional CFD trading platform with real-time charts and advanced order management.",
  keywords: "CFD trading, cryptocurrency, Bitcoin, Ethereum, Solana, leverage trading, forex, trading platform",
  authors: [{ name: "Zero-Sum-X" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
