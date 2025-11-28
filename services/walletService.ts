import { BrowserWallet } from '@meshsdk/core';

export interface WalletInfo {
  name: string;
  address: string;
  api?: any;
}

export class WalletService {
  private static readonly WALLET_ADDRESS_KEY = 'connected_wallet_address';
  private static readonly WALLET_NAME_KEY = 'connected_wallet_name';

  // Get wallet info from localStorage
  static getStoredWallet(): WalletInfo | null {
    const address = localStorage.getItem(this.WALLET_ADDRESS_KEY);
    const name = localStorage.getItem(this.WALLET_NAME_KEY);
    
    if (address && name) {
      return { name, address };
    }
    return null;
  }

  // Save wallet info to localStorage
  static saveWallet(walletInfo: WalletInfo): void {
    if (walletInfo.address) {
      localStorage.setItem(this.WALLET_ADDRESS_KEY, walletInfo.address);
    }
    if (walletInfo.name) {
      localStorage.setItem(this.WALLET_NAME_KEY, walletInfo.name);
    }
  }

  // Clear wallet info from localStorage
  static clearWallet(): void {
    localStorage.removeItem(this.WALLET_ADDRESS_KEY);
    localStorage.removeItem(this.WALLET_NAME_KEY);
  }

  // Connect wallet and get address using Mesh JS
  static async connectWallet(walletName: string): Promise<WalletInfo> {
    try {
      const wallet = await BrowserWallet.enable(walletName);
      const address = await wallet.getChangeAddress();
      
      if (!address) {
        throw new Error('Failed to get wallet address');
      }

      const walletInfo: WalletInfo = {
        name: walletName,
        address: address,
        api: wallet
      };

      // Save to localStorage
      this.saveWallet(walletInfo);
      
      return walletInfo;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Disconnect wallet
  static disconnectWallet(): void {
    this.clearWallet();
  }
}
