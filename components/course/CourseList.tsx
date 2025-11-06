import React, { useState } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import RankingsList from './RankingsList';
import CourseSlider from './CourseSlider';
import FanCards from './FanCards';
import CourseListItem from './CourseListItem';
import { Course } from './types';

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

  const filteredCourses = courses.filter((course) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'free') {
      return !course.price || course.price.toLowerCase() === 'free';
    }
    if (activeTab === 'pro') {
      return course.price && course.price.toLowerCase() !== 'free';
    }
    return true;
  });

  // Split courses for "All" tab
  const rankingsCourses = activeTab === 'all'
    ? [...courses]
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        .slice(0, 9) // Top 9 by reviews
    : [];
  
  const freeCourses = activeTab === 'all'
    ? courses.filter(course => !course.price || course.price.toLowerCase() === 'free')
    : [];
  
  const proCourses = activeTab === 'all'
    ? courses.filter(course => course.price && course.price.toLowerCase() !== 'free')
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
        <div>
          {/* Top Grid: Fan Cards */}
          <FanCards courses={filteredCourses} />

          {/* Bottom List: Remaining courses */}
          {filteredCourses.length > 8 && (
            <div className="max-w-3xl mx-auto space-y-0">
              {filteredCourses.slice(8).map((course) => (
                <CourseListItem key={course.id} course={course} />
              ))}
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
