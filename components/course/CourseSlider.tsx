import React, { useRef, useEffect, useState } from 'react';
import PlayStoreCard from './PlayStoreCard';
import { Course } from './types';

interface CourseSliderProps {
  title: string;
  courses: Course[];
}

const CourseSlider: React.FC<CourseSliderProps> = ({ title, courses }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const duplicatedCourses = courses.length > 0 ? [...courses, ...courses, ...courses] : [];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || courses.length === 0) return;

    const initScroll = () => {
      const firstItem = slider.querySelector('.slider-item') as HTMLElement;
      if (!firstItem) {
        setTimeout(initScroll, 50);
        return;
      }
      const cardWidth = firstItem.offsetWidth;
      const gap = 20; 
      const itemWidth = cardWidth + gap;
      const scrollPosition = itemWidth * courses.length;
      slider.scrollLeft = scrollPosition;
    };
    
    setTimeout(initScroll, 100);

    const handleScroll = () => {
      if (isScrolling) return;
      
      const firstItem = slider.querySelector('.slider-item') as HTMLElement;
      if (!firstItem) return;
      
      const cardWidth = firstItem.offsetWidth;
      const gap = 20;
      const itemWidth = cardWidth + gap;
      const sectionWidth = itemWidth * courses.length;
      const { scrollLeft } = slider;

      if (scrollLeft >= sectionWidth * 2 - 50) {
        setIsScrolling(true);
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = sectionWidth;
        setTimeout(() => {
          slider.style.scrollBehavior = 'smooth';
          setIsScrolling(false);
        }, 50);
      }
      else if (scrollLeft <= sectionWidth - 50) {
        setIsScrolling(true);
        slider.style.scrollBehavior = 'auto';
        slider.scrollLeft = sectionWidth;
        setTimeout(() => {
          slider.style.scrollBehavior = 'smooth';
          setIsScrolling(false);
        }, 50);
      }
    };

    slider.addEventListener('scroll', handleScroll);
    
    // Auto scroll every 3 seconds (only when not paused)
    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isScrolling && !isPaused && slider) {
          const scrollAmount = 400;
          slider.scrollBy({
            left: scrollAmount,
            behavior: 'smooth',
          });
        }
      }, 3000);
    };
    
    startAutoScroll();
    
    return () => {
      slider.removeEventListener('scroll', handleScroll);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [courses.length, isScrolling, isPaused]);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current && !isScrolling) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="relative">
      <h2 className="text-2xl font-normal mb-5">{title}</h2>
      <button
        onClick={() => scrollSlider('left')}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
        aria-label="Previous"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <div
        ref={sliderRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide group"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsPaused(false), 2000);
        }}
      >
        {duplicatedCourses.map((course, index) => (
          <div key={`${course.id}-${index}`} className="slider-item flex-shrink-0">
            <PlayStoreCard course={course} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scrollSlider('right')}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
        aria-label="Next"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
      {/* Mobile buttons below */}
      <div className="flex justify-center items-center gap-3 mt-4 sm:hidden">
        <button
          onClick={() => scrollSlider('left')}
          className="w-10 h-10 bg-white rounded-full border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
          aria-label="Previous"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          onClick={() => scrollSlider('right')}
          className="w-10 h-10 bg-white rounded-full border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
          aria-label="Next"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CourseSlider;

