import React, { useState, useEffect } from 'react';
import CardanoWalletButton from '@/components/wallet/CardanoWalletButton';
import { BlockfrostProvider, BrowserWallet, MeshTxBuilder } from '@meshsdk/core';
import { useToast } from '@/hooks/useToast';
import { WalletService } from '@/services/walletService';
import { useAuth } from '@/hooks/useAuth';
import instructorService from '@/services/instructorService';

interface CoursePaymentProps {
  courseId: string;
  courseTitle: string;
  price: number;
  currency?: string;
  receiverAddress?: string;
  coursePaymentMethodId?: number | string;
  onPaymentSuccess?: () => void;
  onEnrollmentComplete?: () => void;
}

interface WalletInfo {
  name: string;
  address: string;
  api: any;
}

const CoursePayment: React.FC<CoursePaymentProps> = ({
  courseId,
  courseTitle,
  price,
  currency = 'ADA',
  receiverAddress,
  coursePaymentMethodId,
  onPaymentSuccess,
  onEnrollmentComplete
}) => {
  const { toasts, removeToast, success, error } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected from localStorage using WalletService
    const storedWallet = WalletService.getStoredWallet();
    if (storedWallet) {
      setConnectedWallet({
        name: storedWallet.name,
        address: storedWallet.address,
        api: null
      });
    }
  }, []);

  const handleWalletConnect = (walletInfo: WalletInfo) => {
    console.log('Wallet connected for payment:', walletInfo);
    setConnectedWallet(walletInfo);
    setShowWallet(false);
    // Save wallet data using WalletService
    WalletService.saveWallet(walletInfo);
    success('Wallet connected successfully!');
  };

  const handleWalletDisconnect = () => {
    setConnectedWallet(null);
    setShowWallet(true);
    // Clear wallet data using WalletService
    WalletService.disconnectWallet();
  };

  const sendTransaction = async (walletApi: any, recipientAddress: string, amount: number): Promise<string> => {
    try {
      // Enable the browser wallet via Mesh (re-enable from saved wallet name)
      const walletName = connectedWallet?.name;
      if (!walletName) throw new Error('Wallet not selected');
      const wallet = await BrowserWallet.enable(walletName as any);

      // Prepare UTxOs and change address from the wallet
      const utxos = await wallet.getUtxos();
      const changeAddress = await wallet.getChangeAddress();
     

      // Optional provider via Blockfrost for indexing (if available)
      const bfKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
      const provider = bfKey ? new BlockfrostProvider(bfKey) : undefined;

      // Build transaction using MeshTxBuilder low-level API
      const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
      const unsignedTx = await txBuilder
        .txOut(recipientAddress, [{ unit: 'lovelace', quantity: (amount * 1_000_000).toString() }])
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();

      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err: any) {
      console.error('Transaction error:', err);
      throw new Error(err.message || 'Failed to send ADA transaction');
    }
  };

  const handlePayment = async () => {
    if (!user?.id) {
      error('Please login to continue');
      return;
    }

    if (!connectedWallet || !connectedWallet.address) {
      error('Please connect your wallet first');
      setShowWallet(true);
      return;
    }

    // Mesh will re-enable wallet by name; api presence not strictly required here

    if (!receiverAddress || !coursePaymentMethodId) {
      error('Payment method is not configured for this course');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Step 1: Send transaction with wallet to course receiver address
      const txHash = await sendTransaction(connectedWallet.api, receiverAddress, price);
      
      // Step 2: Get wallet address using Mesh JS
      const wallet = await BrowserWallet.enable(connectedWallet.name as any);
      const senderAddress = await wallet.getChangeAddress();
      if (!senderAddress) {
        throw new Error('Wallet address is not available');
      }
      
      const enrollRequest = {
        userId: user.id,
        courseId: courseId,
        senderAddress: senderAddress,
        coursePaymentMethodId: Number(coursePaymentMethodId),
        priceAda: price,
        txHash: txHash,
      };

      const enrollResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com'}/api/enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(enrollRequest)
      });

      if (!enrollResponse.ok) {
        throw new Error('Failed to enroll in course');
      }

      const enrollData = await enrollResponse.json();
      
      if (enrollData.code === 1000 || enrollData.result) {
        // Update localStorage
        try {
          const recentRaw = localStorage.getItem('my_courses_recent');
          const recent: Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
          const nowIso = new Date().toISOString();
          const updated = [
            { id: String(courseId), title: courseTitle, accessedAt: nowIso },
            ...recent.filter(c => c.id !== String(courseId))
          ].slice(0, 20);
          localStorage.setItem('my_courses_recent', JSON.stringify(updated));
        } catch {}

        success('Payment successful! You are now enrolled in the course.');
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        
        if (onEnrollmentComplete) {
          onEnrollmentComplete();
        }
      } else {
        throw new Error(enrollData.message || 'Enrollment failed');
      }
      
    } catch (err: any) {
      console.error('Payment error:', err);
      error(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount: number, currency?: string) => {
    try {
      // For Cardano ADA, always show as ADA
      if (currency && currency.toUpperCase() === 'ADA') {
        return `${amount} ADA`;
      }
      if (currency && currency.toUpperCase() === 'VND') {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
      }
      if (currency && currency.toUpperCase() !== 'USD') {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() as any }).format(amount);
      }
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    } catch {
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    }
  };

  return (
    <div className="space-y-4">
      {!connectedWallet ? (
        <div>
          <CardanoWalletButton 
            title="Connect Wallet to Pay"
            onWalletConnect={handleWalletConnect}
            onWalletDisconnect={handleWalletDisconnect}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Wallet Connected: {connectedWallet.name}
                </p>
                <p className="text-xs text-blue-600 font-mono mt-1">
                  {connectedWallet.address ? 
                    `${connectedWallet.address.slice(0, 10)}...${connectedWallet.address.slice(-8)}` : 
                    'Address loading...'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={handleWalletDisconnect}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Change
              </button>
            </div>
          </div>

          {showWallet && (
            <CardanoWalletButton 
              title="Reconnect Wallet"
              onWalletConnect={handleWalletConnect}
              onWalletDisconnect={handleWalletDisconnect}
            />
          )}

          
          <button
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing ADA Payment...
              </>
            ) : (
              `Pay ${formatPrice(price, 'ADA')} with Cardano`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursePayment;
