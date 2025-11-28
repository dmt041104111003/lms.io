import apiRequest from "@/lib/api";

export type CourseContentType = "LECTURE" | "TEST";

export interface ProgressCreationRequest {
  type: CourseContentType;
  score?: number;
  lectureId?: number;
  duration?: number;
  testId?: number;
}

export interface ProgressEntity {
  id: number;
  type?: CourseContentType;
  score?: number | null;
  completedAt?: string | null;
  completed?: boolean | null;
  watchedSeconds?: number | null;
  duration?: number | null;
}

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
  type?: "lecture" | "test" | string | null;
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

export interface ActivityResponse {
  type: string;
  progressId: number;
  completedAt: string;
}

export const progressService = {
  async getUserProgress(userId: string): Promise<ProgressResponse[]> {
    return apiRequest<ProgressResponse[]>(
      `/api/progress/user/${encodeURIComponent(userId)}`,
      {
        method: "GET",
      }
    );
  },
  async createProgress(
    userId: string,
    courseId: string,
    data: ProgressCreationRequest
  ): Promise<ProgressEntity> {
    return apiRequest<ProgressEntity>(
      `/api/progress/user/${encodeURIComponent(
        userId
      )}/course/${encodeURIComponent(courseId)}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
  async pingLecture(
    userId: string,
    courseId: string,
    lectureId: number
  ): Promise<ProgressEntity> {
    return this.createProgress(userId, courseId, {
      type: "LECTURE",
      lectureId,
    });
  },
  async completeTest(
    userId: string,
    courseId: string,
    testId: number,
    score?: number
  ): Promise<ProgressEntity> {
    return this.createProgress(userId, courseId, {
      type: "TEST",
      testId,
      score: score ?? 0,
    });
  },
  async updateCourseCompletionStatus(
    userId: string,
    courseId: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      `/api/enrollment/course/${courseId}/user/${userId}/complete`,
      {
        method: "PUT",
      }
    );
  },
  async getUserActivity(userId: string): Promise<ActivityResponse[]> {
    return apiRequest<ActivityResponse[]>(
      `/api/progress/user/${encodeURIComponent(userId)}/activity`,
      {
        method: "GET",
      }
    );
  },
};

export default progressService;
