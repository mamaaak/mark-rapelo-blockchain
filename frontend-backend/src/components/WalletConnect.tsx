'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { WalletModal } from './WalletModal';

export const WalletConnect: React.FC = () => {
  const {
    account,
    isConnecting,
    error,
    isModalOpen,
    connectedWalletType,
    openWalletModal,
    closeWalletModal,
    connectWallet,
    disconnectWallet
  } = useWallet();

  const [copied, setCopied] = React.useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWalletIcon = (type: string | null) => {
    switch (type) {
      case 'metamask': return '🦊';
      case 'coinbase': return '🔵';
      case 'walletconnect': return '🔗';
      case 'trust': return '⭐';
      default: return '🔑';
    }
  };

  if (!account) {
    return (
      <>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-purple-500/20">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          
          <div className="relative p-8">
            <div className="mb-6 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                  <Wallet className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="mb-6 text-center">
              <h2 className="mb-2 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-3xl font-bold text-transparent">
                Connect Your Wallet
              </h2>
              <p className="text-zinc-400">
                Choose from multiple wallet providers to get started
              </p>
            </div>

            <Button 
              onClick={openWalletModal} 
              disabled={isConnecting}
              className="group relative w-full overflow-hidden border-0 bg-gradient-to-r from-purple-500 to-blue-500 py-6 text-lg font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/60"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Select Wallet
                    <Sparkles className="h-5 w-5" />
                  </>
                )}
              </span>
            </Button>
            
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-red-400">Error</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">What is a wallet?</p>
              <p className="text-xs leading-relaxed text-zinc-400">
                A wallet lets you connect to Web3 apps and manage your digital assets.
                It's like a digital passport for the blockchain.
              </p>
            </div>
          </div>
        </Card>

        <WalletModal
          isOpen={isModalOpen}
          onClose={closeWalletModal}
          onSelectWallet={connectWallet}
          isConnecting={isConnecting}
        />
      </>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-green-500/20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        
        <div className="relative p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-2xl shadow-lg">
                {getWalletIcon(connectedWalletType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">Connected</h3>
                  <Badge className="border-0 bg-green-500/20 text-green-400">
                    <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    Active
                  </Badge>
                </div>
                <button
                  onClick={copyAddress}
                  className="group flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  <span className="font-mono">{formatAddress(account)}</span>
                  {copied ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 transition-transform group-hover:scale-110" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Wallet Status</p>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Ready</p>
              <p className="text-sm text-zinc-500">Connected</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="border-red-500/20 bg-red-500/10 text-red-400 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-yellow-400">Warning</p>
              <p className="text-sm text-yellow-300">{error}</p>
            </div>
          )}
        </div>
      </Card>

      <WalletModal
        isOpen={isModalOpen}
        onClose={closeWalletModal}
        onSelectWallet={connectWallet}
        isConnecting={isConnecting}
      />
    </>
  );
};
