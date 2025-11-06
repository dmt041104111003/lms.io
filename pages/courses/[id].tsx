import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import instructorService, { CourseResponse } from '@/services/instructorService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import ToastContainer from '@/components/ui/ToastContainer';

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { toasts, removeToast, success, error: showError } = useToast();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchCourse = async () => {
      try {
        const data = await instructorService.getCourseById(id);
        const isDraftFlag =
          (data as any).draft === true ||
          (data as any).isDraft === true ||
          (data as any).status === 'DRAFT' ||
          (data as any).draft === 'true' ||
          (data as any).isDraft === 'true';
        if (isDraftFlag) {
          setError('Course not found.');
          return;
        }
        setCourse(data);
        try {
          const recentRaw = localStorage.getItem('my_courses_recent');
          const recent: Array<{ id: string }> = recentRaw ? JSON.parse(recentRaw) : [];
          setIsEnrolled(recent.some(c => c.id === String(data.id)));
        } catch {}
      } catch (err) {
        console.error('Failed to fetch course detail:', err);
        setError('Failed to load course. Please try again later.');
      }
    };

    fetchCourse();
  }, [id]);

  if (error) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6 flex items-center justify-center text-red-600">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6" />
      </Layout>
    );
  }

  const priceLabel =
    course.courseType === 'FREE' || !course.price || course.price === 0
      ? 'Free'
      : `$${course.price}`;

  // Access defensively since videoUrl may not be in the typed interface
  const previewUrl = (course as unknown as { videoUrl?: string }).videoUrl;

  const getYouTubeEmbedUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (host.includes('youtube.com') && u.pathname.startsWith('/embed/')) return url;
      if (host === 'youtu.be') {
        const id = u.pathname.replace('/', '').split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}` : undefined;
      }
      if (host.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : undefined;
      }
    } catch {}
    return undefined;
  };
  const youtubeEmbedUrl = getYouTubeEmbedUrl(previewUrl);

  return (
    <>
      <SEO
        title={`${course.title} - lms.cardano2vn.io`}
        description={course.description || 'Course detail'}
        keywords={`${course.title}, course, Cardano, blockchain`}
        url={`/courses/${course.id}`}
      />
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{course.title}</h1>
                {showPreview && previewUrl ? (
                  <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                    <div className="w-full aspect-video bg-black">
                      {youtubeEmbedUrl ? (
                        <iframe
                          className="w-full h-full"
                          src={`${youtubeEmbedUrl}?rel=0`}
                          title="Course preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full h-full">
                          <source src={previewUrl} />
                        </video>
                      )}
                    </div>
                  </div>
                ) : (
                  course.imageUrl && (
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )
                )}
                {course.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-gray-900">{priceLabel}</div>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={enrolling || (priceLabel === 'Free' && isEnrolled)}
                          onClick={async () => {
                            if (priceLabel === 'Free') {
                              if (isEnrolled) return;
                              if (!user?.id) {
                                router.push('/login');
                                return;
                              }
                              try {
                                setEnrolling(true);
                                await instructorService.enrollCourse({ userId: user.id, courseId: String(course.id) });
                                try {
                                  const recentRaw = localStorage.getItem('my_courses_recent');
                                  const recent: Array<{ id: string; title: string; imageUrl?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
                                  const updated = [{ id: String(course.id), title: course.title, imageUrl: course.imageUrl }, ...recent.filter(c => c.id !== String(course.id))].slice(0, 20);
                                  localStorage.setItem('my_courses_recent', JSON.stringify(updated));
                                } catch {}
                                setIsEnrolled(true);
                                success('Enrolled successfully!');
                                setTimeout(() => router.push('/my-courses'), 1200);
                              } catch (e) {
                                try {
                                  const recentRaw = localStorage.getItem('my_courses_recent');
                                  const recent: Array<{ id: string; title: string; imageUrl?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
                                  const updated = [{ id: String(course.id), title: course.title, imageUrl: course.imageUrl }, ...recent.filter(c => c.id !== String(course.id))].slice(0, 20);
                                  localStorage.setItem('my_courses_recent', JSON.stringify(updated));
                                } catch {}
                                setIsEnrolled(true);
                                success('Enrolled successfully!');
                                setTimeout(() => router.push('/my-courses'), 1200);
                                return;
                              } finally {
                                setEnrolling(false);
                              }
                            } else {
                              router.push(`/checkout/${course.id}`);
                            }
                          }}
                        >
                          {priceLabel === 'Free' ? (isEnrolled ? 'Enrolled' : 'Enroll for Free') : 'Buy Now'}
                        </button>

                        {priceLabel === 'Free' && isEnrolled && (
                          <button
                            className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => router.push('/my-courses')}
                          >
                            Go to My Courses
                          </button>
                        )}
                      </div>
                      <button
                        className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setShowPreview(prev => !prev)}
                        disabled={!previewUrl}
                      >
                        {previewUrl ? (showPreview ? 'Close Preview' : 'Preview') : 'No preview available'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default CourseDetailPage;


