import React from 'react';
import { FiSearch } from 'react-icons/fi';
import HeroSlider from '@/components/ui/HeroSlider';

const SearchSection: React.FC = () => {
  const slides = [
    {
      id: '1',
      title: 'Chào mừng tới với LMS - Cardano2vn.io',
      subtitle: 'Học tập và phát triển bản thân với các khóa học và giảng viên trực tuyến',
      backgroundImage: '/images/common/01.png',
      gradientDirection: 'left' as const,
    },
    {
      id: '2',
      title: 'Khám phá các khóa học hàng đầu',
      subtitle: 'Khám phá các khóa học hàng đầu từ các giảng viên chuyên nghiệp',
      backgroundImage: '/images/common/02.png',
      gradientDirection: 'left' as const,
    },
    {
      id: '3',
      title: 'Học từ các chuyên gia',
      subtitle: 'Tham gia hàng ngàn học viên học từ các chuyên gia công nghiệp',
      backgroundImage: '/images/common/03.png',
      gradientDirection: 'left' as const,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hero Slider */}
      <HeroSlider slides={slides} autoPlay={true} autoPlayInterval={5000} />

      {/* Search Bar */}
      <div className="w-full max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="relative flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
          <FiSearch className="absolute left-3 sm:left-4 text-gray-400 text-lg sm:text-xl" />
          <input
            type="text"
            placeholder="Search courses, instructors, or topics..."
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-full text-sm sm:text-base focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-10">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded text-sm transition-colors">
          Course Search
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded text-sm transition-colors">
          Browse All
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-blue-600 px-4">
        <a href="#" className="hover:underline">Popular Courses</a>
        <a href="#" className="hover:underline">New Releases</a>
        <a href="#" className="hover:underline">Top Instructors</a>
        <a href="#" className="hover:underline">Categories</a>
      </div>
    </div>
  );
};

export default SearchSection;

