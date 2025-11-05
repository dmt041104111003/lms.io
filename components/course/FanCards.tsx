import React, { useRef, useState } from 'react';
import PlayStoreCard from './PlayStoreCard';
import { Course } from './types';

interface FanCardsProps {
  courses: Course[];
}

const FanCards: React.FC<FanCardsProps> = ({ courses }) => {
  const fanCardsRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const displayCourses = courses.slice(0, 4);

  if (displayCourses.length === 0) return null;

  const scrollBy = (amount: number) => {
    if (fanCardsRef.current) {
      fanCardsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(() => {
        if (fanCardsRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = fanCardsRef.current;
          const maxScroll = scrollWidth - clientWidth;
          if (maxScroll > 0) {
            const progress = (scrollLeft / maxScroll) * 100;
            setScrollProgress(Math.max(0, Math.min(100, progress)));
          }
        }
      }, 300);
    }
  };

  const updateProgress = () => {
    if (fanCardsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = fanCardsRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const progress = (scrollLeft / maxScroll) * 100;
        setScrollProgress(Math.max(0, Math.min(100, progress)));
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-400)}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
        aria-label="Previous"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <div
        ref={fanCardsRef}
        className="flex justify-center items-center gap-0 mb-4 group overflow-x-auto py-8 px-4 cursor-grab active:cursor-grabbing scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties & { [key: string]: any }}
        onScroll={updateProgress}
        onMouseDown={(e) => {
          e.preventDefault();
          if (!fanCardsRef.current) return;
          const startX = e.pageX;
          const startScrollLeft = fanCardsRef.current.scrollLeft;
          let isDragging = true;

          const handleMouseMove = (e: MouseEvent) => {
            if (!fanCardsRef.current || !isDragging) return;
            const diff = e.pageX - startX;
            fanCardsRef.current.scrollLeft = startScrollLeft - diff;
            updateProgress();
          };

          const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        onTouchStart={(e) => {
          if (fanCardsRef.current) {
            setTouchStart(e.targetTouches[0].clientX);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (fanCardsRef.current && touchStart !== 0) {
            const diff = touchStart - e.targetTouches[0].clientX;
            fanCardsRef.current.scrollLeft += diff;
            setTouchStart(e.targetTouches[0].clientX);
            updateProgress();
          }
        }}
        onTouchEnd={() => {
          setTouchStart(0);
        }}
      >
        {displayCourses.map((course, index) => {
          const total = displayCourses.length;
          const centerIndex = (total - 1) / 2;
          const offset = index - centerIndex;
          const rotation = offset * 5;
          const translateX = offset * 12;
          const zIndex = total - Math.abs(offset);
          const marginLeft = index === 0 ? 0 : -45;

          return (
            <div
              key={course.id}
              className="transition-all duration-300 hover:scale-110 hover:z-50"
              style={{
                transform: `rotate(${rotation}deg) translateX(${translateX}px)`,
                zIndex: zIndex,
                marginLeft: `${marginLeft}px`,
              }}
            >
              <div className="scale-75 md:scale-100">
                <PlayStoreCard course={course} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Scrollbar Indicator */}
      <div className="flex justify-center items-center gap-3 mt-2">
        <button
          onClick={() => scrollBy(-400)}
          className="flex sm:hidden w-10 h-10 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
          aria-label="Previous"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div className="w-48 sm:w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <button
          onClick={() => scrollBy(400)}
          className="flex sm:hidden w-10 h-10 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
          aria-label="Next"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
      <button
        onClick={() => scrollBy(400)}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 shadow-md items-center justify-center hover:bg-gray-50 transition-all"
        aria-label="Next"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );
};

export default FanCards;

