import React, { useEffect, useState } from 'react';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import { useAuth } from '@/hooks/useAuth';
import notificationService, { NotificationResponse } from '@/services/notificationService';
import { useRouter } from 'next/router';
import { MoveRight } from 'lucide-react';

const InstructorNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await notificationService.getByUserId(user.id);
        setItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  return (
    <InstructorGuard>
      <SEO title="Notifications - Instructor" description="View your instructor notifications" />
      <InstructorLayout loading={loading}>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600 mt-1">Latest updates related to your courses</p>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items.length === 0 && (
                  <li className="p-4 text-sm text-gray-500">No notifications</li>
                )}
                {items.map((n) => (
                  <li key={n.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
                    <span
                      className={`mt-1 inline-block w-2 h-2 rounded-full ${
                        n.read ? 'bg-gray-300' : 'bg-blue-500'
                      }`}
                      title={n.read ? 'Read' : 'Unread'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{n.title}</h3>
                        <span className="ml-3 shrink-0 text-xs text-gray-500">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{n.content}</p>
                        {n.link && (
                          <button
                            onClick={async () => {
                              if (!n.link) return;
                              try {
                                if (!n.read) {
                                  // optimistic UI
                                  setItems((prev) => prev.map((it) => it.id === n.id ? { ...it, read: true } : it));
                                  await notificationService.markAsRead(n.id);
                                }
                              } catch (e) {
                                // revert optimistic change on failure
                                setItems((prev) => prev.map((it) => it.id === n.id ? { ...it, read: n.read } : it));
                              } finally {
                                router.push(n.link!);
                              }
                            }}
                            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            View details
                          </button>
                        )}
                      </div>
                    
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorNotificationsPage;
