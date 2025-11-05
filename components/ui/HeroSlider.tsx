import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  gradientDirection?: 'left' | 'right' | 'top' | 'bottom';
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full mb-6 sm:mb-8 md:mb-12">
      {/* Content */}
      <div 
        className="relative rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200 overflow-hidden min-h-[150px] sm:min-h-[200px] md:min-h-[250px]"
        style={{
          backgroundImage: currentSlide.backgroundImage 
            ? `url(${currentSlide.backgroundImage})` 
            : undefined,
          backgroundColor: currentSlide.backgroundImage ? undefined : 'white',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient Overlay - White fading from center/left */}
        {currentSlide.backgroundImage && (
          <div 
            className="absolute inset-0"
            style={{
              background: currentSlide.gradientDirection === 'right' 
                ? 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                : currentSlide.gradientDirection === 'top'
                ? 'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                : currentSlide.gradientDirection === 'bottom'
                ? 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
                : 'linear-gradient(to left, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)',
            }}
          />
        )}
        
        <div className="relative z-10 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl text-left pl-2 sm:pl-4 md:pl-6 lg:pl-8">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
            {currentSlide.title}
          </h1>

          {/* Subtitle/Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 text-justify pr-2 sm:pr-4 md:pr-6 lg:pr-8 leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Navigation Controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 right-2 sm:right-4 md:right-6 flex items-center gap-1 sm:gap-2 bg-white border border-gray-300 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm">
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
    </div>
  );
};

export default HeroSlider;

