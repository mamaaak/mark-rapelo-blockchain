'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/abi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Coins } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface TokenMinterProps {
  onSuccess: () => void;
}

export function TokenMinter({ onSuccess }: TokenMinterProps) {
  const { account } = useWallet();
  const [amount, setAmount] = useState('10');
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleMint = async () => {
    if (!account || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    setError(null);
    setTxHash(null);
    setIsSuccess(false);

    try {
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check if we're on Sepolia network (chain ID 11155111)
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error(`Please switch to Sepolia testnet. Currently on chain ${network.chainId}`);
      }

      // Check if contract exists at the address
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('Contract not found at the specified address. Please check the contract deployment.');
      }

      // Create contract instance
      // CONTRACT_ABI[0] is the contract object, .abi is the array of functions
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI[0].abi, // This is the actual ABI array
        signer
      );

      // Convert amount to wei (token has 18 decimals)
      const amountInWei = ethers.parseEther(amount);

      console.log('🪙 Minting tokens:', {
        to: account,
        amount: amount,
        amountInWei: amountInWei.toString(),
        contractAddress: CONTRACT_ADDRESS,
        network: network.chainId,
      });

      // Call mint function
      console.log('📝 Calling contract.mint()...');
      const tx = await contract.mint(account, amountInWei);
      setTxHash(tx.hash);
      console.log('⏳ Transaction sent:', tx.hash);
      console.log('💰 Gas limit:', tx.gasLimit?.toString());
      console.log('💸 Gas price:', ethers.formatUnits(tx.gasPrice || '0', 'gwei'), 'gwei');

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);

      setIsSuccess(true);
      
      // Call onSuccess callback after short delay
      setTimeout(() => {
        onSuccess();
        // Reset after showing success
        setTimeout(() => {
          setIsSuccess(false);
          setTxHash(null);
        }, 3000);
      }, 1000);

    } catch (err: any) {
      console.error('❌ Minting error:', err);
      
      // Parse error messages
      let errorMessage = 'Failed to mint tokens';
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check you are on Sepolia network';
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        errorMessage = err.message.split('\n')[0];
      }
      
      setError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      <div className="relative p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mint Tokens</h3>
            <p className="text-sm text-zinc-400">Tier3Token (T3T)</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Amount to Mint
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isMinting}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {/* Mint Button */}
          <Button
            onClick={handleMint}
            disabled={isMinting || !account || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-6 text-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {txHash ? 'Confirming...' : 'Signing...'}
              </>
            ) : (
              <>
                <Coins className="mr-2 h-5 w-5" />
                Mint {amount} T3T
              </>
            )}
          </Button>

          {/* Success Message */}
          {isSuccess && txHash && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-200">Success!</p>
                  <p className="mt-1 text-sm text-green-300">
                    {amount} tokens minted successfully
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                  >
                    View on Etherscan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Pending */}
          {isMinting && txHash && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-200">Transaction Pending</p>
                  <p className="mt-1 text-sm text-blue-300">
                    Waiting for confirmation...
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    View on Etherscan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">Error</p>
                  <p className="mt-1 text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Not Connected */}
          {!account && (
            <p className="text-center text-sm text-zinc-400">
              Connect your wallet to mint tokens
            </p>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-zinc-400">
              <strong className="text-zinc-300">Note:</strong> Minting tokens requires a small
              amount of Sepolia ETH for gas fees. Get free Sepolia ETH from{' '}
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                sepoliafaucet.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
