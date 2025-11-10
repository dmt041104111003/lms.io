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
  sort?: 'popular' | 'new';
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
  courseType: 'FREE' | 'PAID';
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
  paymentMethodId: string;
  receiverAddress: string;
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

export interface EnrollmentDashboardResponse {
  id: string | number;
  enrolledAt?: string;
  completed?: boolean;
  price?: number;
  user?: {
    id: string;
    name: string;
  };
  progress?: any[];
}

export interface CourseDashboardResponse {
  id: string;
  title: string;
  createdAt?: string;
  totalLectures?: number;
  totalTests?: number;
  enrollments?: EnrollmentDashboardResponse[];
  // Computed fields
  courseId?: string;
  courseTitle?: string;
  totalStudents?: number;
  revenue?: number;
  totalEnrollments?: number;
}

export interface CourseShortResponse {
  id: string;
  title: string;
}

export interface CourseShortInformationResponse {
  id: string;
  title: string;
  imageUrl?: string;
  draft: boolean;
  courseType?: string;
  price?: number;
  discount?: number;
}

export interface MediaItem {
  id: number;
  title?: string;
  description?: string;
  url: string;
  link?: string;
  orderIndex?: number;
  type?: string;
}

export interface EnrollmentResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  enrolledAt: string;
  status: string;
}

export interface EnrollCourseRequest {
  userId: string;
  courseId: string;
  coursePaymentMethodId?: number;
  priceAda?: number;
  senderAddress?: string;
  txHash?: string;
}

export interface PaymentHistoryResponse {
  id: string;
  courseId?: string;
  courseTitle?: string;
  amount?: number;
  createdAt?: string;
  status?: string;
}

export interface TestDetailResponse {
  id: string;
  title: string;
  description?: string;
  questions?: QuestionResponse[];
}

export interface QuestionResponse {
  id: string | number;
  content: string;
  imageUrl?: string;
  orderIndex?: number;
  score?: number;
  answers?: AnswerResponse[];
}

export interface AnswerResponse {
  id: string | number;
  content: string;
  isCorrect?: boolean;
  correct?: boolean;
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
  platform?: string;
  name?: string;
  url: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  numOfCourses?: number;
}

export interface TopInstructorResponse {
  id: number;
  name: string;
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

