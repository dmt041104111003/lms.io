import React from 'react';
import Link from 'next/link';
import { Course } from './types';

interface CourseListItemProps {
  course: Course;
}

const CourseListItem: React.FC<CourseListItemProps> = ({ course }) => {
  const courseUrl = `/courses/${course.id}`;
  const displayUrl = `lms.com${courseUrl}`;

  return (
    <div className="py-3 px-1 flex gap-4">
      {/* Image - Left side */}
      {course.image && (
        <div className="flex-shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-32 h-20 object-cover rounded border border-gray-200"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {/* URL Path - Green like Google */}
        <div className="flex items-center mb-1">
          <span className="text-xs text-green-700">{displayUrl}</span>
          {course.category && (
            <>
              <span className="mx-1 text-xs text-gray-500">›</span>
              <span className="text-xs text-gray-500">{course.category}</span>
            </>
          )}
        </div>

        {/* Title - Blue link like Google */}
        <Link href={courseUrl}>
          <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1 leading-snug">
            {course.title}
          </h3>
        </Link>

        {/* Metadata - Instructor, Rating, Reviews */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
          <span className="text-gray-700">{course.instructor}</span>
          {course.rating && course.reviews && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">
                {course.rating.toFixed(1)} rating
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">
                {course.reviews.toLocaleString()} reviews
              </span>
            </>
          )}
          {course.students && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">
                {course.students.toLocaleString()} students
              </span>
            </>
          )}
          {course.duration && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">{course.duration}</span>
            </>
          )}
          {course.price && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-700 font-medium">{course.price}</span>
            </>
          )}
        </div>

        {/* Description - Gray text like Google snippet */}
        {course.description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseListItem;

