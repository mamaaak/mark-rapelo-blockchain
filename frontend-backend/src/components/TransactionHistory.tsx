'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { account, transactions } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOutgoing = (tx: any) => {
    return tx.from.toLowerCase() === account?.toLowerCase();
  };

  if (!account) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        
        <div className="relative p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <History className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <p className="text-sm text-zinc-400">Connect wallet to view transactions</p>
            </div>
          </div>

          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                  <History className="h-8 w-8 text-zinc-600" />
                </div>
              </div>
              <p className="text-zinc-400">No wallet connected</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <History className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <p className="text-sm text-zinc-400">Your recent transactions</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <TrendingUp className="h-10 w-10 text-blue-400" />
                </div>
              </div>
              <p className="mb-2 text-lg font-semibold text-white">No transactions found</p>
              <p className="text-sm text-zinc-400">
                Transactions from recent blocks will appear here
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                💡 Note: Transaction fetching is limited without an API service.
                <br />
                For production, integrate Etherscan API for complete history.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-blue-500/10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      
      <div className="relative p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <p className="text-sm text-zinc-400">
                Last {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Badge className="border-0 bg-blue-500/20 text-blue-400">
            {transactions.length} Total
          </Badge>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Hash</TableHead>
                <TableHead className="text-zinc-400">Address</TableHead>
                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, index) => {
                const outgoing = isOutgoing(tx);
                return (
                  <TableRow 
                    key={tx.hash} 
                    className="group border-white/10 transition-colors hover:bg-white/10"
                  >
                    <TableCell>
                      {outgoing ? (
                        <Badge 
                          variant="outline" 
                          className="gap-1 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="gap-1 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        >
                          <ArrowDownLeft className="h-3 w-3" />
                          Received
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-300">
                      {formatAddress(tx.hash)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {outgoing ? (
                        <div className="text-zinc-400">
                          <span className="text-zinc-500">To: </span>
                          {tx.to ? formatAddress(tx.to) : 'Contract'}
                        </div>
                      ) : (
                        <div className="text-zinc-400">
                          <span className="text-zinc-500">From: </span>
                          {formatAddress(tx.from)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-white">
                      {parseFloat(tx.value).toFixed(6)} ETH
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {formatDate(tx.timestamp)}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-white/10 hover:text-blue-400"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Footer */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs text-blue-200">
            💡 Click <ExternalLink className="inline h-3 w-3" /> to view full details on Etherscan
          </p>
        </div>
      </div>
    </Card>
  );
};
