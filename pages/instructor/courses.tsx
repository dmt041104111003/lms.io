import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import CourseTable from '@/components/instructor/CourseTable';
import instructorService, { CourseResponse, PageResponse } from '@/services/instructorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';

const InstructorCourses: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<PageResponse<CourseResponse> | null>(null);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchCourses = async () => {
    try {
      const data = await instructorService.getMyCoursesAll(0, 1000);
      
      let filtered = data.content;
      if (debouncedKeyword) {
        filtered = filtered.filter(c => 
          c.title?.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
          c.description?.toLowerCase().includes(debouncedKeyword.toLowerCase())
        );
      }
      if (selectedType) {
        filtered = filtered.filter(c => c.courseType === selectedType);
      }
      
      const sorted = filtered.sort((a, b) => {
        const da = a.createdAt || '';
        const db = b.createdAt || '';
        return db.localeCompare(da);
      });
      
      const totalElements = sorted.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedContent = sorted.slice(startIndex, endIndex);
      
      setCourses({
        content: paginatedContent,
        totalElements,
        totalPages,
        size,
        number: page,
      });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, debouncedKeyword, selectedType, page, size]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, selectedType]);

  return (
    <InstructorGuard>
      <SEO
        title="Courses Management - Cardano2VN LMS Instructor"
        description="Manage your courses, create new courses, edit existing ones, and track student enrollments."
        keywords="instructor, courses, course management, create course, Cardano LMS instructor"
        url="/instructor/courses"
        noindex={true}
        nofollow={true}
      />
      <InstructorLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Courses Management</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and monitor all courses</p>
            </div>
            <Button
              onClick={() => router.push('/instructor/courses/create')}
              variant="primary"
              size="sm"
            >
              Create New Course
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by title, description..."
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                  }}
                  aria-label="Filter by type"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Courses Table */}
          {courses && courses.content.length > 0 ? (
            <>
              <CourseTable 
                courses={courses.content} 
                onRefresh={fetchCourses}
                onCourseUpdate={(courseId, updates) => {
                  if (courses) {
                    const newContent = courses.content.map(c => 
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
                    const newContent = courses.content.filter(c => c.id !== courseId);
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

