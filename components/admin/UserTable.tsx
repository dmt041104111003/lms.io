import React from 'react';
import { useRouter } from 'next/router';
import adminService, { UserResponse, RoleResponse } from '@/services/adminService';
import Tooltip from '@/components/ui/Tooltip';
import Card from '@/components/ui/Card';
import Dropdown from '@/components/ui/Dropdown';
import Dialog from '@/components/ui/Dialog';
import { useDialog } from '@/hooks/useDialog';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import ToastContainer from '@/components/ui/ToastContainer';

const truncateText = (text: string | null | undefined, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface UserTableProps {
  users: UserResponse[];
  roles: RoleResponse[];
  onRefresh: () => void;
  onEdit?: (user: UserResponse) => void;
  onUserUpdate?: (user: UserResponse) => void;
  onUserDelete?: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, roles, onRefresh, onEdit, onUserUpdate, onUserDelete }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { dialog, showDialog, closeDialog } = useDialog();
  const { toasts, removeToast, success, error } = useToast();

  const handleBan = (userId: string) => {
    showDialog(
      'Ban User',
      'Are you sure you want to ban this user?',
      async () => {
        try {
          await adminService.banUser(userId);
          success('User banned successfully');
          
          if (currentUser && currentUser.id === userId) {
            localStorage.removeItem('access_token');
            router.push('/login');
            return;
          }
          
          const user = users.find(u => u.id === userId);
          if (user && onUserUpdate) {
            onUserUpdate({ ...user, status: 'BANNED' });
          } else {
            onRefresh();
          }
        } catch (err) {
          error('Failed to ban user');
        }
      },
      { type: 'danger', confirmText: 'Ban' }
    );
  };

  const handleUnban = (userId: string) => {
    showDialog(
      'Unban User',
      'Are you sure you want to unban this user?',
      async () => {
        try {
          await adminService.unbanUser(userId);
          success('User unbanned successfully');
          const user = users.find(u => u.id === userId);
          if (user && onUserUpdate) {
            onUserUpdate({ ...user, status: 'ACTIVE' });
          } else {
            onRefresh();
          }
        } catch (err) {
          error('Failed to unban user');
        }
      },
      { confirmText: 'Unban' }
    );
  };

  const handleDelete = (userId: string) => {
    showDialog(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      async () => {
        try {
          await adminService.deleteUser(userId);
          success('User deleted successfully');
          
          if (currentUser && currentUser.id === userId) {
            localStorage.removeItem('access_token');
            router.push('/login');
            return;
          }
          
          if (onUserDelete) {
            onUserDelete(userId);
          } else if (onRefresh) {
            onRefresh();
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
          error(errorMessage);
        }
      },
      { type: 'danger', confirmText: 'Delete' }
    );
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await adminService.updateUserRole(userId, newRole);
      success('User role updated successfully');
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      } else {
        onRefresh();
      }
    } catch (err) {
      error('Failed to update user role');
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 border-b-2 border-r border-gray-300">
                  User
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 border-b-2 border-r border-gray-300">
                  Email
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-r border-gray-300">
                  Role
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-r border-gray-300">
                  Status
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {users.map((user) => {
                const fullName = (user.fullName || '').trim();
                const displayName = truncateText(fullName || (user.email?.split('@')[0] || ''), 15);
                const emailOrMethod = user.email || user.loginMethod?.name || 'N/A';
                const displayEmail = truncateText(emailOrMethod, 18);
                const initials = fullName
                  ? fullName.split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
                  : (user.email?.[0]?.toUpperCase() || 'U');

                return (
                  <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-300">
                    <td className="px-3 py-4 border-r border-gray-300">
                      <div className="flex items-center min-w-0">
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={fullName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="ml-2 min-w-0 flex-1">
                          <Tooltip content={fullName}>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {displayName}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <Tooltip content={emailOrMethod}>
                        <div className="text-sm text-gray-900 truncate">
                          {displayEmail}
                        </div>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <Dropdown
                        options={roles.map(role => ({
                          label: role.name,
                          value: role.name,
                          onClick: () => handleRoleChange(user.id, role.name),
                        }))}
                        value={user.role?.name || 'USER'}
                        className="w-full"
                        buttonClassName="text-xs w-full"
                      />
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <span className="text-sm text-gray-700">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      <Dropdown
                        options={[
                          ...(onEdit ? [{
                            label: 'Edit',
                            value: 'edit',
                            onClick: () => onEdit(user),
                          }] : []),
                          user.status === 'ACTIVE' ? {
                            label: 'Ban',
                            value: 'ban',
                            onClick: () => handleBan(user.id),
                            className: 'text-orange-600',
                          } : {
                            label: 'Unban',
                            value: 'unban',
                            onClick: () => handleUnban(user.id),
                            className: 'text-green-600',
                          },
                          {
                            label: 'Delete',
                            value: 'delete',
                            onClick: () => handleDelete(user.id),
                            className: 'text-red-600',
                          },
                        ]}
                        placeholder="Actions"
                        className="ml-auto w-full max-w-32"
                        buttonClassName="text-xs w-full"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {users.map((user) => {
            const fullName = (user.fullName || '').trim();
            const displayName = truncateText(fullName || (user.email?.split('@')[0] || ''), 15);
            const emailOrMethod = user.email || user.loginMethod?.name || 'N/A';
            const displayEmail = truncateText(emailOrMethod, 18);
            const initials = fullName
              ? fullName.split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
              : (user.email?.[0]?.toUpperCase() || 'U');

            return (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center flex-1 min-w-0">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={fullName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="ml-2 flex-1 min-w-0">
                      <Tooltip content={fullName}>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <Dropdown
                      options={roles.map(role => ({
                        label: role.name,
                        value: role.name,
                        onClick: () => handleRoleChange(user.id, role.name),
                      }))}
                      value={user.role?.name || 'USER'}
                      className="w-28"
                      buttonClassName="text-xs w-full"
                    />
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                      {user.status}
                    </span>
                    <Dropdown
                      options={[
                        ...(onEdit ? [{
                          label: 'Edit',
                          value: 'edit',
                          onClick: () => onEdit(user),
                        }] : []),
                        user.status === 'ACTIVE' ? {
                          label: 'Ban',
                          value: 'ban',
                          onClick: () => handleBan(user.id),
                          className: 'text-orange-600',
                        } : {
                          label: 'Unban',
                          value: 'unban',
                          onClick: () => handleUnban(user.id),
                          className: 'text-green-600',
                        },
                        {
                          label: 'Delete',
                          value: 'delete',
                          onClick: () => handleDelete(user.id),
                          className: 'text-red-600',
                        },
                      ]}
                      placeholder="Actions"
                      className="w-28"
                      buttonClassName="text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {dialog && (
        <Dialog
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          onConfirm={dialog.onConfirm}
          onCancel={closeDialog}
          type={dialog.type}
        />
      )}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default UserTable;

