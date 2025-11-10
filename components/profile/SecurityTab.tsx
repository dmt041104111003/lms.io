import React from 'react';
import { UserResponse } from '@/services/authService';
import ProfileInfoItem from './ProfileInfoItem';
import authService from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

interface SecurityTabProps {
  user: UserResponse;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ user }) => {
  const methodName = (user.loginMethod && (user.loginMethod as any).name) || '';
  const canChangePassword = methodName === 'EMAIL_PASSWORD';

  const [editingPwd, setEditingPwd] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const { toasts, removeToast, success, error } = useToast();

  const handleChangePassword = () => {
    if (!canChangePassword) return;
    setEditingPwd(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authService.changeMyPassword({ currentPassword, newPassword });
      success('Password updated successfully');
      setEditingPwd(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      error(e?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
        
        <div className="space-y-4">
          {editingPwd && canChangePassword ? (
            <div className="py-3 border-b border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Password</div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="password"
                  placeholder="Current password"
                  className="border rounded px-3 py-2 w-full md:w-1/3"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="border rounded px-3 py-2 w-full md:w-1/3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="border rounded px-3 py-2 w-full md:w-1/3"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={handleSavePassword}
                    disabled={saving}
                    className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingPwd(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-3 py-2 text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ProfileInfoItem
              label="Password"
              value="••••••••"
              onEdit={canChangePassword ? handleChangePassword : undefined}
              editLabel="Change"
            />
          )}
          
          <ProfileInfoItem
            label="Account status"
            value={user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default SecurityTab;
