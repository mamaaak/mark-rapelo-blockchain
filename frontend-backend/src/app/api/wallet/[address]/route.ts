import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { WalletResponse, ErrorResponse } from '@/types/api';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/abi';

// 1. Initialize Clients
// Usage of Service Role Key allows us to bypass Row Level Security (RLS) for backend writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// IMPORTANT: Using Sepolia network since contract is deployed on Sepolia
const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_ALCHEMY_API_URL || process.env.ALCHEMY_API_URL 
);

// 2. Implement Caching for Global Values (Gas Price & Block Number)
// These values are shared across all users, so we cache them

/**
 * Get current block number with caching
 * Cached for 10 seconds since new blocks come every ~12 seconds
 */
const getCachedBlockNumber = unstable_cache(
  async () => {
    console.log('🔍 Fetching fresh block number from network...');
    const blockNumber = await provider.getBlockNumber();
    return blockNumber;
  },
  ['block-number'], // cache key
  {
    revalidate: 10, // Cache for 10 seconds
    tags: ['block-number'],
  }
);

/**
 * Get current gas price with caching
 * Cached for 30 seconds as gas price doesn't change that rapidly
 */
const getCachedGasPrice = unstable_cache(
  async () => {
    console.log('⛽ Fetching fresh gas price from network...');
    const feeData = await provider.getFeeData();
    const gasPriceGwei = feeData.gasPrice 
      ? ethers.formatUnits(feeData.gasPrice, "gwei") 
      : "N/A";
    return gasPriceGwei;
  },
  ['gas-price'], // cache key
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ['gas-price'],
  }
);

// 3. Main API Handler
export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const startTime = Date.now();
  
  try {
    // In Next.js 15+, params is a Promise and needs to be awaited
    const { address } = await params;

    // Validate Address
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { 
          error: "Invalid Ethereum address",
          details: "Please provide a valid Ethereum address starting with 0x"
        } as ErrorResponse, 
        { status: 400 }
      );
    }

    // 4. Parallel Data Fetching with Cached Global Values
    // Balance is always fresh (user-specific), but gas price & block number use cache
    
    // Create token contract instance to fetch token balance
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      (CONTRACT_ABI[0] as any).abi,
      provider
    );
    
    const [blockNumber, gasPriceGwei, ethBalance, tokenBalance] = await Promise.all([
      getCachedBlockNumber(),
      getCachedGasPrice(),
      provider.getBalance(address), // Always fetch fresh ETH balance
      tokenContract.balanceOf(address).catch(() => BigInt(0)), // Fetch token balance with fallback
    ]);

    const formattedEthBalance = ethers.formatEther(ethBalance);
    const formattedTokenBalance = ethers.formatEther(tokenBalance);

    // 5. Store in Supabase (Database Requirement)
    // We use 'upsert' to update if exists, insert if new
    const { error: dbError } = await supabase
      .from('wallet_snapshots')
      .upsert(
        { 
          address: address.toLowerCase(), // Always normalize addresses
          balance_eth: parseFloat(formattedEthBalance),
          block_number: blockNumber,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'address' } // Requires unique constraint on 'address' column
      );

    if (dbError) {
      console.error("❌ Supabase Error:", dbError);
      // We don't fail the request if DB fails, just log it
      // This makes the API more resilient
    } else {
      console.log('✅ Wallet snapshot saved to database');
    }

    // 6. Return JSON Response with ETH and Token balances
    const response = {
      address,
      blockNumber,
      gasPrice: `${gasPriceGwei} Gwei`,
      ethBalance: `${formattedEthBalance} ETH`,
      tokenBalance: formattedTokenBalance, // Token balance from smart contract
      tokenSymbol: 'T3T',
      tokenName: 'Tier3Token',
      cached: true, // Gas price and block number are cached
      timestamp: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;
    console.log(`⚡ Request processed in ${processingTime}ms`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });

  } catch (error: any) {
    console.error("❌ API Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch wallet data", 
        details: error.message || 'Unknown error occurred'
      } as ErrorResponse, 
      { status: 500 }
    );
  }
}

/**
 * Alternative: POST method for wallet data
 * Useful if you need to send additional parameters in the future
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ address: string }> }
) {
  try {
    // You can accept additional parameters from the body
    const body = await request.json().catch(() => ({}));
    
    // Call the GET handler (reuse logic)
    return await GET(request, context);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Invalid request", 
        details: error.message 
      } as ErrorResponse, 
      { status: 400 }
    );
  }
}

// Export runtime config for edge compatibility (optional)
export const runtime = 'nodejs'; // or 'edge' for edge runtime
