'use client';

import React, { useState } from 'react';
import { X, Wallet, ExternalLink, ChevronRight } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed?: boolean;
  downloadUrl?: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletId: string) => void;
  isConnecting: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect with MetaMask wallet',
    icon: '🦊',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect with Coinbase Wallet',
    icon: '🔵',
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with mobile wallet',
    icon: '🔗',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Connect with Trust Wallet',
    icon: '⭐',
    downloadUrl: 'https://trustwallet.com/download',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
  isConnecting,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWalletClick = (walletId: string) => {
    setSelectedWallet(walletId);
    onSelectWallet(walletId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-purple-500/20">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
          
          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                  <p className="text-sm text-zinc-400">Choose your preferred wallet</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                disabled={isConnecting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wallet Options */}
            <div className="space-y-2">
              {walletOptions.map((wallet) => {
                const isInstalled = wallet.id === 'metamask' 
                  ? typeof window !== 'undefined' && window.ethereum?.isMetaMask
                  : wallet.id === 'coinbase'
                  ? typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
                  : true;

                return (
                  <div key={wallet.id}>
                    <button
                      onClick={() => handleWalletClick(wallet.id)}
                      disabled={isConnecting && selectedWallet === wallet.id}
                      className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-purple-500/50 hover:bg-white/10 disabled:opacity-50"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                            {wallet.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{wallet.name}</span>
                              {!isInstalled && (
                                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-400">
                                  Not installed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-400">{wallet.description}</p>
                          </div>
                        </div>
                        
                        {isConnecting && selectedWallet === wallet.id ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                        )}
                      </div>
                    </button>

                    {!isInstalled && wallet.downloadUrl && (
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 px-4 text-xs text-purple-400 transition-colors hover:text-purple-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Download {wallet.name}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-xs text-blue-200">
                <span className="font-semibold">New to Ethereum?</span>
                <br />
                Learn more about wallets and how to get started with crypto at{' '}
                <a
                  href="https://ethereum.org/wallets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-100"
                >
                  ethereum.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
