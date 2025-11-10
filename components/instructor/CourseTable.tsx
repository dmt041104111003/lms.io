import React from 'react';
import instructorService, { CourseResponse } from '@/services/instructorService';
import Tooltip from '@/components/ui/Tooltip';
import Card from '@/components/ui/Card';
import Dropdown from '@/components/ui/Dropdown';
import Dialog from '@/components/ui/Dialog';
import { useDialog } from '@/hooks/useDialog';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

const truncateText = (text: string | null | undefined, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface CourseTableProps {
  courses: CourseResponse[];
  onRefresh: () => void;
  onEdit?: (course: CourseResponse) => void;
  onCourseDelete?: (courseId: string) => void;
  onCourseUpdate?: (courseId: string, updates: Partial<CourseResponse>) => void;
}

const CourseTable: React.FC<CourseTableProps> = ({ courses, onRefresh, onEdit, onCourseDelete, onCourseUpdate }) => {
  const { dialog, showDialog, closeDialog } = useDialog();
  const { toasts, removeToast, success, error } = useToast();

  const handleDelete = (courseId: string) => {
    showDialog(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      async () => {
        try {
          await instructorService.deleteCourse(courseId);
          success('Course deleted successfully');
          if (onCourseDelete) {
            onCourseDelete(courseId);
          } else if (onRefresh) {
            onRefresh();
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
          error(errorMessage);
        }
      },
      { type: 'danger', confirmText: 'Delete' }
    );
  };

  const handlePublish = (course: CourseResponse) => {
    showDialog(
      'Publish Course',
      'Are you sure you want to publish this course? It will be visible to all users.',
      async () => {
        try {
          await instructorService.publishCourse(course.id);
          success('Course published successfully');
          if (onCourseUpdate) {
            onCourseUpdate(course.id, { draft: false });
          }
          if (onRefresh) {
            onRefresh();
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to publish course';
          error(errorMessage);
        }
      },
      { confirmText: 'Publish' }
    );
  };

  const handleUnpublish = (course: CourseResponse) => {
    showDialog(
      'Unpublish Course',
      'Are you sure you want to unpublish this course? It will no longer be visible to users.',
      async () => {
        try {
          await instructorService.unpublishCourse(course.id);
          success('Course unpublished successfully');
          if (onCourseUpdate) {
            onCourseUpdate(course.id, { draft: true });
          }
          if (onRefresh) {
            onRefresh();
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish course';
          error(errorMessage);
        }
      },
      { confirmText: 'Unpublish' }
    );
  };

  return (
    <>
      <Card className="overflow-visible">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 border-b-2 border-r border-gray-300">
                  Course
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 border-b-2 border-r border-gray-300">
                  Status
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-r border-gray-300">
                  Type
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-r border-gray-300">
                  Price
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 border-b-2 border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {courses.map((course) => {
                const displayTitle = truncateText(course.title, 20);

                return (
                  <tr key={course.id} className="hover:bg-gray-50 border-b border-gray-300">
                    <td className="px-3 py-4 border-r border-gray-300">
                      <div className="flex items-center min-w-0">
                        {course.imageUrl ? (
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                            No Image
                          </div>
                        )}
                        <div className="ml-2 min-w-0 flex-1">
                          <Tooltip content={course.title}>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {displayTitle}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <span
                        className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${
                          course.draft
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${course.draft ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        {course.draft ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <span className="text-sm text-gray-700">
                        {course.courseType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-300">
                      <span className="text-sm text-gray-700">
                        {course.price !== undefined ? `$${course.price}` : 'Free'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      <Dropdown
                        options={[
                          ...(onEdit ? [{
                            label: 'Edit',
                            value: 'edit',
                            onClick: () => onEdit(course),
                          }] : []),
                          {
                            label: course.draft ? 'Publish' : 'Unpublish',
                            value: 'publish',
                            onClick: () => course.draft ? handlePublish(course) : handleUnpublish(course),
                            className: course.draft ? 'text-green-600' : 'text-orange-600',
                          },
                          {
                            label: 'Delete',
                            value: 'delete',
                            onClick: () => handleDelete(course.id),
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
          {courses.map((course) => {
            const displayTitle = truncateText(course.title, 20);

            return (
              <div key={course.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center flex-1 min-w-0">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        No Image
                      </div>
                    )}
                    <div className="ml-2 flex-1 min-w-0">
                      <Tooltip content={course.title}>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {displayTitle}
                        </div>
                      </Tooltip>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full border ${
                            course.draft
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${course.draft ? 'bg-yellow-500' : 'bg-green-500'}`} />
                          {course.draft ? 'Draft' : 'Published'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                      {course.courseType || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                      {course.price !== undefined ? `$${course.price}` : 'Free'}
                    </span>
                    <Dropdown
                      options={[
                        ...(onEdit ? [{
                          label: 'Edit',
                          value: 'edit',
                          onClick: () => onEdit(course),
                        }] : []),
                        {
                          label: course.draft ? 'Publish' : 'Unpublish',
                          value: 'publish',
                          onClick: () => course.draft ? handlePublish(course) : handleUnpublish(course),
                          className: course.draft ? 'text-green-600' : 'text-orange-600',
                        },
                        {
                          label: 'Delete',
                          value: 'delete',
                          onClick: () => handleDelete(course.id),
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

export default CourseTable;

