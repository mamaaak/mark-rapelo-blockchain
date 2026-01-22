// API Response Types

export interface WalletResponse {
  address: string;
  blockNumber: number;
  gasPrice: string;
  balance: string;
  cached: boolean;
  timestamp?: string;
}

export interface WalletSnapshot {
  id?: number;
  address: string;
  balance_eth: number;
  block_number: number;
  last_updated?: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  services: {
    ethereum: {
      status: 'up' | 'down';
      network?: string;
    };
    database: {
      status: 'up' | 'down' | 'disabled';
    };
  };
}
