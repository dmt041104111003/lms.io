import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import CourseTable from '@/components/instructor/CourseTable';
import instructorService, { CourseResponse, PageResponse } from '@/services/instructorService';
import { courseService } from '@/services/courseService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const InstructorCourses: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getMyCoursesAllPaginated(page, size);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, page, size]);

  return (
    <InstructorGuard>
      <SEO
        title="Courses Management - Cardano2VN LMS Instructor"
        description="Manage your courses, create new courses, edit existing ones, and track student enrollments."
      />
      <InstructorLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
              <p className="text-gray-600 mt-1">Create and manage your courses</p>
            </div>
            <Button
              onClick={() => router.push('/instructor/courses/create')}
              className="w-full sm:w-auto"
            >
              Create New Course
            </Button>
          </div>

          {/* Courses Table */}
          {loading ? (
            <Card className="p-8 text-center">
              <div className="text-gray-600">Loading courses...</div>
            </Card>
          ) : courses && courses.content && courses.content.length > 0 ? (
            <>
              <CourseTable 
                courses={courses.content} 
                onRefresh={fetchCourses}
                onCourseUpdate={(courseId, updates) => {
                  if (courses) {
                    const newContent = courses.content.map((c: any) => 
                      c.id === courseId ? { ...c, ...updates } : c
                    );
                    setCourses({
                      ...courses,
                      content: newContent
                    });
                  }
                }}
                onCourseDelete={(courseId) => {
                  if (courses) {
                    const newContent = courses.content.filter((c: any) => c.id !== courseId);
                    const newTotalElements = courses.totalElements - 1;
                    const newTotalPages = Math.ceil(newTotalElements / size);
                    
                    setCourses({
                      ...courses,
                      content: newContent,
                      totalElements: newTotalElements,
                      totalPages: newTotalPages
                    });

                    if (newContent.length === 0 && page > 0) {
                      setPage(page - 1);
                    }
                  }
                }}
              />
              
              {/* Pagination */}
              {courses.totalPages > 1 && (
                <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {page * size + 1} to {Math.min((page + 1) * size, courses.totalElements)} of {courses.totalElements} courses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= courses.totalPages - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-600">No courses found</div>
            </Card>
          )}
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorCourses;

