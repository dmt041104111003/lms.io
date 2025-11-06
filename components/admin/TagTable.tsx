import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import ToastContainer from '@/components/ui/ToastContainer';
import { useDialog } from '@/hooks/useDialog';
import { useToast } from '@/hooks/useToast';
import adminService, { TagResponse } from '@/services/adminService';

interface TagTableProps {
  tags: TagResponse[];
  onRefresh: () => void;
}

const TagTable: React.FC<TagTableProps> = ({ tags, onRefresh }) => {
  const { dialog, showDialog, closeDialog } = useDialog();
  const { toasts, removeToast, success, error } = useToast();

  const handleDelete = (id: number) => {
    showDialog(
      'Delete Tag',
      'Are you sure you want to delete this tag?',
      async () => {
        try {
          await adminService.deleteTag(id);
          success('Tag deleted successfully');
          onRefresh();
        } catch (err) {
          error('Failed to delete tag');
        }
      },
      { type: 'danger', confirmText: 'Delete' }
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5 border-b-2 border-r border-gray-300">
                  Name
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5 border-b-2 border-r border-gray-300">
                  Slug
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5 border-b-2 border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 border-b border-gray-300">
                  <td className="px-3 py-4 border-r border-gray-300 text-sm text-gray-900 text-center break-words">
                    {tag.name}
                  </td>
                  <td className="px-3 py-4 border-r border-gray-300 text-sm text-gray-600 text-center break-words">
                    {tag.slug}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(tag.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-sm text-center text-gray-500" colSpan={3}>
                    No tags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-gray-300">
          {tags.map((tag) => (
            <div key={tag.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{tag.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(tag.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {tags.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">No tags found.</div>
          )}
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

export default TagTable;


