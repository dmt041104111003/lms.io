import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import authService from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import { BrowserWallet } from '@meshsdk/core';
import { WalletService } from '@/services/walletService';

interface CardanoWallet {
  enable: () => Promise<any>;
  getNetworkId: () => Promise<number>;
  getRewardAddresses: () => Promise<string[]>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  signData: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
}

const stringToHex = (str: string): string => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);
    hex += hexValue.padStart(2, '0');
  }
  return hex;
};

interface WalletInfo {
  name: string;
  displayName: string;
  icon: string;
  installed: boolean;
}

const MAINNET_NETWORK_ID = 1;

const WALLET_CONFIG: Record<string, { displayName: string; icon: string }> = {
  nami: { displayName: 'Nami', icon: '/images/wallets/nami.png' },
  eternl: { displayName: 'Eternl', icon: '/images/wallets/eternal.png' },
  typhon: { displayName: 'Typhon', icon: '/images/wallets/typhon.png' },
  gero: { displayName: 'Gero', icon: '/images/wallets/Gero.png' },
  lace: { displayName: 'Lace', icon: '/images/wallets/lace.png' },
  yoroi: { displayName: 'Yoroi', icon: '/images/wallets/yoroi.png' },
  nufi: { displayName: 'NuFi', icon: '/images/wallets/nufi.png' },
  flint: { displayName: 'Flint', icon: '/images/wallets/nami.png' },
};

interface CardanoAuthWalletButtonProps {
  title?: string;
}

const CardanoAuthWalletButton: React.FC<CardanoAuthWalletButtonProps> = ({ title }) => {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [showWalletList, setShowWalletList] = useState(false);

  useEffect(() => {
    const detectWallets = () => {
      const wallets: WalletInfo[] = [];
      if (typeof window !== 'undefined' && (window as any).cardano) {
        Object.keys(WALLET_CONFIG).forEach(walletKey => {
          if ((window as any).cardano?.[walletKey]) {
            const config = WALLET_CONFIG[walletKey];
            wallets.push({
              name: walletKey,
              displayName: config.displayName,
              icon: config.icon,
              installed: true,
            });
          }
        });
      }
      setAvailableWallets(wallets);
    };

    detectWallets();
    const interval = setInterval(detectWallets, 2000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async (walletName: string) => {
    setIsConnecting(true);
    setShowWalletList(false);
    try {
      const walletApi = (window as any).cardano?.[walletName];
      if (!walletApi) {
        error('Wallet not found. Please install a Cardano wallet extension.');
        setIsConnecting(false);
        return;
      }

      console.log('Enabling wallet:', walletName);
      
      // Use WalletService to connect and get address
      const walletInfo = await WalletService.connectWallet(walletName);
      const { address } = walletInfo;
      
      console.log('Using address:', address);
      
      // Check network
      const wallet = await BrowserWallet.enable(walletName as any);
      const networkId = await wallet.getNetworkId();
      console.log('Network ID:', networkId);
      if (networkId !== MAINNET_NETWORK_ID && networkId !== 0) { // 0 = Testnet
        error('Please switch to Cardano Mainnet or Testnet to continue.');
        setIsConnecting(false);
        return;
      }
      
      setConnectedWallet(walletName);

      // Use original wallet API for signing to avoid checksum issues
      const originalWallet = await walletApi.enable();
      
      const { nonce } = await authService.generateNonce(address);
      // Extract only the UUID part from nonce (first part before space)
      const nonceUuid = nonce.split(' ')[0];
      // Use proper hex encoding for signing
      const payload = Buffer.from(nonceUuid, 'utf8').toString('hex');
      console.log('Requesting signature for nonce:', nonce);
      console.log('Nonce UUID:', nonceUuid);
      console.log('Hex payload:', payload);

      const signResponse = await originalWallet.signData(address, payload);
      console.log('Sign response received:', signResponse);
      
      if (!signResponse || !signResponse.signature) {
        error('Failed to sign message. Please try again.');
        setIsConnecting(false);
        return;
      }

      try {
        const loginResponse = await authService.loginWithWallet({
          address,
          signature: signResponse.signature,
          key: signResponse.key || '', // Mesh JS might not return key
          nonce: nonce, // Send the full original nonce
        });

        if (loginResponse.authenticated && loginResponse.token) {
          localStorage.setItem('access_token', loginResponse.token);
          localStorage.setItem('wallet_address', address); // Save auth wallet address
          localStorage.setItem('connected_wallet_address', address); // Save for unified component
          localStorage.setItem('connected_wallet_name', walletName); // Save wallet name
          success('Successfully connected with Cardano wallet!');
          router.push('/home');
        } else {
          error('Authentication failed. Please try again.');
        }
      } catch (loginError: any) {
        console.error('Login error:', loginError);
        error(loginError.message || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.message?.includes('User rejected') || err.message?.includes('User declined')) {
        error('Wallet connection was cancelled.');
      } else if (err.message?.includes('network')) {
        error('Please switch to Cardano Mainnet to continue.');
      } else {
        error(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const walletDialog = showWalletList && !isConnecting && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Cardano Wallet</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableWallets.length > 0 ? (
              availableWallets.map(wallet => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => connectWallet(wallet.name)}
                  disabled={isConnecting && connectedWallet === wallet.name}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.displayName}
                    className="w-10 h-10 object-contain flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/wallets/nami.png';
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {wallet.displayName}
                  </span>
                  {isConnecting && connectedWallet === wallet.name && (
                    <span className="text-xs text-blue-600">Connecting...</span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No wallets detected. Please install a Cardano wallet extension.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowWalletList(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowWalletList(true)}
          disabled={isConnecting || availableWallets.length === 0}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img 
            src="/images/common/loading.png" 
            alt="Cardano" 
            className="w-4 h-4 object-contain"
          />
          {isConnecting ? (
            <span>Connecting...</span>
          ) : (
            <>
              <span className="hidden sm:inline">{title || 'Connect with Cardano Wallet'}</span>
              <span className="sm:hidden">{title || 'Connect with Cardano Wallet'}</span>
            </>
          )}
        </button>
        {availableWallets.length === 0 && (
          <p className="mt-1 text-xs text-gray-500 text-center">
            Install a Cardano wallet extension (Nami, Eternl, Flint, etc.)
          </p>
        )}
      </div>

      {typeof window !== 'undefined' && walletDialog && createPortal(walletDialog, document.body)}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default CardanoAuthWalletButton;
