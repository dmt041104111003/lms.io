import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import Card from '@/components/ui/Card';

const AdminDashboard: React.FC = () => {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of your system</p>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                onClick={() => window.location.href = '/admin/users'}
                className="p-4"
              >
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </Card>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;