  async getCoursesByTag(tagId: string, page: number = 0, size: number = 10): Promise<PageResponse<CourseResponse>> {
    const endpoint = `/api/course/by-tag?tagId=${encodeURIComponent(tagId)}&page=${page}&size=${size}`;
    return apiRequest<PageResponse<CourseResponse>>(endpoint, {
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
    if (params.sort) queryParams.append('sort', params.sort);
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

  async getMyCoursesAll(page: number = 0, size: number = 10): Promise<PageResponse<CourseResponse>> {
    const res = await apiRequest<PageResponse<CourseShortInformationResponse>>(`/api/course/profile/me/all?page=${page}&size=${size}`, {
      method: 'GET',
    });
    // Map to CourseResponse for UI compatibility
    return {
      ...res,
      content: (res.content || []).map((c) => ({
        id: c.id,
        title: c.title,
        imageUrl: c.imageUrl,
        draft: c.draft,
        courseType: c.courseType,
        price: c.price,
        status: c.draft ? 'DRAFT' : 'PUBLISHED',
      } as CourseResponse)),
    };
  },

  async getInstructorProfileById(id: number): Promise<InstructorProfileResponse> {
    return apiRequest<InstructorProfileResponse>(`/api/instructor-profiles/${id}`, {
      method: 'GET',
    });
  },

  async getSlides(): Promise<MediaItem[]> {
    return apiRequest<MediaItem[]>(`/api/media?type=SLIDE`, {
      method: 'GET',
    });
  },

  async getCoursesShortByProfile(profileId: number): Promise<CourseShortResponse[]> {
    return apiRequest<CourseShortResponse[]>(`/api/course/short/profile/${profileId}`, {
      method: 'GET',
    });
  },

  async getCourseById(courseId: string, instructorId?: number): Promise<CourseResponse> {
    const url = instructorId 
      ? `/api/course/${courseId}?instructorId=${instructorId}`
      : `/api/course/${courseId}`;
    return apiRequest<CourseResponse>(url, {
      method: 'GET',
    });
  },

  async createCourse(data: CourseCreationRequest, imageFile?: File): Promise<CourseCreationResponse> {
    const formData = new FormData();
    
    // Add JSON data
    // Transform UI shapes to backend DTO shapes
    const transformAnswers = (answers?: AnswerRequest[]) =>
      (answers || []).map(a => ({
        id: a.id,
        content: a.content,
        correct: a.isCorrect,
        orderIndex: a.orderIndex,
      }));

    const transformQuestions = (questions?: QuestionRequest[]) =>
      (questions || []).map(q => ({
        id: q.id,
        content: q.content,
        score: q.score,
        imageUrl: q.imageUrl,
        orderIndex: q.orderIndex,
        answers: transformAnswers(q.answers),
      }));

    const transformTests = (tests?: TestRequest[]) =>
      (tests || []).map(t => ({
        id: t.id,
        title: t.title,
        durationMinutes: t.durationMinutes,
        rule: t.rule,
        passScore: t.passScore,
        orderIndex: t.orderIndex,
        questions: transformQuestions(t.questions),
      }));

    const normalizeDateTime = (s?: string) => {
      if (!s) return undefined;
      if (s.includes('T')) {
        // 'yyyy-MM-ddTHH:mm' -> add seconds
        return s.length === 16 ? `${s}:00` : s;
      }
      // Fallback: parse and format as ISO local without timezone
      try {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
      } catch {}
      return s;
    };

    const payload: any = {
      ...data,
      paymentMethods: (data.paymentMethods || []).map(pm => ({
        paymentMethodId: pm.paymentMethodId,
        receiverAddress: pm.receiverAddress,
      })),
      discountEndTime: normalizeDateTime(data.discountEndTime),
      courseTests: transformTests(data.courseTests) as any,
      chapters: (data.chapters || []).map(ch => ({
        ...(ch as any),
        tests: transformTests(ch.tests) as any,
      })) as any,
    };

    const jsonData = JSON.stringify(payload);
    formData.append('data', new Blob([jsonData], { type: 'application/json' }));
    
    // Add image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return apiRequestMultipart<CourseCreationResponse>('/api/course', formData);
  },

  async updateCourse(courseId: string, data: CourseUpdateRequest, imageFile?: File): Promise<CourseResponse> {
    const formData = new FormData();
    
    const jsonData = JSON.stringify(data);
    formData.append('data', new Blob([jsonData], { type: 'application/json' }));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const url = `${API_BASE_URL}/api/course/${courseId}`;
    
    const config: RequestInit = {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      if (responseData.code !== 1000) {
        throw new Error(responseData.message || 'API error');
      }

      return responseData.result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    return apiRequest<void>(`/api/course/${courseId}`, {
      method: 'DELETE',
    });
  },

  async publishCourse(courseId: string): Promise<void> {
    return apiRequest<void>(`/api/course/publish/${courseId}`, {
      method: 'PUT'
    });
  },

  async unpublishCourse(courseId: string): Promise<void> {
    return apiRequest<void>(`/api/course/unpublish/${courseId}`, {
      method: 'PUT'
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

  async enrollCourse(request: EnrollCourseRequest): Promise<EnrollmentResponse> {
    return apiRequest<EnrollmentResponse>('/api/enrollment', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getPaymentHistoryByUser(userId: string): Promise<PaymentHistoryResponse[]> {
    return apiRequest<PaymentHistoryResponse[]>(`/api/enrollment/payment-history/user/${userId}`, {
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
  async getTopInstructors(limit: number = 8): Promise<TopInstructorResponse[]> {
    return apiRequest<TopInstructorResponse[]>(`/api/instructor-profiles/top?limit=${limit}`, {
      method: 'GET',
    });
  },
  async getAllTags(): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>('/api/tags', {
      method: 'GET',
    });
  },
};

export default instructorService;

