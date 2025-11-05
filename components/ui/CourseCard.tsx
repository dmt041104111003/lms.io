import React from 'react';
import Link from 'next/link';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  image?: string;
  category?: string;
  price?: string;
  onSale?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  instructor,
  rating,
  reviews,
  image,
  category,
  price,
  onSale = false,
}) => {
  return (
    <Link href={`/courses/${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-72 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              📚
            </div>
          )}
          {onSale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sale
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {category && (
            <div className="text-xs text-gray-500 mb-1">{category}</div>
          )}
          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{instructor}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">{rating}</span>
            <span className="text-xs text-gray-500">({reviews.toLocaleString()})</span>
          </div>

          {/* Price */}
          {price && (
            <div className="text-base font-semibold text-gray-900">{price}</div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;

