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
  const [recentLocal, setRecentLocal] = useState<Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }>>([]);
  const [progresses, setProgresses] = useState<ProgressResponse[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCourse, setFeedbackCourse] = useState<{ id: string; title?: string } | null>(null);
  const [rate, setRate] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alreadyFeedbackSet, setAlreadyFeedbackSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const recentRaw = localStorage.getItem('my_courses_recent');
        const recent: Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
        const sorted = [...recent].sort((a, b) => {
          const ta = a.accessedAt ? new Date(a.accessedAt).getTime() : 0;
          const tb = b.accessedAt ? new Date(b.accessedAt).getTime() : 0;
          return tb - ta;
        });
        setRecentLocal(sorted);
      } catch {
        setRecentLocal([]);
      }
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
    try {
      const recentRaw = localStorage.getItem('my_courses_recent');
      const recent: Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
      const existing = recent.find(r => r.id === course.id);
      const nowIso = new Date().toISOString();
      const base = existing || { id: course.id, title: course.title || '', imageUrl: course.imageUrl };
      const updated = [
        { ...base, accessedAt: nowIso },
        ...recent.filter(r => r.id !== course.id),
      ].slice(0, 20);
      localStorage.setItem('my_courses_recent', JSON.stringify(updated));
      setRecentLocal(updated);
    } catch {}
    router.push(`/learn/${course.id}`);
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
            
            {recentLocal.length === 0 && progresses.length === 0 ? (
              <p className="text-gray-600">No courses yet.</p>
            ) : (
              <div className="space-y-6">
                {recentLocal.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Last access</h2>
                    <div className="flex gap-4">
                      {recentLocal.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="basis-1/4">
                          <div
                            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition cursor-pointer"
                            onClick={() => openCourseAndTouchRecent({ id: c.id, title: c.title, imageUrl: c.imageUrl })}
                            role="button"
                            aria-label={`Open course ${c.title}`}
                          >
                            {c.imageUrl && (
                              <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="w-full h-24 sm:h-28 object-cover rounded-md border"
                              />
                            )}
                            <div className="mt-3 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{c.title}</div>
                              {c.accessedAt && (
                                <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(c.accessedAt)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {progresses.length > 0 && (
                  <div>
                     <h2 className="text-lg font-semibold mb-2">Your courses</h2>
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
                                        onClick={() => openCourseAndTouchRecent({ id: p.id, title: p.title as any, imageUrl: p.imageUrl })}
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
                                <div className='flex justify-end'>
                                  <button
                                    className={`text-sm whitespace-nowrap ${alreadyFeedbackSet.has(p.id) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:underline'}`}
                                    onClick={() => openFeedback({ id: p.id, title: p.title as any })}
                                    disabled={alreadyFeedbackSet.has(p.id)}
                                    title={alreadyFeedbackSet.has(p.id) ? 'You already submitted feedback' : 'Leave feedback'}
                                  >
                                    Feedback
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
              )}
              </div>
            )}
          </div>
        </div>
      </Layout>

      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Feedback {feedbackCourse?.title ? `for ${feedbackCourse.title}` : ''}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setFeedbackOpen(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="What did you think about the course?"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="px-4 py-2 rounded border" onClick={() => setFeedbackOpen(false)} disabled={submitting}>Cancel</button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                  onClick={submitFeedback}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
;

export default MyCoursesPage;


