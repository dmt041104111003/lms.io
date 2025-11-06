import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import instructorService, { PaymentHistoryResponse } from '@/services/instructorService';

const MyCoursesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<PaymentHistoryResponse[]>([]);
  const [recentLocal, setRecentLocal] = useState<Array<{ id: string; title: string; imageUrl?: string }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const data = await instructorService.getPaymentHistoryByUser(user.id);
        setHistory(data || []);
      } catch (e) {
        setHistory([]);
      }
      try {
        const recentRaw = localStorage.getItem('my_courses_recent');
        const recent: Array<{ id: string; title: string; imageUrl?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
        setRecentLocal(recent);
      } catch {
        setRecentLocal([]);
      }
    };
    load();
  }, [user]);

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
            <h1 className="text-2xl font-semibold mb-4">Your Courses</h1>
            {history.length === 0 && recentLocal.length === 0 ? (
              <p className="text-gray-600">No courses yet.</p>
            ) : (
              <div className="space-y-6">
                {recentLocal.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Recently enrolled</h2>
                    <ul className="divide-y divide-gray-200">
                      {recentLocal.map((c, idx) => (
                        <li key={idx} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {c.imageUrl && <img src={c.imageUrl} alt={c.title} className="w-14 h-10 object-cover rounded border" />}
                            <div className="text-sm font-medium text-gray-900">{c.title}</div>
                          </div>
                          <button className="text-sm text-blue-600 hover:underline" onClick={() => router.push(`/courses/${c.id}`)}>Go to course</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {history.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Payment history</h2>
                    <ul className="divide-y divide-gray-200">
                      {history.map((e, idx) => (
                        <li key={idx} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{e.courseTitle || 'Course'}</div>
                            <div className="text-xs text-gray-500">{new Date(e.createdAt || '').toLocaleString()}</div>
                          </div>
                          <button className="text-sm text-blue-600 hover:underline" onClick={() => router.push('/courses')}>View courses</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default MyCoursesPage;


