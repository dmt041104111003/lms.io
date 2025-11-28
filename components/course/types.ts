export interface Course {
  id: string;
  title: string;
  instructor: string;
  rating?: number;
  reviews?: number;
  description?: string;
  category?: string;
  price?: string;
  originalPrice?: number;
  discountPercent?: number;
  currency?: string;
  courseType?: string;
  duration?: string;
  students?: number;
  image?: string;
  educatorAvatar?: string;
  enrollmentCount?: number;
}

