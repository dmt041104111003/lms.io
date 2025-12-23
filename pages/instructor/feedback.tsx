import React, { useEffect, useMemo, useState } from 'react';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import instructorService from '@/services/instructorService';
import feedbackService, { FeedbackItem, PageResponse } from '@/services/feedbackService';

const PAGE_SIZE = 10;

const InstructorFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const { toasts, removeToast, error: showError, success } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<FeedbackItem> | null>(null);
  const reload = async (resetPage = false) => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const nextPage = resetPage ? 0 : page;
      const res = await feedbackService.getByCoursePaged(selectedCourseId, nextPage, PAGE_SIZE, true);
      if (resetPage) setPage(0);
      setData(res);
    } catch (e: any) {
      showError(e?.message || 'Không tải được feedback');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        if (profile?.id) {
          setProfileId(profile.id);
          const dashboard = await instructorService.getEducatorDashboard(profile.id);
          const mapped = (dashboard || []).map((c) => ({ id: c.id, title: c.title }));
          setCourses(mapped);
          if (mapped.length > 0) {
            setSelectedCourseId(mapped[0].id);
          }
        } else {
          showError('Không tìm thấy hồ sơ giảng viên');
        }
      } catch (e: any) {
        showError(e?.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [user, showError]);

  useEffect(() => {
    reload();
  }, [selectedCourseId, page]);

  const totalPages = useMemo(() => data?.totalPages || 0, [data]);

  return (
    <InstructorGuard>
      <SEO title="Quản lý Feedback - Instructor" description="Quản lý feedback khóa học" url="/instructor/feedback" noindex={true} nofollow={true} />
      <InstructorLayout loading={loading}>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Quản lý Feedback</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Xem phản hồi học viên theo khóa học</p>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Khóa học</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => { setSelectedCourseId(e.target.value); setPage(0); }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setPage(0)}>Làm mới</Button>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(data?.content || []).map((fb) => (
                    <tr key={fb.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{fb.fullName || fb.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fb.rate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xl truncate" title={fb.content}>{fb.content}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 rounded ${fb.status === 'HIDDEN' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{fb.status || 'VISIBLE'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {fb.status === 'HIDDEN' ? (
                            <Button
                              variant="outline"

                              onClick={async () => {
                                try { await feedbackService.show(fb.id); success('Đã hiện feedback'); await reload(); } catch (e: any) { showError(e?.message || 'Không thể hiện'); }
                              }}
                            >
                              Hiện
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
         
                              onClick={async () => {
                                try { await feedbackService.hide(fb.id); success('Đã ẩn feedback'); await reload(); } catch (e: any) { showError(e?.message || 'Không thể ẩn'); }
                              }}
                            >
                              Ẩn
                            </Button>
                          )}
                          <Button
                            variant="outline"
   
                            onClick={async () => {
                              if (!confirm('Xóa feedback này?')) return;
                              try { await feedbackService.remove(fb.id); success('Đã xóa feedback'); await reload(true); } catch (e: any) { showError(e?.message || 'Không thể xóa'); }
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(data?.content || []).length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>Không có feedback</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="text-xs text-gray-600">Trang {page + 1}/{Math.max(totalPages, 1)}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Trước</Button>
                <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</Button>
              </div>
            </div>
          </Card>

          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorFeedbackPage;
