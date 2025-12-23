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
import { listQna, reply as replyApi, deleteComment, LectureQnaResponse } from '@/services/qnaService';
import { MessageCircle, Reply, Trash2, User, Clock, ChevronDown } from 'lucide-react';

const InstructorQnaPage: React.FC = () => {
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lectures, setLectures] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(null);
  const [qna, setQna] = useState<LectureQnaResponse[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const boot = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        if (profile?.id) {
          const dashboard = await instructorService.getEducatorDashboard(profile.id);
          const mapped = (dashboard || []).map((c) => ({ id: c.id, title: c.title }));
          setCourses(mapped);
          if (mapped.length > 0) setSelectedCourseId(mapped[0].id);
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
    const loadLectures = async () => {
      if (!selectedCourseId) return;
      try {
        setLoading(true);
        // Ưu tiên gọi API course detail trả về chapters/lectures đầy đủ
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';
        const res = await fetch(`${base}/api/course/${encodeURIComponent(selectedCourseId)}`, { credentials: 'include' });
        const data = await res.json();
        let chs: any[] = [];
        if (res.ok && data?.code === 1000 && data?.result) {
          chs = data.result.chapters || [];
        } else {
          // Fallback nhẹ nhàng qua instructorService (có thể không có chapters)
          const course = await instructorService.getCourseById(selectedCourseId);
          chs = (course as any).chapters || [];
        }
        const ls = chs.flatMap((ch: any) => (ch.lectures || []).map((l: any) => ({ id: l.id, title: l.title })));
        setLectures(ls);
        setSelectedLectureId(ls[0]?.id ?? null);
      } catch (e: any) {
        showError(e?.message || 'Không tải được bài giảng');
        setLectures([]);
        setSelectedLectureId(null);
      } finally {
        setLoading(false);
      }
    };
    loadLectures();
  }, [selectedCourseId, showError]);

  useEffect(() => {
    const loadQna = async () => {
      if (!selectedLectureId) return;
      try {
        setLoading(true);
        const items = await listQna(selectedLectureId);
        setQna(items);
      } catch (e: any) {
        showError(e?.message || 'Không tải được Q&A');
        setQna([]);
      } finally {
        setLoading(false);
      }
    };
    loadQna();
  }, [selectedLectureId, showError]);

  const handleReply = async (commentId: number) => {
    const content = replyContent[commentId]?.trim();
    if (!content) {
      showError('Vui lòng nhập nội dung trả lời');
      return;
    }
    try {
      setLoading(true);
      await replyApi(commentId, content);
      success('Đã trả lời thành công');
      setReplyContent(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      if (selectedLectureId) {
        const items = await listQna(selectedLectureId);
        setQna(items);
      }
    } catch (e: any) {
      showError(e?.message || 'Không trả lời được');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      setLoading(true);
      await deleteComment(commentId);
      success('Đã xóa');
      if (selectedLectureId) {
        const items = await listQna(selectedLectureId);
        setQna(items);
      }
    } catch (e: any) {
      showError(e?.message || 'Không xóa được');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorGuard>
      <SEO title="Quản lý Q&A - Instructor" description="Quản lý câu hỏi & trả lời theo bài giảng" url="/instructor/qna" noindex={true} nofollow={true} />
      <InstructorLayout loading={loading}>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Quản lý Q&A</h2>
            </div>
            <p className="text-gray-600">Xem và phản hồi câu hỏi của học viên theo từng bài giảng</p>
          </div>

          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ChevronDown className="text-gray-500" size={16} />
              <h3 className="font-semibold text-gray-900">Lọc câu hỏi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khóa học</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bài giảng</label>
                <select
                  value={selectedLectureId ?? ''}
                  onChange={(e) => setSelectedLectureId(Number(e.target.value) || null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {lectures.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">
                {qna.length > 0 ? `${qna.length} câu hỏi` : 'Chưa có câu hỏi nào'}
              </h3>
            </div>
            <div className="space-y-4">
              {qna.map((cmt) => (
                <div key={cmt.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{cmt.userName || cmt.userId || 'Người dùng'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(cmt.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-700 leading-relaxed bg-white rounded-lg p-4 border border-gray-100">
                        {cmt.content}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setReplyingTo(replyingTo === cmt.id ? null : cmt.id)}
                        className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Reply size={14} />
                        {replyingTo === cmt.id ? 'Hủy' : 'Trả lời'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(cmt.id)}
                        className="flex items-center gap-1 hover:bg-red-50 hover:border-red-300 text-red-600"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </Button>
                    </div>
                  </div>
                  
                  {replyingTo === cmt.id && (
                    <div className="mt-4 ml-12">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <textarea
                          value={replyContent[cmt.id] || ''}
                          onChange={(e) => setReplyContent(prev => ({ ...prev, [cmt.id]: e.target.value }))}
                          placeholder="Nhập nội dung trả lời..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button 
                            onClick={() => handleReply(cmt.id)}
                            className="flex items-center gap-1"
                          >
                            <Reply size={14} />
                            Gửi trả lời
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent(prev => ({ ...prev, [cmt.id]: '' }));
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {cmt.replies && cmt.replies.length > 0 && (
                    <div className="mt-4 ml-12 space-y-3">
                      {cmt.replies.map((rep) => (
                        <div key={rep.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="text-green-600" size={12} />
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">{rep.userName || rep.userId || 'Người dùng'}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(rep.id)}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          <div className="text-gray-700 mt-2 leading-relaxed">
                            {rep.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {qna.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                  <div className="text-gray-500 font-medium">Chưa có câu hỏi nào</div>
                  <div className="text-gray-400 text-sm mt-1">Học viên sẽ đặt câu hỏi tại đây</div>
                </div>
              )}
            </div>
          </Card>

          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorQnaPage;
