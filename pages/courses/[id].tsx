import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import instructorService, { CourseResponse, InstructorProfileResponse } from '@/services/instructorService';
import CourseCard from '@/components/course/CourseCard';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import ToastContainer from '@/components/ui/ToastContainer';
import CoursePayment from '@/components/payment/CoursePayment';
import { FiTag, FiClock, FiBookOpen, FiCheckSquare, FiCalendar, FiRefreshCw, FiChevronDown, FiPlayCircle, FiFileText, FiMessageSquare } from 'react-icons/fi';
import feedbackService, { FeedbackItem } from '@/services/feedbackService';
import ChatDialog from '@/components/chat/ChatDialog';

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
  const [instructorCourses, setInstructorCourses] = useState<CourseResponse[]>([]);
  const [morePage, setMorePage] = useState(0);
  const [moreTotalPages, setMoreTotalPages] = useState(1);
  const [visibleMoreCount, setVisibleMoreCount] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({});
  
  const [error, setError] = useState<string | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbPageIndex, setFbPageIndex] = useState(0);
  const fbPageSize = 6;
  const [fbContent, setFbContent] = useState<FeedbackItem[]>([]);
  const [fbTotalPages, setFbTotalPages] = useState(0);
  const [fbTotalElements, setFbTotalElements] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPeer, setChatPeer] = useState<{ id: string; name?: string } | null>(null);

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
          console.log('[CourseDetail] API /api/course/:id result', result);
          setRawCourse(result);
          
          // Set enrollment status if available in API response
          if (result.enrolled !== undefined) {
            setIsEnrolled(result.enrolled);
          }
          
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
          
        } else {
          // Fallback to basic course info
          const data = await instructorService.getCourseById(id);
          console.log('[CourseDetail] Fallback getCourseById result', data);
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
          console.log('[CourseDetail] Instructor profile by id', data);
          setInstructor(data);
          return;
        }
        if (course.instructorUserId) {
          const data = await instructorService.getInstructorProfileByUserId(course.instructorUserId);
          console.log('[CourseDetail] Instructor profile by userId', data);
          setInstructor(data);
        }
      } catch {}
    };
    load();
  }, [course]);

  useEffect(() => {
    const fetchMoreCourses = async () => {
      try {
        if (!instructor?.id) {
          setInstructorCourses([]);
          return;
        }
        const res = await instructorService.getCoursesByProfile(instructor.id, 0, 6);
        console.log('[CourseDetail] Instructor courses (page 0)', res);
        setInstructorCourses(res.content || []);
        setMorePage(res.number ?? 0);
        setMoreTotalPages(res.totalPages ?? 1);
        setVisibleMoreCount(2);
      } catch {
        setInstructorCourses([]);
      }
    };
    fetchMoreCourses();
  }, [instructor?.id]);

  useEffect(() => {
    const loadFeedback = async () => {
      if (!course?.id) return;
      try {
        setFbLoading(true);
        const res = await feedbackService.getByCoursePaged(String(course.id), fbPageIndex, fbPageSize);
        setFbContent(prev => fbPageIndex === 0 ? (res.content || []) : [...prev, ...(res.content || [])]);
        setFbTotalPages(res.totalPages || 0);
        setFbTotalElements(res.totalElements || 0);
      } finally {
        setFbLoading(false);
      }
    };
    loadFeedback();
  }, [course?.id, fbPageIndex]);

  const loadMoreCourses = async () => {
    if (!instructor?.id) return;
    if (loadingMore) return;
    const hasMorePages = morePage < moreTotalPages - 1;
    if (!hasMorePages) return;
    try {
      setLoadingMore(true);
      const nextPage = morePage + 1;
      const res = await instructorService.getCoursesByProfile(instructor.id, nextPage, 6);
      setInstructorCourses(prev => [...prev, ...(res.content || [])]);
      setMorePage(res.number ?? nextPage);
      setMoreTotalPages(res.totalPages ?? moreTotalPages);
      setVisibleMoreCount(prev => prev + 4);
    } finally {
      setLoadingMore(false);
    }
  };

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
      lecs.forEach((l: any) => { lectureSeconds += (l.duration ?? l.time ?? 0); });
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

  const formatClock = (secs?: number) => {
    if (!secs || secs <= 0) return '00:00';
    const s = Math.floor(secs % 60);
    const totalMins = Math.floor(secs / 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const formatDateTime = (d?: Date) => {
    if (!d) return '-';
    const dt = new Date(d as any);
    if (isNaN(dt.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const formatTimeAgo = (iso?: string) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    const diff = Math.max(0, Date.now() - t);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
    if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
    return `${Math.floor(diff / day)} days ago`;
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
                  <div className="prose max-w-none mb-6">
                    <h2 className='text-xl  mt-12 font-semibold text-justify text-gray-900 mb-4'>What you'll learn</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                  </div>
                )}
                {course.requirement && (
                  <div className="prose max-w-none ">
                    <h2 className='text-xl mt-8 font-semibold text-gray-900 mb-4'>Requirements</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.requirement}</p>
                  </div>
                )}
                {course.chapters && course.chapters.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl mt-8 font-semibold text-gray-900">Course content</h2>
                      <div className="mt-8">
                        <button
                          className="text-sm text-blue-600 hover:underline mr-3"
                          onClick={() => {
                            const all: Record<number, boolean> = {};
                            (course.chapters || []).forEach((c: any) => { all[c.id] = true; });
                            setOpenChapters(all);
                          }}
                        >
                          Expand all
                        </button>
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => setOpenChapters({})}
                        >
                          Collapse all
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {stats && (
                        <div className="text-sm text-gray-600 mb-1 flex flex-wrap items-center gap-4">
                          <span className="inline-flex items-center gap-1">
                            <FiBookOpen /> {stats.lectureCount} lectures • {Math.floor(stats.lectureSeconds / 60)} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FiCheckSquare /> {stats.testCount} tests • {Math.floor(stats.testSeconds / 60)} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FiClock /> Total {formatDuration(stats.totalSeconds)}
                          </span>
                        </div>
                      )}
                      {course.chapters
                        .slice()
                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                        .map((ch, chIndex) => {
                          const lectureCount = (ch.lectures || []).length;
                          const totalSecs = (ch.lectures || []).reduce((s, l: any) => s + Number((l.duration ?? l.time ?? 0)), 0);
                          const isOpen = openChapters[ch.id as number] ?? (chIndex === 0);
                          return (
                            <div key={ch.id} className="border border-gray-200 rounded-md overflow-hidden">
                              <button
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-900 font-medium"
                                onClick={() => setOpenChapters(prev => ({ ...prev, [ch.id]: !(prev[ch.id as number] ?? (chIndex === 0)) }))}
                              >
                                <span className="truncate text-left">{ch.title}</span>
                                <span className="flex items-center gap-3 text-sm font-normal text-gray-700">
                                  <span>{lectureCount} lectures • {formatDuration(totalSecs)}</span>
                                  <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </span>
                              </button>
                              {isOpen && (
                                <div className="px-4 py-3 space-y-3">
                                  {(ch.lectures && ch.lectures.length > 0) && (
                                    <div className="space-y-1">
                                      {ch.lectures
                                        .slice()
                                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                        .map((lec, idx) => (
                                          <div key={lec.id || idx} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-2 min-w-0">
                                              {lec.videoUrl ? (
                                                <FiPlayCircle className="text-gray-600 flex-shrink-0" size={16} />
                                              ) : (
                                                <FiFileText className="text-gray-600 flex-shrink-0" size={16} />
                                              )}
                                              <span className="text-sm text-gray-900 truncate">{idx + 1}. {lec.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-shrink-0">
                                              {lec.previewFree && lec.videoUrl && (
                                                <a
                                                  href={lec.videoUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                                                >
                                                  <FiPlayCircle size={14} />
                                                  Preview
                                                </a>
                                              )}
                                              {Number((lec as any).duration ?? (lec as any).time ?? 0) > 0 && (
                                                <span className="text-xs text-gray-600">{formatClock(Number((lec as any).duration ?? (lec as any).time ?? 0))}</span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                  {(ch.tests && ch.tests.length > 0) && (
                                    <div>
                                      <div className="space-y-2">
                                        {ch.tests
                                          .slice()
                                          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                          .map((test) => (
                                            <div key={test.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                              <div className="flex items-center gap-3 flex-1">
                                                <FiCheckSquare className="text-gray-700" size={16} />
                                                <div className="flex-1">
                                                  <div className="text-sm font-medium text-gray-900">{test.title}</div>
                                                  {test.passScore && (
                                                    <div className="text-xs text-gray-600 mt-1">Pass Score: {test.passScore}%</div>
                                                  )}
                                                </div>
                                              </div>
                                              {typeof test.durationMinutes === 'number' && test.durationMinutes > 0 && (
                                                <span className="text-xs text-gray-600">{test.durationMinutes} min</span>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
                {course.courseTests && (
                  <div className="mb-6">
                    <h2 className="text-xl mt-8  font-semibold text-gray-900 mb-4">Course Tests</h2>
                    {course.courseTests.length > 0 && (
                      <Card className="p-6">
                        <div className="space-y-2">
                          {course.courseTests
                            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                            .map((test) => (
                              <div key={test.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                  <FiCheckSquare className="text-gray-700" size={16} />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{test.title}</div>
                                    {test.passScore && (
                                      <div className="text-xs text-gray-600 mt-1">Pass Score: {test.passScore}%</div>
                                    )}
                                  </div>
                                </div>
                                {typeof test.durationMinutes === 'number' && test.durationMinutes > 0 && (
                                  <span className="text-xs text-gray-600">{test.durationMinutes} min</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                  {(course as any).courseTags || (course as any).tags ? (
                  <div className=" mb-6">
                    <h2 className='text-xl mt-8 font-semibold text-justify text-gray-900 mb-4'>Explore related topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {((course as any).courseTags || (course as any).tags || []).map((tag: any) => (
                        <span
                          key={tag.id || tag.tagId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                          {tag.name || tag.tagName}
                        </span>
                      ))}
                    </div>
                  </div>
              ) : null}

              {/* Feedback Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl mt-8 font-semibold text-gray-900">Student feedback</h2>
                  {/* {fbTotalElements > 0 && (
                    <div className="text-sm text-gray-600">{fbTotalElements} ratings</div>
                  )} */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(fbLoading ? Array.from({ length: 4 }) : fbContent).map((f: any, idx: number) => (
                    <div key={f?.id ?? idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                      {f ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {f.avatar ? (
                                <img
                                  src={f.avatar}
                                  alt={f.fullName || 'User'}
                                  className="w-9 h-9 rounded-full object-cover border"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                                  {(f.fullName || '?').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{f.fullName || 'User'}</div>
                                <div className="text-xs text-gray-500">{formatTimeAgo(f.createdAt)}</div>
                              </div>
                            </div>
                            <div className="text-yellow-500 text-sm">{'★'.repeat(Math.max(0, Math.min(5, Number(f.rate) || 0)))}{'☆'.repeat(Math.max(0, 5 - (Number(f.rate) || 0)))}</div>
                          </div>
                          {f.content && (
                            <div className="text-sm text-gray-800 whitespace-pre-line">{f.content}</div>
                          )}
                        </div>
                      ) : (
                        <div className="animate-pulse h-20 bg-gray-100 rounded" />
                      )}
                    </div>
                  ))}
                </div>
                {fbPageIndex < fbTotalPages - 1 && (
                  <div className="flex items-center justify-center mt-4">
                    <button
                      className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setFbPageIndex(p => p + 1)}
                      disabled={fbLoading}
                    >
                      {fbLoading ? 'Loading...' : 'Show more'}
                    </button>
                  </div>
                )}
              </div>

              {instructor && (
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-xl mt-8 font-semibold text-gray-900">Instructor</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      {instructor.avatar ? (
                        <img src={instructor.avatar} alt={instructor.name || 'Instructor'} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200" />
                      )}
                      <div className="flex-1">
                        <div className="text-lg font-medium text-gray-900 mx-auto">{instructor.name || 'Instructor'}</div>
                        {instructor.expertise && <div className="text-sm text-gray-600 mt-1 mb-2">{instructor.expertise}</div>}
                        {instructor.socialLinks && instructor.socialLinks.length > 0 && (
                          <div className="flex gap-3">
                            {instructor.socialLinks.map((link) => (
                              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                                {link.name || link.platform || 'Link'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {instructor.bio && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{instructor.bio}</p>
                    )}
                    
                  </div>
                </div>
              )}

              {instructor && instructor.id && instructorCourses && instructorCourses.some((c) => String(c.id) !== String(course.id)) && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl mt-4 font-semibold text-gray-900">More courses by {instructor.name || 'this instructor'}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-4">
                    {instructorCourses
                      .filter((c) => String(c.id) !== String(course.id))
                      .sort((a, b) => {
                        const ca = (a as any).totalStudents ?? (a as any).totalEnrollments ?? (a as any).enrollmentCount ?? (a as any).enrollmentsCount ?? 0;
                        const cb = (b as any).totalStudents ?? (b as any).totalEnrollments ?? (b as any).enrollmentCount ?? (b as any).enrollmentsCount ?? 0;
                        return cb - ca;
                      })
                      .slice(0, visibleMoreCount)
                      .map((c) => (
                        <CourseCard
                          key={c.id as any}
                          id={String(c.id)}
                          title={c.title}
                          image={c.imageUrl}
                          originalPrice={typeof c.price === 'number' ? c.price : 0}
                          discountPercent={Number((c as any).discount || 0)}
                          currency={(c as any).currency}
                          courseType={c.courseType}
                          rating={(c as any).rating}
                          instructor={(c as any).instructorName || (instructor?.name || '')}
                          educatorAvatar={(c as any).instructorAvatar || (c as any).educatorAvatar || instructor?.avatar}
                          enrollmentCount={(c as any).enrollmentCount ?? (c as any).numOfStudents}
                        />
                    ))}
                  </div>
                  {(
                    instructorCourses.filter((c) => String(c.id) !== String(course.id)).length > visibleMoreCount ||
                    morePage < moreTotalPages - 1 ||
                    visibleMoreCount > 2
                  ) && (
                    <div className="mb-6 space-y-3">
                      {(instructorCourses.filter((c) => String(c.id) !== String(course.id)).length > visibleMoreCount ||
                        morePage < moreTotalPages - 1) && (
                        <button
                          className="inline-flex w-full text-blue-600 justify-center text-center items-center px-4 py-2 text-sm font-medium rounded-md border border-blue-300  hover:bg-blue-50 disabled:opacity-50"
                          onClick={async () => {
                            const filteredCount = instructorCourses.filter((c) => String(c.id) !== String(course.id)).length;
                            if (filteredCount > visibleMoreCount) {
                              setVisibleMoreCount(prev => prev + 4);
                            } else if (morePage < moreTotalPages - 1) {
                              await loadMoreCourses();
                            }
                          }}
                          disabled={loadingMore}
                        >
                          {loadingMore ? 'Loading...' : 'Show more'}
                        </button>
                      )}
                      {visibleMoreCount > 2 && (
                        <button
                          className="inline-flex w-full  justify-center text-center items-center px-4 py-2 text-sm font-medium rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => setVisibleMoreCount(2)}
                          disabled={loadingMore}
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  )}
                </>
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
                        {isEnrolled ? (
                          <button
                            className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => router.push('/my-courses')}
                          >
                            Go to My Course
                          </button>
                        ) : priceLabel === 'Free' ? (
                          <button
                            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={enrolling}
                            onClick={async () => {
                              if (!user?.id) {
                                router.push('/login');
                                return;
                              }
                              try {
                                setEnrolling(true);
                                await instructorService.enrollCourse({ userId: user.id, courseId: String(course.id) });
                                setIsEnrolled(true);
                                success('Enrolled successfully!');
                                setTimeout(() => router.push('/my-courses'), 1200);
                              } catch (e: any) {
                                showError(e?.message || 'Failed to enroll');
                              } finally {
                                setEnrolling(false);
                              }
                            }}
                          >
                            Enroll for Free
                          </button>
                        ) : (
                          <CoursePayment
                            courseId={String(course.id)}
                            courseTitle={course.title}
                            price={finalPrice}
                            currency={course.currency}
                            receiverAddress={(rawCourse as any)?.coursePaymentMethods?.[0]?.receiverAddress}
                            coursePaymentMethodId={(rawCourse as any)?.coursePaymentMethods?.[0]?.id}
                            onPaymentSuccess={() => {
                              setIsEnrolled(true);
                              setTimeout(() => router.push('/my-courses'), 1200);
                            }}
                          />
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
                        {(course.instructorUserId || (instructor as any)?.userId) && (
                          <button
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              if (!user?.id) {
                                router.push('/login');
                                return;
                              }
                              const peerId = String(course.instructorUserId || (instructor as any)?.userId || '');
                              const peerName = instructor?.name || 'Instructor';
                              if (!peerId) return;
                              setChatPeer({ id: peerId, name: peerName });
                              setChatOpen(true);
                            }}
                          >
                            <FiMessageSquare />
                            Chat with instructor
                          </button>
                        )}
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
      <ChatDialog open={chatOpen} onClose={() => setChatOpen(false)} initialPeer={chatPeer} />
    </>
  );
}
;

export default CourseDetailPage;
