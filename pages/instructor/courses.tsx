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
import { BookOpen, Plus, Search, Filter } from 'lucide-react';

const InstructorCourses: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="text-blue-600" size={28} />
                  <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
                </div>
                <p className="text-gray-600">Create and manage your courses</p>
              </div>
              <Button
                onClick={() => router.push('/instructor/courses/create')}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create New Course
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 bg-white shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </Button>
            </div>
          </Card>

          {/* Courses Table */}
          {loading ? (
            <Card className="p-12 text-center bg-white shadow-sm border border-gray-100">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-600 font-medium">Loading courses...</div>
              </div>
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
                <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {page * size + 1} to {Math.min((page + 1) * size, courses.totalElements)} of {courses.totalElements} courses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= courses.totalPages - 1}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center bg-white shadow-sm border border-gray-100">
              <div className="flex flex-col items-center gap-4">
                <BookOpen className="text-gray-300 mb-2" size={48} />
                <div className="text-gray-600 font-medium text-lg">No courses found</div>
                <p className="text-gray-400 text-sm">Create your first course to get started</p>
                <Button
                  onClick={() => router.push('/instructor/courses/create')}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Your First Course
                </Button>
              </div>
            </Card>
          )}
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorCourses;

