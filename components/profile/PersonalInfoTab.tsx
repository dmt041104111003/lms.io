import React from 'react';
import { UserResponse } from '@/services/authService';
import ProfileInfoItem from './ProfileInfoItem';
import authService from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

interface PersonalInfoTabProps {
  user: UserResponse;
  onRefresh?: () => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user, onRefresh }) => {
  const fullName = (user.fullName || '').trim() || 'Not set';
  const methodName = (user.loginMethod && (user.loginMethod as any).name) || '';

  let idLabel = 'Email';
  let idValue = '';
  if (methodName === 'GITHUB') {
    idLabel = 'GitHub';
    idValue = (user.github || '').trim();
  } else if (methodName === 'WALLET') {
    idLabel = 'Wallet address';
    idValue = (user.walletAddress || '').trim();
  } else {
    idLabel = 'Email';
    idValue = (user.email || '').trim();
  }
  if (!idValue) idValue = 'Not set';

  const [editingName, setEditingName] = React.useState(false);
  const [nameValue, setNameValue] = React.useState((user.fullName || '').trim());
  const [saving, setSaving] = React.useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const handleEdit = async (field: string) => {
    if (field === 'name') {
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    const value = (nameValue || '').trim();
    if (!value) return;
    setSaving(true);
    try {
      await authService.updateMyName(value);
      setEditingName(false);
      onRefresh && onRefresh();
      success('Updated name successfully');
    } catch (e: any) {

      error(e?.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal information</h2>
        
        <div className="space-y-4">
          {editingName ? (
            <div className="py-3 border-b border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Name</div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNameValue((user.fullName || '').trim());
                  }}
                  className="px-3 py-2 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <ProfileInfoItem
              label="Name"
              value={fullName}
              onEdit={() => handleEdit('name')}
            />
          )}
          
          <ProfileInfoItem
            label={idLabel}
            value={idValue}
          />
          
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default PersonalInfoTab;
