import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import instructorService, { CourseResponse, InstructorProfileResponse } from '@/services/instructorService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import ToastContainer from '@/components/ui/ToastContainer';
import { FiTag, FiClock, FiBookOpen, FiCheckSquare, FiCalendar, FiRefreshCw } from 'react-icons/fi';

interface ChapterSummary {
  id: number;
  title: string;
  orderIndex: number;
  lectures?: LectureSummary[];
  tests?: TestSummary[];
}

interface LectureSummary {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  previewFree?: boolean;
}

interface TestSummary {
  id: number;
  title: string;
  durationMinutes?: number;
  passScore?: number;
  orderIndex: number;
}
interface Tag {
  id: number;
  name: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  price?: number;
  currency?: string;
  discount?: number;
  discountEndTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  instructorId?: number;
  instructorUserId?: string;
  shortDescription?: string;
  requirement?: string;
  courseType?: string;
  courseTags?: Tag[];
  chapters?: ChapterSummary[];
  courseTests?: TestSummary[];
}

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { toasts, removeToast, success, error: showError } = useToast();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [rawCourse, setRawCourse] = useState<any | null>(null);
  
  const [instructor, setInstructor] = useState<InstructorProfileResponse | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchCourse = async () => {
      try {
        const detailUrl = `/api/course/${id}${user?.id ? `?userId=${user.id}` : ''}`;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com'}${detailUrl}`, {
          credentials: 'include',
        });
        const apiResponse = await response.json();
        
        if (apiResponse.code === 1000 && apiResponse.result) {
          const result = apiResponse.result;
          setRawCourse(result);
          const isDraftFlag =
            result.draft === true ||
            result.isDraft === true ||
            result.status === 'DRAFT' ||
            result.draft === 'true' ||
            result.isDraft === 'true';
          if (isDraftFlag) {
            setError('Course not found.');
            return;
          }
          
          setCourse({
            id: result.id,
            title: result.title || '',
            description: result.description,
            imageUrl: result.imageUrl,
            videoUrl: result.videoUrl,
            price: result.price,
            currency: (result as any).currency,
            discount: result.discount,
            discountEndTime: result.discountEndTime,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            instructorId: result.instructorId,
            instructorUserId: result.instructorUserId,
            shortDescription: result.shortDescription,
            requirement: result.requirement,
            courseType: result.courseType,
            courseTags: result.courseTags,
            chapters: result.chapters || [],
            courseTests: result.courseTests || [],
          });
          
          try {
            const recentRaw = localStorage.getItem('my_courses_recent');
            const recent: Array<{ id: string }> = recentRaw ? JSON.parse(recentRaw) : [];
            setIsEnrolled(recent.some(c => c.id === String(result.id)));
          } catch {}
        } else {
          // Fallback to basic course info
          const data = await instructorService.getCourseById(id);
          setRawCourse(data);
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
          setCourse({
            id: data.id,
            title: data.title || '',
            description: data.description,
            imageUrl: data.imageUrl,
            videoUrl: (data as any).videoUrl,
            price: data.price,
            currency: (data as any).currency,
            courseType: data.courseType,
            chapters: [],
            courseTests: [],
          });
          try {
            const recentRaw = localStorage.getItem('my_courses_recent');
            const recent: Array<{ id: string }> = recentRaw ? JSON.parse(recentRaw) : [];
            setIsEnrolled(recent.some(c => c.id === String(data.id)));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to fetch course detail:', err);
        setError('Failed to load course. Please try again later.');
      }
    };

    fetchCourse();
  }, [id, user]);

  useEffect(() => {
    if (!course) return;
    const load = async () => {
      try {
        if (course.instructorId) {
          const data = await instructorService.getInstructorProfileById(course.instructorId);
          setInstructor(data);
          return;
        }
        if (course.instructorUserId) {
          const data = await instructorService.getInstructorProfileByUserId(course.instructorUserId);
          setInstructor(data);
        }
      } catch {}
    };
    load();
  }, [course]);

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

  const discountPercent = Number((course as any).discount || 0);
  const originalPrice = Number(course.price || 0);
  const hasDiscount = originalPrice > 0 && discountPercent > 0;
  const finalPrice = hasDiscount ? +(originalPrice * (1 - discountPercent / 100)).toFixed(2) : originalPrice;

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

  const stats = (() => {
    if (!course) return null;
    let lectureCount = 0;
    let testCount = 0;
    let lectureSeconds = 0;
    let testSeconds = 0;
    (course.chapters || []).forEach((ch) => {
      const lecs = ch.lectures || [];
      lectureCount += lecs.length;
      lecs.forEach((l) => { lectureSeconds += l.duration || 0; });
      const tests = ch.tests || [];
      testCount += tests.length;
      tests.forEach((t) => { testSeconds += (t.durationMinutes || 0) * 60; });
    });
    const ctests = course.courseTests || [];
    testCount += ctests.length;
    ctests.forEach((t) => { testSeconds += (t.durationMinutes || 0) * 60; });
    return { lectureCount, testCount, lectureSeconds, testSeconds, totalSeconds: lectureSeconds + testSeconds };
  })();

  const formatDate = (d?: Date) => {
    if (!d) return '-';
    const dt = new Date(d as any);
    if (isNaN(dt.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '0 min';
    const totalMins = Math.floor(secs / 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const formatDateTime = (d?: Date) => {
    if (!d) return '-';
    const dt = new Date(d as any);
    if (isNaN(dt.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const formatPrice = (amount: number, currency?: string) => {
    try {
      if (currency && currency.toUpperCase() === 'VND') {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
      }
      if (currency && currency.toUpperCase() !== 'USD') {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() as any }).format(amount);
      }
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    } catch {
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    }
  };

  const getTimeLeftString = (d?: Date) => {
    if (!d) return null;
    const end = new Date(d as any).getTime();
    if (isNaN(end)) return null;
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return null;
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const minMs = 60 * 1000;
    const days = Math.floor(diff / dayMs);
    const hours = Math.floor((diff % dayMs) / hourMs);
    const minutes = Math.floor((diff % hourMs) / minMs);
    if (days >= 1) return `${days} day${days > 1 ? 's' : ''} left at this price!`;
    if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''} left at this price!`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} left at this price!`;
  };

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
                {course.shortDescription && (
                  <p className="text-gray-600 mb-4">{course.shortDescription}</p>
                )}
                
                {previewUrl ? (
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
                  <div className="prose max-w-none ">
                    <h2 className='text-xl font-semibold text-justify text-gray-900 mb-4'>What you'll learn</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                  </div>
                )}
                {course.requirement && (
                  <div className="prose max-w-none">
                    <h2 className='text-xl font-semibold text-gray-900 mb-4'>Requirements</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.requirement}</p>
                  </div>
                )}
                {(course as any).courseTags || (course as any).tags ? (
                  <>
                    <h2 className='text-xl font-semibold text-justify text-gray-900 mb-4'>Explore related topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {((course as any).courseTags || (course as any).tags || []).map((tag: any) => (
                        <span
                          key={tag.id || tag.tagId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                          {/* <FiTag size={12} className="text-gray-600" /> */}
                          {tag.name || tag.tagName}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}

                {instructor && (
                  <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor</h2>
                    <div className="flex items-start gap-4">
                      {instructor.avatar ? (
                        <img src={instructor.avatar} alt={instructor.name || 'Instructor'} className="w-16 h-16 rounded-full object-cover" />
                      ) : null}
                      <div className="flex-1">
                        <div className="text-lg font-medium text-gray-900">{instructor.name || 'Instructor'}</div>
                        {instructor.expertise && <div className="text-sm text-gray-600 mt-1">{instructor.expertise}</div>}
                        {instructor.bio && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{instructor.bio}</p>}
                        {instructor.socialLinks && instructor.socialLinks.length > 0 && (
                          <div className="flex gap-3 mt-3">
                            {instructor.socialLinks.map((link) => (
                              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                                {link.name || link.platform || 'Link'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Course Tests (tests not in chapters) */}
                {course.courseTests && course.courseTests.length > 0 && (
                  <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Tests</h2>
                    <div className="space-y-2">
                      {course.courseTests
                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                        .map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{test.title}</div>
                              {test.durationMinutes && (
                                <div className="text-xs text-gray-600 mt-1">Duration: {test.durationMinutes} minutes</div>
                              )}
                              {test.passScore && (
                                <div className="text-xs text-gray-600 mt-1">Pass Score: {test.passScore}%</div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                )}

                {rawCourse && (
                  <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend Data</h2>
                    <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto">
{JSON.stringify(rawCourse, null, 2)}
                    </pre>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    {course.imageUrl && (
                      <div className="mb-3 overflow-hidden rounded-md border border-gray-200">
                        <img src={course.imageUrl} alt={course.title} className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    {priceLabel === 'Free' ? (
                      <div className="text-2xl font-semibold text-gray-900">Free</div>
                    ) : (
                      <div className="mt-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <div className="text-2xl font-semibold text-gray-900">{formatPrice(finalPrice, course.currency)}</div>
                          {hasDiscount && (
                            <>
                              <div className="text-sm line-through text-gray-500">{formatPrice(originalPrice, course.currency)}</div>
                              <span className="text-sm text-gray-700">{discountPercent}% off</span>
                            </>
                          )}
                        </div>
                        {hasDiscount && course.discountEndTime && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <FiClock />
                            <span>{getTimeLeftString(course.discountEndTime) || `Ends ${formatDateTime(course.discountEndTime)}`}</span>
                          </div>
                        )}
                      </div>
                    )}
                   
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
                                  const recent: Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
                                  const nowIso = new Date().toISOString();
                                  const updated = [
                                    { id: String(course.id), title: course.title, imageUrl: course.imageUrl, accessedAt: nowIso },
                                    ...recent.filter(c => c.id !== String(course.id))
                                  ].slice(0, 20);
                                  localStorage.setItem('my_courses_recent', JSON.stringify(updated));
                                } catch {}
                                setIsEnrolled(true);
                                success('Enrolled successfully!');
                                setTimeout(() => router.push('/my-courses'), 1200);
                              } catch (e: any) {
                                showError(e?.message || 'Failed to enroll');
                              } finally {
                                setEnrolling(false);
                              }
                            } else {
                              if (!user?.id) {
                                router.push('/login');
                                return;
                              }
                              try {
                                setEnrolling(true);
                                await instructorService.enrollCourse({ userId: user.id, courseId: String(course.id) });
                                try {
                                  const recentRaw = localStorage.getItem('my_courses_recent');
                                  const recent: Array<{ id: string; title: string; imageUrl?: string; accessedAt?: string }> = recentRaw ? JSON.parse(recentRaw) : [];
                                  const nowIso = new Date().toISOString();
                                  const updated = [
                                    { id: String(course.id), title: course.title, imageUrl: course.imageUrl, accessedAt: nowIso },
                                    ...recent.filter(c => c.id !== String(course.id))
                                  ].slice(0, 20);
                                  localStorage.setItem('my_courses_recent', JSON.stringify(updated));
                                } catch {}
                                setIsEnrolled(true);
                                success('Enrolled successfully!');
                                setTimeout(() => router.push('/my-courses'), 1200);
                              } catch (e: any) {
                                showError(e?.message || 'Failed to enroll');
                              } finally {
                                setEnrolling(false);
                              }
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
                    </div>
                     {stats && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-gray-900 mb-2">This course includes</div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <FiClock size={16} className="text-gray-600" />
                            <span>{formatDuration(stats.lectureSeconds)} on-demand video</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FiBookOpen size={16} className="text-gray-600" />
                            <span>{stats.lectureCount} lectures</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCheckSquare size={16} className="text-gray-600" />
                            <span>{stats.testCount} tests</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FiCalendar size={16} className="text-gray-600" />
                            <span>Created {formatDate(course.createdAt)}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FiRefreshCw size={16} className="text-gray-600" />
                            <span>Updated {formatDate(course.updatedAt)}</span>
                          </li>
                        </ul>
                      </div>
                    )}
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
}
;

export default CourseDetailPage;
