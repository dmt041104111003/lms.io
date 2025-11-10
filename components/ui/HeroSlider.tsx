import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  gradientDirection?: 'left' | 'right' | 'top' | 'bottom';
  link?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number, dir: number) => {
    if (index === currentIndex) return;
    setDirection(dir);
    setCurrentIndex(index);
    // Restart auto play after manual navigation
    if (isPlaying && slides.length > 1 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % slides.length;
          setDirection(1);
          return next;
        });
      }, autoPlayInterval);
    }
  };

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % slides.length;
          setDirection(1);
          return next;
        });
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, slides.length, autoPlayInterval]);

  useEffect(() => {
    if (slides.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length]);

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % slides.length, 1);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length, -1);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Animation variants for smooth transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  const transition = {
    x: { type: 'spring' as const, stiffness: 300, damping: 30 },
    opacity: { duration: 0.4 },
    scale: { duration: 0.4 },
  };

  const safeIndex = slides.length > 0 ? Math.min(currentIndex, slides.length - 1) : 0;

  // Placeholder when no slides available
  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full mb-6 sm:mb-8 md:mb-12 overflow-hidden">
        <div className="relative min-h-[150px] sm:min-h-[200px] md:min-h-[250px] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="relative w-full mb-6 sm:mb-8 md:mb-12 overflow-hidden">
      {/* Slides Container */}
      <div className="relative min-h-[150px] sm:min-h-[200px] md:min-h-[250px] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-gray-200">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={safeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10"
            style={{
              backgroundImage: slides[safeIndex].backgroundImage 
                ? `url(${slides[safeIndex].backgroundImage})` 
                : undefined,
              backgroundColor: slides[safeIndex].backgroundImage ? undefined : 'white',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Gradient Overlay */}
            {slides[safeIndex].backgroundImage && (
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: slides[safeIndex].gradientDirection === 'right' 
                    ? 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                    : slides[safeIndex].gradientDirection === 'top'
                    ? 'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                    : slides[safeIndex].gradientDirection === 'bottom'
                    ? 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                    : 'linear-gradient(to left, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)',
                }}
              />
            )}
            
            <motion.div 
              className="relative z-10 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl text-left pl-2 sm:pl-4 md:pl-6 lg:pl-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
                {slides[safeIndex].title}
              </h1>

              {/* Subtitle/Description */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 text-justify pr-2 sm:pr-4 md:pr-6 lg:pr-8 leading-relaxed">
                {slides[safeIndex].subtitle}
              </p>
              {slides[safeIndex].link && (
                <a
                  href={slides[safeIndex].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm transition"
                >
                  Explore
                  <FiChevronRight className="ml-1" size={14} />
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 right-2 sm:right-4 md:right-6 z-20 flex items-center gap-1 sm:gap-2 bg-white border border-gray-300 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm">
          <button
            onClick={prevSlide}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
          </button>
          <span className="text-xs sm:text-sm font-normal text-gray-700 min-w-[2rem] sm:min-w-[2.5rem] text-center">
            {currentIndex + 1}/{slides.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
          </button>
          <div className="w-px h-4 sm:h-5 bg-gray-300 mx-0.5 sm:mx-1" />
          <button
            onClick={togglePlay}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <FiPause size={14} className="sm:w-4 sm:h-4 text-gray-600" />
            ) : (
              <FiPlay size={14} className="sm:w-4 sm:h-4 text-gray-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroSlider;