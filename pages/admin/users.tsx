import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import UserTable from '@/components/admin/UserTable';
import adminService, { UserResponse, PageResponse, RoleResponse } from '@/services/adminService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<PageResponse<UserResponse> | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers({
        keyword: debouncedKeyword || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        page,
        size,
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await adminService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [debouncedKeyword, selectedRole, selectedStatus, page, size]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, selectedRole, selectedStatus]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Users Management</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and monitor all users in the system</p>
          </div>

          {/* Filters */}
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by name, email, username..."
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                  }}
                  aria-label="Filter by role"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                  }}
                  aria-label="Filter by status"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          {users && users.content.length > 0 ? (
            <>
              <UserTable 
                users={users.content} 
                roles={roles} 
                onRefresh={fetchUsers}
                onUserUpdate={(updatedUser) => {
                  if (users) {
                    setUsers({
                      ...users,
                      content: users.content.map(u => 
                        u.id === updatedUser.id ? updatedUser : u
                      )
                    });
                  }
                }}
                onUserDelete={(userId) => {
                  if (users) {
                    const newContent = users.content.filter(u => u.id !== userId);
                    const newTotalElements = users.totalElements - 1;
                    const newTotalPages = Math.ceil(newTotalElements / size);
                    
                    setUsers({
                      ...users,
                      content: newContent,
                      totalElements: newTotalElements,
                      totalPages: newTotalPages
                    });

                    if (newContent.length === 0 && page > 0) {
                      setPage(page - 1);
                    }
                  }
                }}
              />
              
              {/* Pagination */}
              {users.totalPages > 1 && (
                <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {page * size + 1} to {Math.min((page + 1) * size, users.totalElements)} of {users.totalElements} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= users.totalPages - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-600">No users found</div>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminUsers;

