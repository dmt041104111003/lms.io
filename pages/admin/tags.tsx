import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagTable from '@/components/admin/TagTable';
import adminService, { TagResponse } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toasts, removeToast, success, error } = useToast();

  const fetchTags = async () => {
    try {
      const data = await adminService.getTags();
      setTags(data);
    } catch (err) {
      error('Failed to load tags');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setLoading(true);
    try {
      await adminService.createTag(newTagName.trim());
      setNewTagName('');
      success('Tag created successfully');
      fetchTags();
    } catch (err) {
      error('Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <SEO
        title="Manage Tags - Admin"
        description="Manage tags for courses and content."
        keywords="admin, tags, management"
        url="/admin/tags"
        noindex={true}
        nofollow={true}
      />
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tags</h2>
            <p className="text-sm text-gray-600 mt-1">Create and manage tags</p>
          </div>

          <Card className="p-4">
            <form onSubmit={handleCreateTag} className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <Input
                  label="New tag name"
                  placeholder="e.g. blockchain"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Tag'}
                </Button>
              </div>
            </form>
          </Card>

          <TagTable tags={tags} onRefresh={fetchTags} />
        </div>
      </AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AdminGuard>
  );
};

export default AdminTags;


