import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import instructorService from '@/services/instructorService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

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

interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  requirement?: string;
  imageUrl?: string;
  videoUrl?: string;
  price?: number;
  courseType?: string;
  chapters?: ChapterSummary[];
  courseTests?: TestSummary[];
}

const InstructorCourseDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toasts, removeToast, error: showError } = useToast();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [instructorProfileId, setInstructorProfileId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        if (profile?.id) {
          setInstructorProfileId(profile.id);
        }
      } catch (error) {
        console.error('Failed to fetch instructor profile:', error);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id || typeof id !== 'string') {
        console.error('Invalid course ID:', id);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching course detail for ID:', id, 'instructorProfileId:', instructorProfileId);
        
        const detailUrl = `/api/course/${id}${instructorProfileId ? `?instructorId=${instructorProfileId}` : ''}`;
        const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com'}${detailUrl}`;
        console.log('Fetching from URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log('Course detail API response:', apiResponse);
        
        if (apiResponse.code === 1000 && apiResponse.result) {
          const result = apiResponse.result;
          console.log('Course result:', result);
          setCourse({
            id: result.id,
            title: result.title || '',
            description: result.description,
            imageUrl: result.imageUrl,
            videoUrl: result.videoUrl,
            price: result.price,
            courseType: result.courseType,
            chapters: result.chapters || [],
            courseTests: result.courseTests || [],
          });
        } else {
          console.warn('API response not successful, trying fallback');
          // Fallback to basic course info
          const courseData = await instructorService.getCourseById(id, instructorProfileId || undefined);
          setCourse({
            id: courseData.id,
            title: courseData.title || '',
            description: courseData.description,
            imageUrl: courseData.imageUrl,
            videoUrl: (courseData as any).videoUrl,
            price: courseData.price,
            courseType: courseData.courseType,
            chapters: [],
            courseTests: [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        showError(`Failed to load course details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id, instructorProfileId, showError]);

  if (loading) {
    return (
      <InstructorGuard>
        <InstructorLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-600">Loading course details...</div>
          </div>
        </InstructorLayout>
      </InstructorGuard>
    );
  }

  if (!course) {
    return (
      <InstructorGuard>
        <InstructorLayout>
          <Card className="p-12 text-center">
            <div className="text-gray-600 mb-4">Course not found</div>
            <Button onClick={() => router.push('/instructor/courses')} variant="primary" size="sm">
              Back to Courses
            </Button>
          </Card>
        </InstructorLayout>
      </InstructorGuard>
    );
  }

  return (
    <InstructorGuard>
      <SEO
        title={`${course.title} - Instructor - lms.cardano2vn.io`}
        description={course.description || 'Course details'}
        url={`/instructor/courses/${course.id}`}
        noindex={true}
        nofollow={true}
      />
      <InstructorLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.push('/instructor/courses')}
                variant="outline"
                size="sm"
              >
                ← Back to Courses
              </Button>
            </div>
            <Button
              onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
              variant="primary"
              size="sm"
            >
              Edit Course
            </Button>
          </div>

          {/* Course Info */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {course.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full md:w-64 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{course.title}</h1>
                {course.description && (
                  <p className="text-gray-600 mb-4">{course.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Type: <strong>{course.courseType || 'N/A'}</strong></span>
                  {course.price !== undefined && (
                    <span>Price: <strong>${course.price}</strong></span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Chapters */}
          {course.chapters && course.chapters.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Chapters</h2>
              <div className="space-y-4">
                {course.chapters
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((chapter) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          Chapter {chapter.orderIndex + 1}: {chapter.title}
                        </h3>
                      </div>

                      {/* Lectures */}
                      {chapter.lectures && chapter.lectures.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Lectures:</h4>
                          <div className="space-y-2 ml-4">
                            {chapter.lectures
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((lecture) => (
                                <div key={lecture.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lecture.orderIndex + 1}. {lecture.title}
                                    </div>
                                    {lecture.description && (
                                      <div className="text-xs text-gray-600 mt-1">{lecture.description}</div>
                                    )}
                                    {lecture.duration && (
                                      <div className="text-xs text-gray-500 mt-1">Duration: {lecture.duration} min</div>
                                    )}
                                  </div>
                                  {lecture.previewFree && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free Preview</span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Tests */}
                      {chapter.tests && chapter.tests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tests:</h4>
                          <div className="space-y-2 ml-4">
                            {chapter.tests
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((test) => (
                                <div key={test.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {test.orderIndex + 1}. {test.title}
                                    </div>
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
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Course Tests (tests not in chapters) */}
          {course.courseTests && course.courseTests.length > 0 && (
            <Card className="p-6">
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

          {(!course.chapters || course.chapters.length === 0) && (!course.courseTests || course.courseTests.length === 0) && (
            <Card className="p-12 text-center">
              <div className="text-gray-600 mb-4">No chapters or tests found for this course</div>
              <Button
                onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                variant="primary"
                size="sm"
              >
                Add Content
              </Button>
            </Card>
          )}
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorCourseDetail;

