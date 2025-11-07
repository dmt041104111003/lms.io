import React, { useState } from 'react';
import Link from 'next/link';
import TabNavigation, { TabType } from './TabNavigation';
import RankingsList from './RankingsList';
import CourseSlider from './CourseSlider';
import FanCards from './FanCards';
import CourseListItem from './CourseListItem';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';

interface CourseListProps {
  courses: Course[];
  totalResults?: number;
  searchQuery?: string;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  totalResults,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8; // 2 hàng x 4 cards

  const sortedCourses = [...courses].sort((a, b) => {
    const da = (a as any).createdAt || '';
    const db = (b as any).createdAt || '';
    return db.localeCompare(da);
  });

  const filteredCourses = sortedCourses.filter((course) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'free') {
      return !course.price || course.price.toLowerCase() === 'free';
    }
    if (activeTab === 'pro') {
      return course.price && course.price.toLowerCase() !== 'free';
    }
    return true;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, courses.length]);

  const totalPages = Math.ceil(Math.max(0, filteredCourses.length - 4) / coursesPerPage);
  const startIndex = 4 + (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const rankingsCourses = activeTab === 'all'
    ? sortedCourses.slice(0, 9) 
    : [];
  
  const freeCourses = activeTab === 'all'
    ? sortedCourses.filter(course => !course.price || course.price.toLowerCase() === 'free')
    : [];
  
  const proCourses = activeTab === 'all'
    ? sortedCourses.filter(course => course.price && course.price.toLowerCase() !== 'free')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Tabs Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab All - Rankings + Slider */}
      {activeTab === 'all' && (
        <div className="space-y-8">
          {/* Row 1: Rankings by Reviews */}
          <RankingsList courses={rankingsCourses} />

          {/* Row 2: Free Courses Slider */}
          <CourseSlider title="Khóa học miễn phí" courses={freeCourses} />

          {/* Row 3: Pro Courses Slider */}
          <CourseSlider title="Khóa học Pro" courses={proCourses} />
        </div>
      )}

      {/* Tab Free and Pro - Fan Cards + List */}
      {(activeTab === 'free' || activeTab === 'pro') && (
        <div className="space-y-8">
          <FanCards courses={filteredCourses} />

          {filteredCourses.length > 4 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">More Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <img 
                            src="/images/common/loading.png" 
                            alt="Loading" 
                            className="w-16 h-16 object-contain opacity-50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] text-sm">
                        {course.title}
                      </h4>
                      {course.instructor && (
                        <p className="text-xs text-gray-600 mb-1">{course.instructor}</p>
                      )}
                      
                      {/* Created At */}
                      {(course as any).createdAt && (
                        <p className="text-xs text-gray-500 mb-2">
                          {formatTimeAgo((course as any).createdAt)}
                        </p>
                      )}
                      
                      {/* Price */}
                      {course.price && (
                        <div className="text-sm font-semibold text-gray-900">{course.price}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 mt-6">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length - 4} courses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">No courses found</p>
          <p className="text-sm text-gray-500">
            Try different keywords or browse all courses
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
