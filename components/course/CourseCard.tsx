import React from 'react';
import Link from 'next/link';
import { Crown, Star, Users } from 'lucide-react';

export interface CourseCardProps {
  id: string;
  title: string;
  image?: string;
  originalPrice?: number;
  discountPercent?: number;
  currency?: string;
  courseType?: string;
  rating?: number;
  instructor?: string;
  educatorAvatar?: string;
  enrollmentCount?: number;
}

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

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  image,
  originalPrice,
  discountPercent,
  currency,
  courseType,
  rating,
  instructor,
  educatorAvatar,
  enrollmentCount,
}) => {
  const isFree = (courseType === 'FREE') || !originalPrice || originalPrice === 0;
  const hasDiscount = !isFree && typeof originalPrice === 'number' && Number(discountPercent) > 0;
  const finalPrice = hasDiscount && originalPrice ? +(originalPrice * (1 - Number(discountPercent) / 100)).toFixed(2) : (originalPrice || 0);

  return (
    <Link
      href={`/courses/${id}`}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer block"
    >
      <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <img src="/images/common/loading.png" alt="Loading" className="w-16 h-16 object-contain opacity-50" />
          </div>
        )}
        {!isFree && (
          <div className="absolute top-2 left-2 z-10 rounded-lg bg-gray-700 p-1">
            <Crown className="w-4 h-4 text-yellow-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">{title}</h4>

        {isFree ? (
          <div className="text-sm flex items-center">
            <span className="font-semibold text-blue-800">Free</span>
            {typeof rating === 'number' && (
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                <span className="font-medium">{Number(rating).toFixed(1)}</span>
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">{formatMoney(originalPrice || 0, currency)}</span>
            )}
            <span className="font-semibold text-blue-800">{formatMoney(finalPrice, currency)}</span>
            {typeof rating === 'number' && (
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-medium">{Number(rating).toFixed(1)}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 min-w-0">
            {educatorAvatar ? (
              <img src={educatorAvatar} alt={instructor || 'Educator'} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              instructor ? (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-700">
                  {instructor.trim().split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}
                </div>
              ) : null
            )}
            {instructor && (
              <p className="text-xs text-gray-600 truncate">{instructor}</p>
            )}
          </div>
          {typeof enrollmentCount === 'number' && (
            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>{enrollmentCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
