import apiRequest from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CourseResponse {
  id: string;
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  courseType?: string;
  status?: string;
  draft?: boolean;
  instructorId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseSearchParams {
  keyword?: string;
  courseType?: string;
  minPrice?: number;
  maxPrice?: number;
  tagId?: string;
  page?: number;
  size?: number;
}

export interface CourseCreationRequest {
  title: string;
  description?: string;
  shortDescription?: string;
  requirement?: string;
  videoUrl?: string;
  draft?: boolean;
  discount?: number;
  price?: number;
  currency?: string;
  courseType: 'FREE' | 'PRO';
  discountEndTime?: string;
  policyId?: string;
  instructorId: number;
  chapters?: ChapterRequest[];
  paymentMethods?: PaymentOptionRequest[];
  courseTests?: TestRequest[];
  tagIds?: number[];
}

export interface CourseUpdateRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  requirement?: string;
  imageUrl?: string;
  videoUrl?: string;
  draft?: boolean;
  price?: number;
  currency?: string;
  discount?: number;
  discountEndTime?: string;
}

export interface ChapterRequest {
  id?: number;
  title: string;
  orderIndex?: number;
  lectures?: LectureRequest[];
  tests?: TestRequest[];
}

export interface LectureRequest {
  id?: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  orderIndex?: number;
  resourceUrl?: string;
  resourceType?: string;
  previewFree?: boolean;
}

export interface TestRequest {
  id?: number;
  title: string;
  durationMinutes?: number;
  rule?: string;
  passScore?: number;
  orderIndex?: number;
  questions?: QuestionRequest[];
}

export interface QuestionRequest {
  id?: number;
  content: string;
  score?: number;
  imageUrl?: string;
  orderIndex?: number;
  answers?: AnswerRequest[];
}

export interface AnswerRequest {
  id?: number;
  content: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface PaymentOptionRequest {
  paymentMethodId: number;
}

export interface CourseCreationResponse {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  requirement?: string;
  imageUrl?: string;
  videoUrl?: string;
  draft?: boolean;
  price?: number;
  currency?: string;
  courseType?: string;
  discount?: number;
  discountEndTime?: string;
  policyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDashboardResponse {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  revenue: number;
  totalEnrollments: number;
}

export interface CourseShortResponse {
  id: string;
  title: string;
}

export interface EnrollmentResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  enrolledAt: string;
  status: string;
}

export interface TestDetailResponse {
  id: string;
  title: string;
  description?: string;
  questions?: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface InstructorProfileResponse {
  id: number;
  bio?: string;
  avatar?: string;
  expertise?: string;
  name?: string;
  userId: string;
  socialLinks?: SocialLinkResponse[];
}

export interface SocialLinkResponse {
  id: number;
  platform: string;
  url: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  numOfCourses?: number;
}

// Helper function để gửi multipart form data
async function apiRequestMultipart<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: 'POST',
    body: formData,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (data.code !== 1000) {
      throw new Error(data.message || 'API error');
    }

    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export const instructorService = {
  async getAllCourses(): Promise<CourseResponse[]> {
    return apiRequest<CourseResponse[]>('/api/course', {
      method: 'GET',
    });
  },

  async searchCourses(params: CourseSearchParams = {}): Promise<PageResponse<CourseResponse>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.courseType) queryParams.append('courseType', params.courseType);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.tagId) queryParams.append('tagId', params.tagId);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const endpoint = `/api/course/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PageResponse<CourseResponse>>(endpoint, {
      method: 'GET',
    });
  },

  async getCoursesByProfile(profileId: number, page: number = 0, size: number = 10): Promise<PageResponse<CourseResponse>> {
    return apiRequest<PageResponse<CourseResponse>>(`/api/course/profile/${profileId}?page=${page}&size=${size}`, {
      method: 'GET',
    });
  },

  async getCoursesShortByProfile(profileId: number): Promise<CourseShortResponse[]> {
    return apiRequest<CourseShortResponse[]>(`/api/course/short/profile/${profileId}`, {
      method: 'GET',
    });
  },

  async getCourseById(courseId: string): Promise<CourseResponse> {
    return apiRequest<CourseResponse>(`/api/course/${courseId}`, {
      method: 'GET',
    });
  },

  async createCourse(data: CourseCreationRequest, imageFile?: File): Promise<CourseCreationResponse> {
    const formData = new FormData();
    
    // Add JSON data
    const jsonData = JSON.stringify(data);
    formData.append('data', new Blob([jsonData], { type: 'application/json' }));
    
    // Add image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return apiRequestMultipart<CourseCreationResponse>('/api/course', formData);
  },

  async updateCourse(courseId: string, data: CourseUpdateRequest): Promise<CourseResponse> {
    return apiRequest<CourseResponse>(`/api/course/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(courseId: string): Promise<void> {
    return apiRequest<void>(`/api/course/${courseId}`, {
      method: 'DELETE',
    });
  },

  async publishCourse(courseId: string): Promise<void> {
    return apiRequest<void>(`/api/course/publish/${courseId}`, {
      method: 'POST',
    });
  },

  async getEducatorDashboard(educatorId: number): Promise<CourseDashboardResponse[]> {
    return apiRequest<CourseDashboardResponse[]>(`/api/course/educator/dashboard/${educatorId}`, {
      method: 'GET',
    });
  },

  // Chapter Management
  async createChapter(courseId: string, chapter: ChapterRequest): Promise<void> {
    return apiRequest<void>(`/api/course/${courseId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapter),
    });
  },

  // Lecture Management
  async createLecture(chapterId: number, lecture: LectureRequest): Promise<void> {
    return apiRequest<void>(`/api/course/chapterId=${chapterId}/lectures`, {
      method: 'POST',
      body: JSON.stringify(lecture),
    });
  },

  // Test Management
  async createChapterTest(chapterId: number, test: TestRequest): Promise<void> {
    return apiRequest<void>(`/api/course/chapterId=${chapterId}/tests`, {
      method: 'POST',
      body: JSON.stringify(test),
    });
  },

  async createCourseTest(courseId: string, test: TestRequest): Promise<void> {
    return apiRequest<void>(`/api/course/courseId=${courseId}/tests`, {
      method: 'POST',
      body: JSON.stringify(test),
    });
  },

  async getTestDetail(courseId: string, testId: string): Promise<TestDetailResponse> {
    return apiRequest<TestDetailResponse>(`/api/course/${courseId}/tests/${testId}`, {
      method: 'GET',
    });
  },

  // Enrollment Management
  async getEnrolledStudents(courseId: string): Promise<EnrollmentResponse[]> {
    return apiRequest<EnrollmentResponse[]>(`/api/enrollment/course/${courseId}/enrolled`, {
      method: 'GET',
    });
  },

  // Instructor Profile
              async getInstructorProfileByUserId(userId: string): Promise<InstructorProfileResponse> {
                return apiRequest<InstructorProfileResponse>(`/api/instructor-profiles/user/${userId}`, {
                  method: 'GET',
                });
              },

              // Tag Management
              async getAllTags(): Promise<TagResponse[]> {
                return apiRequest<TagResponse[]>('/api/tags', {
                  method: 'GET',
                });
              },
            };

            export default instructorService;

