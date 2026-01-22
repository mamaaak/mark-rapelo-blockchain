import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import type { HealthCheckResponse } from '@/types/api';

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Checks the status of:
 * - Ethereum RPC connection
 * - Supabase database connection
 */
export async function GET() {
  try {
    const results = {
      ethereum: { status: 'down' as const, network: undefined as string | undefined },
      database: { status: 'down' as const },
    };

    // Check Ethereum Connection
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.ALCHEMY_API_URL || process.env.RPC_URL
      );
      const network = await provider.getNetwork();
      results.ethereum = {
        status: 'up',
        network: network.name === 'unknown' ? 'custom' : network.name,
      };
    } catch (error) {
      console.error('❌ Ethereum health check failed:', error);
    }

    // Check Supabase Connection
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try to query the database
        const { error } = await supabase
          .from('wallet_snapshots')
          .select('id')
          .limit(1);

        results.database = {
          status: error ? 'down' : 'up',
        };
      } else {
        results.database = {
          status: 'disabled',
        };
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error);
    }

    // Determine overall status
    const allHealthy = 
      results.ethereum.status === 'up' && 
      (results.database.status === 'up' || results.database.status === 'disabled');

    const response: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: results,
    };

    return NextResponse.json(response, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          ethereum: { status: 'down' },
          database: { status: 'down' },
        },
      } as HealthCheckResponse,
      { status: 500 }
    );
  }
}
