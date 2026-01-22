'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  blockNumber: number;
}

interface WalletContextType {
  account: string | null;
  balance: string | null;
  transactions: Transaction[];
  isConnecting: boolean;
  error: string | null;
  isModalOpen: boolean;
  connectedWalletType: string | null;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  refreshData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
          fetchTransactions(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setAccount(address);
          await fetchBalance(address);
          await fetchTransactions(address);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const openWalletModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const closeWalletModal = () => {
    setIsModalOpen(false);
  };

  const connectWallet = async (walletType: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      let provider;
      
      // Handle different wallet types
      if (walletType === 'metamask') {
        if (!window.ethereum?.isMetaMask) {
          throw new Error('MetaMask is not installed. Please install MetaMask extension.');
        }
        provider = new ethers.BrowserProvider(window.ethereum);
      } else if (walletType === 'coinbase') {
        if (window.ethereum?.isCoinbaseWallet) {
          provider = new ethers.BrowserProvider(window.ethereum);
        } else {
          throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet extension.');
        }
      } else if (walletType === 'walletconnect' || walletType === 'trust') {
        // For WalletConnect and other wallets, fall back to default provider
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.BrowserProvider(window.ethereum);
      }

      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      setAccount(address);
      setConnectedWalletType(walletType);
      setIsModalOpen(false);

      await fetchBalance(address);
      await fetchTransactions(address);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setTransactions([]);
    setError(null);
    setConnectedWalletType(null);
    setIsModalOpen(false);
  };

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(balanceInEth);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const fetchTransactions = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentBlock = await provider.getBlockNumber();
      
      // For demo purposes, we'll fetch the last 10 blocks and filter transactions
      // In production, you'd use an API like Etherscan
      const transactions: Transaction[] = [];
      const blocksToCheck = 10000; // Check last 10000 blocks
      
      // Note: This is a simplified approach. For production, use Etherscan API
      // or a similar service as querying blocks directly is rate-limited
      
      try {
        // Try to get recent transactions by checking recent blocks
        for (let i = 0; i < blocksToCheck && transactions.length < 10; i++) {
          const blockNumber = currentBlock - i;
          if (blockNumber < 0) break;
          
          try {
            const block = await provider.getBlock(blockNumber, true);
            if (block && block.transactions) {
              for (const txData of block.transactions) {
                if (typeof txData !== 'string' && txData && 'from' in txData && 'hash' in txData) {
                  const tx = txData as any;
                  if (tx.from.toLowerCase() === address.toLowerCase() || 
                      tx.to?.toLowerCase() === address.toLowerCase()) {
                    transactions.push({
                      hash: tx.hash,
                      from: tx.from,
                      to: tx.to || null,
                      value: ethers.formatEther(tx.value),
                      timestamp: block.timestamp,
                      blockNumber: block.number,
                    });
                    
                    if (transactions.length >= 10) break;
                  }
                }
              }
            }
          } catch (blockErr) {
            // Skip this block if there's an error
            continue;
          }
        }
      } catch (err) {
        console.log('Note: Transaction history may be incomplete without an API service');
      }
      
      setTransactions(transactions.slice(0, 10));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transaction history. Consider using Etherscan API for production.');
    }
  };

  const refreshData = async () => {
    if (account) {
      await fetchBalance(account);
      await fetchTransactions(account);
    }
  };

  const value: WalletContextType = {
    account,
    balance,
    transactions,
    isConnecting,
    error,
    isModalOpen,
    connectedWalletType,
    openWalletModal,
    closeWalletModal,
    connectWallet,
    disconnectWallet,
    refreshData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
