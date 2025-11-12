import apiRequest, { apiRequestFull, ApiResponse } from '@/lib/api';

export interface FeedbackRequest {
  rate?: number;
  content?: string;
}

export interface FeedbackResponse {
  id: number;
  rate: number;
  content: string;
  createdAt: string;
  status: 'VISIBLE' | 'HIDDEN' | string;
  user?: { id: string; fullName?: string } | null;
}

export interface FeedbackItem {
  id: number;
  rate: number;
  content: string;
  createdAt: string;
  fullName?: string;
  avatar?: string;
  status?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const feedbackService = {
  async add(courseId: string, payload: FeedbackRequest): Promise<FeedbackResponse> {
    return apiRequest<FeedbackResponse>(`/api/feedbacks/course/${encodeURIComponent(courseId)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async addWithMessage(courseId: string, payload: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> {
    return apiRequestFull<FeedbackResponse>(`/api/feedbacks/course/${encodeURIComponent(courseId)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getByCoursePaged(courseId: string, page = 0, size = 8, isAdmin = false): Promise<PageResponse<FeedbackItem>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (isAdmin) params.set('isAdmin', 'true');
    return apiRequest<PageResponse<FeedbackItem>>(`/api/feedbacks/course/${encodeURIComponent(courseId)}/paged?${params.toString()}`, {
      method: 'GET',
    });
  },
};

export default feedbackService;
