import React from 'react';
import Link from 'next/link';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';
import { FiUsers } from 'react-icons/fi';
import { Crown, Star } from 'lucide-react';
import CourseCard from './CourseCard';

interface CourseListProps {
  courses: Course[];
  totalResults?: number;
  searchQuery?: string;
}

const CourseList: React.FC<CourseListProps> = ({ courses, totalResults, searchQuery }) => {
  const sortedCourses = [...courses].sort((a, b) => {
    const da = (a as any).createdAt || '';
    const db = (b as any).createdAt || '';
    return db.localeCompare(da);
  });
  const freeCourses = sortedCourses.filter((course) => !course.price || course.price.toLowerCase() === 'free');
  const proCourses = sortedCourses.filter((course) => course.price && course.price.toLowerCase() !== 'free');
  const formatMoney = (amount: number, currency?: string) => {
    try {
      const cur = currency?.toUpperCase();
      if (cur === 'VND') {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
      }
      if (cur && cur !== 'USD') {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur as any }).format(amount);
      }
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    } catch {
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    }
  };
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {freeCourses.length === 0 && proCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">No courses found</p>
          <p className="text-sm text-gray-500">Try different keywords or browse all courses</p>
        </div>
      ) : (
        <div className="space-y-10">
          {proCourses.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Khóa học Pro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {proCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    image={course.image}
                    originalPrice={Number((course as any).originalPrice || 0)}
                    discountPercent={Number((course as any).discountPercent || 0)}
                    currency={course.currency}
                    courseType={course.courseType as any}
                    rating={(course as any).rating}
                    instructor={course.instructor}
                    educatorAvatar={course.educatorAvatar}
                    enrollmentCount={course.enrollmentCount as any}
                  />
                ))}
              </div>
              {typeof totalResults === 'number' && (freeCourses.length + proCourses.length) < totalResults && (
                <div className="mt-3 text-right">
                  <Link
                    href={`/courses${searchQuery ? `?keyword=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Xem thêm
                  </Link>
                </div>
              )}
            </section>
          )}
          {freeCourses.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Khóa học miễn phí</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {freeCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    image={course.image}
                    originalPrice={Number((course as any).originalPrice || 0)}
                    discountPercent={Number((course as any).discountPercent || 0)}
                    currency={course.currency}
                    courseType={course.courseType as any}
                    rating={(course as any).rating}
                    instructor={course.instructor}
                    educatorAvatar={course.educatorAvatar}
                    enrollmentCount={course.enrollmentCount as any}
                  />
                ))}
              </div>
              {typeof totalResults === 'number' && (freeCourses.length + proCourses.length) < totalResults && (
                <div className="mt-3 text-right">
                  <Link
                    href={`/courses${searchQuery ? `?keyword=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Xem thêm
                  </Link>
                </div>
              )}
            </section>
          )}

          
        </div>
      )}
    </div>
  );
};

export default CourseList;
