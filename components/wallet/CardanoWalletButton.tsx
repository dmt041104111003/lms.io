import React, { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { WalletService } from '@/services/walletService';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';

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

// Mapping wallet names to their display names and icons
const WALLET_CONFIG: Record<string, { displayName: string; icon: string }> = {
  nami: { displayName: 'Nami', icon: '/images/wallets/nami.png' },
  eternl: { displayName: 'Eternl', icon: '/images/wallets/eternal.png' },
  typhon: { displayName: 'Typhon', icon: '/images/wallets/typhon.png' },
  gero: { displayName: 'Gero', icon: '/images/wallets/Gero.png' },
  lace: { displayName: 'Lace', icon: '/images/wallets/lace.png' },
  yoroi: { displayName: 'Yoroi', icon: '/images/wallets/yoroi.png' },
  nufi: { displayName: 'NuFi', icon: '/images/wallets/nufi.png' },
  flint: { displayName: 'Flint', icon: '/images/wallets/nami.png' }, // Fallback icon
};

interface CardanoWalletButtonProps {
  title?: string;
  onWalletConnect?: (walletInfo: { name: string; address: string; api: any }) => void;
  onWalletDisconnect?: () => void;
}

const CardanoWalletButton: React.FC<CardanoWalletButtonProps> = ({ 
  title, 
  onWalletConnect, 
  onWalletDisconnect 
}) => {
  const { toasts, removeToast, success, error } = useToast();
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<any>(null);
  const [showWalletList, setShowWalletList] = useState(false);

  useEffect(() => {
    // Load wallet info from WalletService on mount
    const storedWallet = WalletService.getStoredWallet();
    if (storedWallet) {
      setConnectedWallet(storedWallet.name);
      setConnectedAddress(storedWallet.address);
    }

    // Detect available Cardano wallets
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
    // Re-check periodically
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
      const wallet = await walletApi.enable();
      console.log('Wallet enabled successfully');
      
      const networkId = await wallet.getNetworkId();
      console.log('Network ID:', networkId);
      // Temporarily allow both Mainnet (1) and Testnet/Preprod (0)
      if (networkId !== MAINNET_NETWORK_ID && networkId !== 0) {
        error('Unsupported Cardano network. Please switch to Mainnet or Testnet.');
        setIsConnecting(false);
        return;
      }

      // Use Mesh JS to get the correct address
      console.log('Getting address with Mesh JS...');
      const meshWallet = await BrowserWallet.enable(walletName as any);
      const address = await meshWallet.getChangeAddress();
      console.log('Got address from Mesh JS:', address);
      
      if (!address) {
        error('Failed to get wallet address. Please try again.');
        setIsConnecting(false);
        return;
      }
      
      // Set connected state
      setConnectedWallet(walletName);
      setConnectedAddress(address);
      setConnectedApi(wallet);
      
      // Save wallet info using WalletService
      WalletService.saveWallet({
        name: walletName,
        address: address,
        api: wallet
      });
      
      // Call callback if provided
      if (onWalletConnect) {
        onWalletConnect({
          name: walletName,
          address: address,
          api: wallet
        });
      }
      
      success('Wallet connected successfully!');
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.message?.includes('User rejected') || err.message?.includes('User declined')) {
        error('Wallet connection was cancelled.');
      } else if (err.message?.includes('network')) {
        error('Please switch to Cardano Mainnet or Testnet to continue.');
      } else {
        error(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setConnectedAddress(null);
    setConnectedApi(null);
    
    // Clear wallet info using WalletService
    WalletService.disconnectWallet();
    
    if (onWalletDisconnect) {
      onWalletDisconnect();
    }
    
    success('Wallet disconnected!');
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
                      // Fallback to default icon if image fails to load
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
        {connectedWallet && connectedAddress ? (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-6 sm:px-4 py-3 sm:py-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </div>
            <p className="text-sm text-blue-600 font-mono hidden sm:block">
              addr{connectedAddress.slice(4, 10)}...{connectedAddress.slice(-5)}
            </p>
            <p className="text-sm text-blue-600 font-mono sm:hidden">
              addr{connectedAddress.slice(4, 6)}...{connectedAddress.slice(-4)}
            </p>
            <button
              type="button"
              onClick={disconnectWallet}
              className="text-xs text-red-600 hover:text-red-800 font-medium hidden sm:block"
              title="Disconnect Wallet"
            >
              Disconnect
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="text-xs text-red-600 hover:text-red-800 font-medium sm:hidden"
              title="Disconnect"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowWalletList(true)}
            disabled={isConnecting || availableWallets.length === 0}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="hidden sm:inline">{title || 'Connect Wallet'}</span>
                <span className="sm:hidden">{title || 'Connect Wallet'}</span>
              </>
            )}
          </button>
        )}
        {availableWallets.length === 0 && !connectedWallet && (
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

export default CardanoWalletButton;
