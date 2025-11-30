import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import progressService, { ProgressResponse } from '@/services/progressService';
import feedbackService from '@/services/feedbackService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

const MyCoursesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success: toastSuccess, error: toastError } = useToast();
  const [progresses, setProgresses] = useState<ProgressResponse[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCourse, setFeedbackCourse] = useState<{ id: string; title?: string } | null>(null);
  const [rate, setRate] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alreadyFeedbackSet, setAlreadyFeedbackSet] = useState<Set<string>>(new Set());
  const [certificateRequested, setCertificateRequested] = useState<Set<string>>(new Set());
  const [requestingCertificate, setRequestingCertificate] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const data = await progressService.getUserProgress(user.id);
        setProgresses(Array.isArray(data) ? data : []);
      } catch {
        setProgresses([]);
      }
    };
    load();
  }, [user]);

  const openFeedback = (course: { id: string; title?: string }) => {
    if (alreadyFeedbackSet.has(course.id)) {
      toastError('You already submitted feedback for this course.');
      return;
    }
    setFeedbackCourse({ id: course.id, title: course.title });
    setRate(5);
    setContent('');
    setFeedbackOpen(true);
  };

  const submitFeedback = async () => {
    if (!feedbackCourse?.id) return;
    try {
      setSubmitting(true);
      const res = await feedbackService.addWithMessage(feedbackCourse.id, { rate, content });
      setFeedbackOpen(false);
      setAlreadyFeedbackSet(prev => new Set(prev).add(feedbackCourse.id));
      toastSuccess(res.message || 'Feedback submitted');
    } catch (e: any) {
      const msg = e?.message || 'Failed to submit feedback';
      if ((msg + '').toLowerCase().includes('already')) {
        setAlreadyFeedbackSet(prev => new Set(prev).add(feedbackCourse.id));
      }
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const computeTotalItems = (p: ProgressResponse) => {
    const chapterItems = (p.chapters || []).reduce((acc, ch) => acc + (ch.lectures?.length || 0) + (ch.tests?.length || 0), 0);
    const courseTests = p.courseTests?.length || 0;
    return chapterItems + courseTests;
  };

  const computeCompleted = (p: ProgressResponse) => {
    return (p.testAndLectureCompleted || []).filter(x => x.completed).length;
  };

  const formatTimeAgo = (iso?: string) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    const diff = Math.max(0, Date.now() - t);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'Vừa truy cập';
    if (diff < hour) return `${Math.floor(diff / minute)} phút trước`;
    if (diff < day) return `${Math.floor(diff / hour)} giờ trước`;
    return `${Math.floor(diff / day)} ngày trước`;
  };

  const openCourseAndTouchRecent = (course: { id: string; title?: string; imageUrl?: string }) => {
    router.push(`/learn/${course.id}`);
  };

  const requestCertificate = async (courseId: string, courseTitle?: string) => {
    if (!user?.id) {
      toastError('You must be logged in to request a certificate');
      return;
    }

    setRequestingCertificate(true);
    try {
      // First update course completion status
      await progressService.updateCourseCompletionStatus(user.id, courseId);
      
      // Mark certificate as requested for this course
      setCertificateRequested(prev => new Set(Array.from(prev).concat([courseId])));
      
      toastSuccess('Course marked completed. Certificate request is pending approval.');
    } catch (error: any) {
      toastError(error.message || 'Failed to request certificate. Please try again.');
    } finally {
      setRequestingCertificate(false);
    }
  };

  return (
    <>
      <SEO
        title="My Courses - lms.cardano2vn.io"
        description="Your enrolled courses"
        keywords="my courses, enrolled"
        url="/my-courses"
      />
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6">
          <div className="max-w-5xl mx-auto px-4">
            
            {progresses.length === 0 ? (
              <p className="text-gray-600">No courses yet.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">My Courses</h2>
                  <ul className="divide-y divide-gray-200">
                    {progresses.map((p, idx) => {
                      const total = computeTotalItems(p);
                      const done = computeCompleted(p);
                      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <li key={idx} className="py-2">
                          <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              <div className="shrink-0">
                                {p.imageUrl && (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="w-44 h-28 sm:w-48 sm:h-28 object-cover rounded-md border"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 ">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                      <div className="text-base font-semibold text-gray-900 truncate mb-2">{p.title}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">{done}/{total} completed</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                                      onClick={() => openCourseAndTouchRecent({ id: p.id, title: p.title, imageUrl: p.imageUrl })}
                                    >
                                      Go to course
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-2 bg-blue-500" style={{ width: `${percent}%` }} />
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">{percent}%</div>
                                </div>
                                <div className='flex justify-end gap-3'>
                                  <button
                                    className={`text-sm whitespace-nowrap ${alreadyFeedbackSet.has(p.id) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:underline'}`}
                                    onClick={() => openFeedback({ id: p.id, title: p.title })}
                                    disabled={alreadyFeedbackSet.has(p.id)}
                                    title={alreadyFeedbackSet.has(p.id) ? 'You already submitted feedback' : 'Leave feedback'}
                                  >
                                    {alreadyFeedbackSet.has(p.id) ? 'Feedback submitted' : 'Leave feedback'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {feedbackOpen && feedbackCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Leave feedback for {feedbackCourse.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRate(star)}
                    className={`text-2xl ${star <= rate ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts about this course..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                disabled={submitting}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default MyCoursesPage;
