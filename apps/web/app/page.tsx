import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-neutral-500/10 via-neutral-600/5 to-transparent blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-bl from-neutral-400/8 via-neutral-500/4 to-transparent blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-neutral-600/6 via-neutral-400/3 to-transparent blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(115,115,115,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(115,115,115,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">
              Zero Sum X
            </h1>
            <p className="text-xl text-neutral-400">
              Professional Trading Platform
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="dock-container edge-shadow rounded-3xl p-6 relative overflow-hidden" style={{
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
              border: '0.5px solid rgba(255,255,255,0.05)',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}>
              <div className="w-12 h-12 bg-[#158BF9]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#158BF9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Trading</h3>
              <p className="text-neutral-400 text-sm">Live price updates and instant order execution</p>
            </div>

            <div className="dock-container edge-shadow rounded-3xl p-6 relative overflow-hidden" style={{
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
              border: '0.5px solid rgba(255,255,255,0.05)',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}>
              <div className="w-12 h-12 bg-[#158BF9]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#158BF9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Charts</h3>
              <p className="text-neutral-400 text-sm">Interactive candlestick charts with multiple timeframes</p>
            </div>

            <div className="dock-container edge-shadow rounded-3xl p-6 relative overflow-hidden" style={{
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
              border: '0.5px solid rgba(255,255,255,0.05)',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}>
              <div className="w-12 h-12 bg-[#158BF9]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#158BF9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-neutral-400 text-sm">Take profit and stop loss orders for safe trading</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trading"
              className="dock-glass px-8 py-4 bg-gradient-to-r from-[#158BF9]/90 to-[#158BF9] hover:from-[#158BF9] hover:to-[#158BF9]/90 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Start Trading
            </Link>
            <Link
              href="/login"
              className="dock-glass px-8 py-4 text-white font-semibold transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Demo Info */}
          <div className="dock-container edge-shadow rounded-2xl p-4 mt-8 relative overflow-hidden" style={{
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
            border: '0.5px solid rgba(255,255,255,0.05)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}>
            <p className="text-neutral-400 text-sm">
              <span className="text-white font-semibold">Demo Credentials:</span> demo@example.com / password
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-neutral-400 text-sm">
            © {new Date().getFullYear()} Zero Sum X. Professional Trading Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}