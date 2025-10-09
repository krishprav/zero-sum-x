'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="dock-glass px-3 py-2.5 text-white rounded-2xl font-semibold text-[11px] dock-focus shrink-0 whitespace-nowrap"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="dock-glass px-3 py-2.5 text-red-400 rounded-2xl font-semibold text-[11px] dock-focus shrink-0 whitespace-nowrap border border-red-500/30"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="dock-glass px-2.5 py-2.5 rounded-2xl text-white font-medium text-[11px] dock-focus flex items-center gap-1.5 shrink-0"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 10, height: 10 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-[10px]">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="dock-glass px-3 py-2.5 rounded-2xl text-white font-medium text-[11px] dock-focus shrink-0 whitespace-nowrap"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
