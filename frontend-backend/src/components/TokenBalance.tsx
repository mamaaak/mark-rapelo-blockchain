'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Wallet, Coins, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTRACT_ADDRESS } from '@/lib/abi';

interface TokenBalanceProps {
  address: string;
  refreshTrigger?: number;
}

interface WalletData {
  address: string;
  ethBalance: string;
  tokenBalance: string;
  tokenName: string;
  tokenSymbol: string;
  blockNumber: number;
  gasPrice: string;
}

export function TokenBalance({ address, refreshTrigger = 0 }: TokenBalanceProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/wallet/${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load balance');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address, refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (loading && !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse border-0 bg-white/5 p-6">
            <div className="h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">{error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const ethAmount = parseFloat(data.ethBalance.replace(' ETH', ''));
  const tokenAmount = parseFloat(data.tokenBalance);

  return (
    <div className="space-y-4">
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ETH Balance Card */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-pink-900/40 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <div className="relative p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-purple-300">Network</p>
                <p className="text-xs text-purple-400">Sepolia</p>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-sm font-medium text-purple-200">ETH Balance</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {ethAmount.toFixed(4)}
              </p>
              <p className="mt-1 text-sm text-purple-300">ETH (Sepolia)</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-purple-400">Block #{data.blockNumber} • Sepolia</span>
              <span className="text-xs text-purple-400">{data.gasPrice}</span>
            </div>
          </div>
        </Card>

        {/* Token Balance Card */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-cyan-900/40 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <div className="relative p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  Contract <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-sm font-medium text-blue-200">{data.tokenName}</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {tokenAmount.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-blue-300">{data.tokenSymbol}</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-blue-400">ERC-20 Token</span>
              {tokenAmount > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Active</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Balances'}
        </Button>
      </div>

      {/* Wallet Info */}
      <Card className="border-white/10 bg-white/5 p-4">
        <p className="text-xs text-zinc-400">
          <strong className="text-zinc-300">Wallet Address:</strong>
          <br />
          <code className="mt-1 block rounded bg-black/20 p-2 text-xs text-zinc-300">
            {address}
          </code>
        </p>
      </Card>
    </div>
  );
}
