'use client';

import { WalletProvider, useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TokenBalance } from '@/components/TokenBalance';
import { TokenMinter } from '@/components/TokenMinter';
import { Wallet, Shield, Zap, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

function DashboardContent() {
  const { account } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);

  // Automatically call the backend API when wallet connects
  useEffect(() => {
    const syncWalletToBackend = async () => {
      if (account) {
        try {
          console.log('🔄 Syncing wallet to backend:', account);
          const response = await fetch(`/api/wallet/${account}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Wallet synced to database:', data);
          } else {
            console.error('❌ Failed to sync wallet:', response.statusText);
          }
        } catch (error) {
          console.error('❌ Error syncing wallet:', error);
        }
      }
    };

    syncWalletToBackend();
  }, [account]); // Runs whenever account changes

  // Refresh balances after minting
  const handleMintSuccess = () => {
    console.log('✅ Mint successful, refreshing balances...');
    setRefreshKey(prev => prev + 1);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-6xl space-y-8 duration-700">
      {/* Token Balances */}
      <TokenBalance address={account} refreshTrigger={refreshKey} />

      {/* Token Minter */}
      <TokenMinter onSuccess={handleMintSuccess} />
    </div>
  );
}

export default function Home() {
  return (
    <WalletProvider>
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Animated background gradients */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[120px] delay-1000" />
          <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/20 blur-[120px] delay-2000" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative">
          <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <header className="mb-16 text-center">
              {/* Logo/Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 shadow-2xl shadow-purple-500/50">
                    <Wallet className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <h1 className="mb-3 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                  Web3 Wallet Dashboard
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <p className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-lg font-medium text-transparent">
                    Premium Edition
                  </p>
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
                Connect your Ethereum wallet to access your balance and transaction history
                with a beautiful, modern interface
              </p>

              {/* Features */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-zinc-300">Secure</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-zinc-300">Fast</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Multi-Wallet</span>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl space-y-8">
              {/* Wallet Connection Card */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WalletConnect />
              </div>

              {/* Token Dashboard (shows when connected) */}
              <DashboardContent />

              {/* Transaction History */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <TransactionHistory />
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t border-white/10 pt-12 text-center">
              <div className="mb-6 flex justify-center gap-6">
                <a
                  href="https://ethereum.org"
            target="_blank"
            rel="noopener noreferrer"
                  className="text-sm text-zinc-500 transition-colors hover:text-purple-400"
                >
                  About Ethereum
          </a>
          <a
                  href="https://docs.ethers.org"
            target="_blank"
            rel="noopener noreferrer"
                  className="text-sm text-zinc-500 transition-colors hover:text-purple-400"
          >
            Documentation
          </a>
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 transition-colors hover:text-purple-400"
                >
                  Get MetaMask
                </a>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-600">
                  Built with Next.js, TypeScript, and ethers.js
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-700">
                <Shield className="h-3 w-3" />
                <span>Your keys, your crypto. Always.</span>
              </div>
            </footer>
          </div>
        </div>
    </div>
    </WalletProvider>
  );
}
