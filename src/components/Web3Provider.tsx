import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { injected, metaMask, coinbaseWallet, mock } from 'wagmi/connectors';

// Define Arc Testnet custom chain
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
} as const;

const config = createConfig({
  chains: [arcTestnet, mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'SubZero' }),
    mock({
      accounts: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F'],
    }),
  ],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
