import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthGuard from '@/components/auth/AuthGuard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { ProfileTabType } from '@/components/profile/ProfileTabs';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import SecurityTab from '@/components/profile/SecurityTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import PaymentHistoryTab from '@/components/profile/PaymentHistoryTab';
import CertificatesTab from '@/components/profile/CertificatesTab';
import LogoutButton from '@/components/profile/LogoutButton';
import SEO from '@/components/ui/SEO';
import authService, { UserResponse } from '@/services/authService';

const Profile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTabType>('personal');

  const fetchUserInfo = async () => {
    try {
      const userData = await authService.getMyInfo();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('access_token');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthGuard>
      <SEO
        title="Profile - lms.cardano2vn.io"
        description="Manage your Cardano2VN LMS account settings, update your profile information, and customize your preferences."
        keywords="profile, account settings, user profile, Cardano LMS profile"
        url="/profile"
        noindex={true}
        nofollow={true}
      />
      <Layout>
        <div className="min-h-screen bg-gray-50">
          {user && <ProfileHeader user={user} />}

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200">
              {user && (
                <>
                  {activeTab === 'personal' && (
                    <PersonalInfoTab user={user} onRefresh={fetchUserInfo} />
                  )}

                  {activeTab === 'security' && (
                    <SecurityTab user={user} />
                  )}

                  {activeTab === 'preferences' && (<PreferencesTab />)}
                  {activeTab === 'payments' && (<PaymentHistoryTab userId={user.id} />)}
                  {activeTab === 'certificates' && (<CertificatesTab />)}

                  <LogoutButton onLogout={handleLogout} />
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Profile;

