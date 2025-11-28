import React, { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { UserResponse } from '@/services/authService';
import CardanoWalletButton from '@/components/wallet/CardanoWalletButton';
import { WalletService } from '@/services/walletService';

interface ProfileHeaderProps {
  user: UserResponse;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [showWalletConnector, setShowWalletConnector] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{ name: string; address: string } | null>(null);
  const displayName = user.fullName?.trim() || (user.email?.split('@')[0] || 'User');
  const initials = user.fullName?.trim()
    ? user.fullName.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : (user.email?.[0]?.toUpperCase() || 'U');

  useEffect(() => {
    // Load wallet info from localStorage on component mount
    const storedWallet = WalletService.getStoredWallet();
    if (storedWallet) {
      setWalletInfo(storedWallet);
      setShowWalletConnector(false);
    } else {
      setShowWalletConnector(true);
    }
  }, []);

  const handleWalletConnect = async (walletInfo: { name: string; address: string; api?: any }) => {
    console.log('Connecting wallet:', walletInfo.name);
    
    try {
      // If wallet already has address from CardanoWalletButton, use it
      if (walletInfo.address) {
        setWalletInfo(walletInfo);
        setShowWalletConnector(false);
        // Save to localStorage
        WalletService.saveWallet(walletInfo);
      } else {
        // Use WalletService to connect and get address
        const connectedWallet = await WalletService.connectWallet(walletInfo.name);
        setWalletInfo(connectedWallet);
        setShowWalletConnector(false);
      }
      console.log('Wallet connected successfully:', walletInfo);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    console.log('Wallet disconnected');
    WalletService.disconnectWallet();
    setWalletInfo(null);
    setShowWalletConnector(true);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          {/* Avatar and Name/Email - Same row on mobile, part of row on desktop */}
          <div className="flex items-center gap-6 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                  {initials}
                </div>
              )}
            </div>
            
            {/* Name and Email */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-normal text-gray-900 truncate">
                {displayName}
              </h1>
              <p className="text-base text-gray-600 truncate">{user.email}</p>
            </div>
          </div>

          {/* Wallet Section - Same row on desktop, separate row right-aligned on mobile */}
          <div className="w-full sm:w-auto sm:flex-shrink-0 flex justify-end">
            <div className="w-48 sm:w-full">
              {walletInfo ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex flex-col space-y-2">
                    {/* <p className="text-sm font-medium text-blue-800">
                      Wallet: {walletInfo.name}
                    </p> */}
                    <p className="text-xs text-blue-600 font-mono">
                      {walletInfo.address ? 
                        `${walletInfo.address.slice(0, 10)}...${walletInfo.address.slice(-8)}` : 
                        'Address loading...'
                      }
                    </p>
                    <button
                      type="button"
                      onClick={handleWalletDisconnect}
                      className="text-xs text-red-600 hover:text-red-800 font-medium self-end"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <CardanoWalletButton 
                  title="Connect Wallet"
                  onWalletConnect={handleWalletConnect}
                  onWalletDisconnect={handleWalletDisconnect}
                />
              )}
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default ProfileHeader;

