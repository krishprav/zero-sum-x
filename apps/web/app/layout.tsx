import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../src/contexts/AuthContext";
import { Web3Provider } from "../src/providers/Web3Provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Zero Sum X - Professional Trading Platform",
  description: "Advanced trading platform with real-time price updates, interactive charts, and comprehensive risk management tools.",
  keywords: "trading, cryptocurrency, forex, charts, real-time, zero sum x",
  authors: [{ name: "Zero Sum X Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-950 text-white antialiased`}>
        <Web3Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
