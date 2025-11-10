import apiRequest from '@/lib/api';

export interface ProgressLectureResponse {
  id: string;
  title: string;
  orderIndex?: number;
}

export interface ProgressTestResponse {
  id: string;
  title: string;
  orderIndex?: number;
}

export interface ProgressChapterResponse {
  id: string;
  title: string;
  orderIndex?: number;
  lectures: ProgressLectureResponse[];
  tests: ProgressTestResponse[];
}

export interface TestAndLectureCompletedResponse {
  id: number;
  type?: 'lecture' | 'test' | string | null;
  score?: number | null;
  completedAt?: string | null;
  completed?: boolean | null;
  contentId?: string | null;
  currentTime?: number | null; // seconds watched (lecture)
  duration?: number; // seconds
}

export interface ProgressResponse {
  id: string; // courseId
  title: string;
  imageUrl?: string;
  completed: boolean;
  instructorName?: string;
  chapters: ProgressChapterResponse[];
  courseTests: ProgressTestResponse[];
  testAndLectureCompleted: TestAndLectureCompletedResponse[];
}

export const progressService = {
  async getUserProgress(userId: string): Promise<ProgressResponse[]> {
    return apiRequest<ProgressResponse[]>(`/api/progress/user/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
};

export default progressService;
